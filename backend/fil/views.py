"""Endpoints REST du Fil — contrat doc 09 §2, serveur revalide TOUT.

Règles serveur : 1 question/jour max (anti-spam), édition/suppression par
l'auteur tant que la publication n'a AUCUN commentaire (409 sinon),
réactions en toggle (unique par personne/code), réponses apllies niveau 1
(parent remonté au parent racine), publication signalée = masquée pour tous
(l'auteur voit `masquee: true` → panneau « en attente de modération »).
"""

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from config.exceptions import ErreurConflit, ErreurValidation

from .models import Commentaire, Publication, Reaction, Signalement
from .serializers import CommentaireSerializer, PublicationSerializer

TAILLE_PAGE = 10
CODES_REACTION = {"bravo", "merci", "utile"}
RAISONS = {"spam", "harcelement", "faux", "info"}


def _page(resultats, request):
    """Pagination `page` simple (1-based) — {count, results} (contrat doc 09)."""
    try:
        page = max(1, int(request.query_params.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    debut = (page - 1) * TAILLE_PAGE
    return {
        "count": resultats.count(),
        "results": list(resultats[debut : debut + TAILLE_PAGE]),
    }


def _debut_jour():
    return timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)


class PublicationsView(APIView):
    """GET ?type=annonce|question|succes&page=1 — feed anti-chronologique."""

    def get(self, request):
        publications = (
            Publication.objects.select_related("auteur")
            .prefetch_related("reactions", "commentaires")
            .filter(Q(masquee=False) | Q(auteur=request.user))
        )
        type_filtre = request.query_params.get("type")
        if type_filtre:
            if type_filtre not in Publication.Type.values:
                raise ErreurValidation("Type de publication inconnu.")
            publications = publications.filter(type=type_filtre)
        donnees = _page(publications, request)
        donnees["results"] = PublicationSerializer(
            donnees["results"], many=True, context={"request": request}
        ).data
        return Response(donnees)

    def post(self, request):
        corps = request.data or {}
        contenu = (corps.get("contenu") or "").strip()
        type_pub = corps.get("type")
        if type_pub not in Publication.Type.values:
            raise ErreurValidation("Type requis : annonce, question ou succes.")
        if not 10 <= len(contenu) <= 1200:
            raise ErreurValidation("La publication doit compter entre 10 et 1200 caractères.")
        # Anti-spam : 1 question/jour max (le front affiche le compteur restant).
        if type_pub == Publication.Type.QUESTION:
            deja = Publication.objects.filter(
                auteur=request.user,
                type=Publication.Type.QUESTION,
                date_creation__gte=_debut_jour(),
            ).exists()
            if deja:
                raise ErreurConflit("Une question par jour maximum — retombe demain.")
        publication = Publication.objects.create(
            auteur=request.user, type=type_pub, contenu=contenu
        )
        return Response(
            PublicationSerializer(publication, context={"request": request}).data, status=201
        )


class PublicationDetailView(APIView):
    """PATCH/DELETE — auteur only, tant que nbCommentaires === 0 (409 sinon)."""

    def _publication(self, request, pk):
        return get_object_or_404(Publication, pk=pk)

    def patch(self, request, pk):
        publication = self._publication(request, pk)
        if publication.auteur_id != request.user.pk:
            raise PermissionDenied("Seul l'auteur peut modifier sa publication.")
        if publication.commentaires.exists():
            raise ErreurConflit("Publication déjà commentée — elle n'est plus modifiable.")
        contenu = (request.data or {}).get("contenu", "").strip()
        if not 10 <= len(contenu) <= 1200:
            raise ErreurValidation("La publication doit compter entre 10 et 1200 caractères.")
        publication.contenu = contenu
        publication.save(update_fields=["contenu"])
        return Response(PublicationSerializer(publication, context={"request": request}).data)

    def delete(self, request, pk):
        publication = self._publication(request, pk)
        if publication.auteur_id != request.user.pk:
            raise PermissionDenied("Seul l'auteur peut supprimer sa publication.")
        if publication.commentaires.exists():
            raise ErreurConflit("Publication déjà commentée — suppression refusée (409).")
        publication.delete()
        return Response({"ok": True})


class ReactionsView(APIView):
    """POST /{id}/reactions/ {code} — toggle : 201 si ajout, 200 si retiré."""

    def post(self, request, pk):
        publication = get_object_or_404(Publication, pk=pk)
        code = (request.data or {}).get("code")
        if code not in CODES_REACTION:
            raise ErreurValidation("Réaction inconnue (bravo, merci, utile).")
        existante = Reaction.objects.filter(
            publication=publication, utilisateur=request.user, code=code
        ).first()
        if existante:
            existante.delete()
            return Response({"ok": True, "maReaction": None})
        Reaction.objects.create(publication=publication, utilisateur=request.user, code=code)
        return Response({"ok": True, "maReaction": code}, status=201)


class CommentairesView(APIView):
    """GET ?page= (chronologique) / POST {contenu, parentId?} — réponses niveau 1."""

    def _publication(self, request, pk):
        return get_object_or_404(Publication, pk=pk)

    def get(self, request, pk):
        publication = self._publication(request, pk)
        commentaires = publication.commentaires.select_related("auteur", "parent")
        donnees = _page(commentaires, request)
        donnees["results"] = CommentaireSerializer(
            donnees["results"], many=True, context={"request": request}
        ).data
        return Response(donnees)

    def post(self, request, pk):
        publication = self._publication(request, pk)
        corps = request.data or {}
        contenu = (corps.get("contenu") or "").strip()
        cle = (corps.get("idempotencyKey") or "").strip()
        if not 2 <= len(contenu) <= 600:
            raise ErreurValidation("Le commentaire doit compter entre 2 et 600 caractères.")
        if not cle:
            raise ErreurValidation("idempotencyKey requis.")
        deja = Commentaire.objects.filter(
            publication=publication, auteur=request.user, idempotency_key=cle
        ).first()
        if deja:
            # Replay idempotent : le MÊME message, 201 comme la création
            # (précédent messagerie doc 21 — le front ne distingue pas).
            return Response(
                CommentaireSerializer(deja, context={"request": request}).data, status=201
            )

        # Un seul niveau : une réponse à une réponse remonte au parent racine.
        parent = Commentaire.objects.filter(pk=corps.get("parentId")).first()
        if parent and parent.publication_id != publication.pk:
            raise ErreurValidation("Commentaire parent hors de cette publication.")
        if parent and parent.parent_id is not None:
            parent = parent.parent

        with transaction.atomic():
            commentaire = Commentaire.objects.create(
                publication=publication,
                auteur=request.user,
                parent=parent,
                contenu=contenu,
                idempotency_key=cle,
            )
        return Response(
            CommentaireSerializer(commentaire, context={"request": request}).data, status=201
        )


class CommentaireDetailView(APIView):
    """DELETE /api/commentaires/{id}/ — auteur OU admin (doc 09 §2)."""

    def delete(self, request, pk):
        commentaire = get_object_or_404(Commentaire, pk=pk)
        if commentaire.auteur_id != request.user.pk and not request.user.is_staff:
            raise PermissionDenied("Suppression réservée à l'auteur ou à l'admin.")
        commentaire.delete()
        return Response({"ok": True})


class SignalementsView(APIView):
    """POST /api/signalements/ {contentType: publication|commentaire, objectId, raison}.

    Effet immédiat : la cible passe `masquee` → absente du feed des autres,
    panneau « en attente de modération » chez l'auteur (doc 09 §5).
    """

    def post(self, request):
        corps = request.data or {}
        type_contenu = corps.get("contentType")
        cible_id = corps.get("objectId")
        raison = corps.get("raison")
        if raison not in RAISONS:
            raise ErreurValidation("Raison requise : spam, harcelement, faux ou info.")
        if type_contenu == "publication":
            cible = Publication.objects.filter(pk=cible_id).first()
            if cible is None:
                raise ErreurValidation("Publication inconnue.")
            Signalement.objects.create(
                publication=cible, signalant=request.user, raison=raison
            )
            cible.masquee = True
            cible.save(update_fields=["masquee"])
        elif type_contenu == "commentaire":
            cible = Commentaire.objects.filter(pk=cible_id).first()
            if cible is None:
                raise ErreurValidation("Commentaire inconnu.")
            Signalement.objects.create(
                commentaire=cible, signalant=request.user, raison=raison
            )
            cible.publication.masquee = True
            cible.publication.save(update_fields=["masquee"])
        else:
            raise ErreurValidation("contentType requis : publication ou commentaire.")
        return Response({"ok": True}, status=201)


class QuestionsRestantesView(APIView):
    """GET /api/publications/questions-restantes/ — compteur anti-spam du composeur.

    Déclaré AVANT `<int:pk>/` dans les urls (piège T3a : premier match gagne).
    """

    def get(self, request):
        deja = Publication.objects.filter(
            auteur=request.user,
            type=Publication.Type.QUESTION,
            date_creation__gte=_debut_jour(),
        ).exists()
        return Response({"restantes": 0 if deja else 1})
