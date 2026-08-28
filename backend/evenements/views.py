"""Endpoints REST événements — contrat doc 10 §2, serveur revalide TOUT.

Règles serveur : création aîné|admin seulement (garde sur la classe du compte
— convention « L2/L3/… » en préfixe de `classe`), capacité stricte (409 si
course au dernier place), désinscription bloquée à H-2h (422), discussion
réservée aux inscrits (réutilise fil.Commentaire), annonce « détails changés »
publiée sur le Fil (doc 09) côté vue PATCH.
"""

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from config.exceptions import ErreurConflit, ErreurValidation

from .models import Evenement
from .serializers import EvenementSerializer

TAILLE_PAGE = 9
# Comparé en minuscules aux deux bouts (piège t4b : "l3 réseaux" vs "L3").
NIVEAUX_AINE = ("l2", "l3", "m1", "m2", "alumni")


def _est_aine(user):
    """Aîné = niveau L2+ ou alumni (RG7/RG10) OU admin plateforme.

    Convention seeds/plateforme : le niveau vit en préfixe de `classe`
    (« L2 Digitalisation », « alumni 2024 »…).
    """
    if user.is_staff:
        return True
    return user.classe.strip().lower().startswith(NIVEAUX_AINE)


def _page(resultats, request):
    try:
        page = max(1, int(request.query_params.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    debut = (page - 1) * TAILLE_PAGE
    return {"count": resultats.count(), "results": list(resultats[debut : debut + TAILLE_PAGE])}


def _parse_date_heure(valeur):
    dt = parse_datetime(valeur or "")
    if dt is None:
        raise ErreurValidation("dateHeure invalide (ISO 8601 attendu).")
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_default_timezone())
    return dt


class EvenementsView(APIView):
    """GET ?scope=a_venir|passes&page=1 — {count, results} chronologique."""

    def get(self, request):
        scope = request.query_params.get("scope", "a_venir")
        base = Evenement.objects.select_related("organisateur").prefetch_related("inscriptions")
        if scope == "passes":
            base = base.filter(date_heure__lt=timezone.now()).order_by("-date_heure")
        else:
            base = base.filter(date_heure__gte=timezone.now(), annule=False)
        donnees = _page(base, request)
        donnees["results"] = EvenementSerializer(
            donnees["results"], many=True, context={"request": request}
        ).data
        return Response(donnees)

    def post(self, request):
        if not _est_aine(request.user):
            raise PermissionDenied("Seuls les Aînés (ou l'admin) créent des événements.")
        corps = request.data or {}
        titre = (corps.get("titre") or "").strip()
        description = (corps.get("description") or "").strip()
        lieu = (corps.get("lieu") or "").strip()
        en_ligne = bool(corps.get("enLigne"))
        capacite = corps.get("capaciteMax", 15)

        if not 5 <= len(titre) <= 90:
            raise ErreurValidation("Le titre doit compter entre 5 et 90 caractères.")
        if not 30 <= len(description) <= 1500:
            raise ErreurValidation("La description doit compter entre 30 et 1500 caractères.")
        try:
            capacite = int(capacite)
        except (TypeError, ValueError):
            capacite = 0
        if not 2 <= capacite <= 100:
            raise ErreurValidation("La capacité doit être comprise entre 2 et 100.")
        if not en_ligne and not lieu:
            raise ErreurValidation("Le lieu est requis pour un événement en présentiel.")
        date_heure = _parse_date_heure(corps.get("dateHeure"))
        if date_heure <= timezone.now():
            raise ErreurValidation("La date doit être dans le futur.")

        evenement = Evenement.objects.create(
            type=(corps.get("type") or "").strip()[:40],
            titre=titre,
            description=description,
            organisateur=request.user,
            date_heure=date_heure,
            lieu="" if en_ligne else lieu,
            en_ligne=en_ligne,
            capacite_max=capacite,
        )
        return Response(
            EvenementSerializer(evenement, context={"request": request}).data, status=201
        )


class EvenementDetailView(APIView):
    """GET /{id}/ — fiche complète."""

    def get(self, request, pk):
        evenement = get_object_or_404(
            Evenement.objects.select_related("organisateur").prefetch_related("inscriptions"),
            pk=pk,
        )
        return Response(EvenementSerializer(evenement, context={"request": request}).data)


class InscriptionView(APIView):
    """POST /{id}/inscription/ — toggle : 201 si ajout, 200 si retiré.

    Désinscription bloquée à H-2h ; retrait du ORGANISATEUR interdit (doc 10
    §8 n°5 : l'organisateur reste visible dans la liste des participants).
    Capacité stricte : le dernier place part en 409 si un autre clic passe avant.
    """

    def post(self, request, pk):
        evenement = get_object_or_404(Evenement, pk=pk)
        if evenement.annule:
            raise ErreurValidation("Cet événement est annulé.")
        # Related manager DIRECT — `.all().create()` (queryset nu) perd le lien
        # FK → NOT NULL constraint sur evenement_id (piège t4b, testé rouge).
        inscriptions = evenement.inscriptions
        existe = inscriptions.filter(participant=request.user).first()

        if existe:
            if evenement.organisateur_id == request.user.pk:
                raise ErreurValidation(
                    "L'organisateur ne peut pas quitter son propre événement."
                )
            if evenement.date_heure - timezone.now() <= timezone.timedelta(hours=2):
                raise ErreurValidation(
                    "Désinscription impossible à moins de 2 heures du début — "
                    "contacte l'organisateur."
                )
            existe.delete()
            return Response({"ok": True, "inscrit": False})
        if inscriptions.count() >= evenement.capacite_max:
            raise ErreurConflit("Événement complet.")
        inscriptions.create(participant=request.user)
        return Response({"ok": True, "inscrit": True}, status=201)


class EvenementMessagesView(APIView):
    """GET/POST /{id}/messages/ — discussion = fil.Commentaire (doc 10 §2).

    `parentId` du commentaire pointe vers une publication fictive par
    convention : on n'expose ici que des messages RACINE (parentId=None),
    la lecture front traite la discussion comme un fil plat. Écriture réservée
    aux inscrits ; lecture ouverte à tous les connectés.
    """

    def get(self, request, pk):
        evenement = get_object_or_404(Evenement, pk=pk)
        from fil.serializers import CommentaireSerializer

        messages = evenement.messages_discussion().select_related("auteur")
        return Response(
            CommentaireSerializer(messages, many=True, context={"request": request}).data
        )

    def post(self, request, pk):
        evenement = get_object_or_404(Evenement, pk=pk)
        if not evenement.inscriptions.filter(participant=request.user).exists():
            raise PermissionDenied("Seuls les inscrits participent à la discussion.")
        from fil.models import Commentaire
        from fil.serializers import CommentaireSerializer

        contenu = ((request.data or {}).get("contenu") or "").strip()
        if not 2 <= len(contenu) <= 600:
            raise ErreurValidation("Le message doit compter entre 2 et 600 caractères.")
        # Créé via la publication porteuse (JAMAIS le queryset filtré — un
        # .create() dessus ignorerait publication/parent).
        porteuse = evenement.publication_ou_creee()
        message = Commentaire.objects.create(
            publication=porteuse, auteur=request.user, contenu=contenu
        )
        return Response(
            CommentaireSerializer(message, context={"request": request}).data, status=201
        )


class EvenementPatchView(APIView):
    """PATCH /{id}/ — organisateur|admin seulement ; annulation → annonce Fil."""

    def patch(self, request, pk):
        evenement = get_object_or_404(Evenement, pk=pk)
        if evenement.organisateur_id != request.user.pk and not request.user.is_staff:
            raise PermissionDenied("Seul l'organisateur (ou l'admin) modifie l'événement.")
        corps = request.data or {}
        champ_annule = corps.get("annule")

        if "titre" in corps:
            titre = (corps.get("titre") or "").strip()
            if not 5 <= len(titre) <= 90:
                raise ErreurValidation("Le titre doit compter entre 5 et 90 caractères.")
            evenement.titre = titre
        if "description" in corps:
            description = (corps.get("description") or "").strip()
            if not 30 <= len(description) <= 1500:
                raise ErreurValidation("La description doit compter entre 30 et 1500 caractères.")
            evenement.description = description
        if "dateHeure" in corps and corps.get("dateHeure"):
            evenement.date_heure = _parse_date_heure(corps.get("dateHeure"))
        if "lieu" in corps:
            evenement.lieu = (corps.get("lieu") or "").strip()
        if champ_annule is not None:
            evenement.annule = bool(champ_annule)
        evenement.save()

        # doc 10 §1 : « je peux leur envoyer un message collectif via l'annonce
        # automatique sur le Fil quand details changent » — publication type
        # annonce au nom de l'organisateur, idempotence par événement.
        if champ_annule is not None:
            self._annoncer_changement(request, evenement)
        return Response(EvenementSerializer(evenement, context={"request": request}).data)

    @staticmethod
    def _annoncer_changement(request, evenement):
        from fil.models import Publication

        Publication.objects.create(
            type=Publication.Type.ANNONCE,
            auteur=request.user,
            contenu=(
                f"Changement sur l'événement « {evenement.titre} » "
                f"({evenement.date_heure:%d/%m à %H:%M}) — vérifie la fiche, "
                "il a été mis à jour ou annulé."
            ),
        )


class EvenementParticipantsView(APIView):
    """GET /{id}/participants/ — liste des inscrits (organisateur visible même complet)."""

    def get(self, request, pk):
        evenement = get_object_or_404(Evenement, pk=pk)
        from comptes.serializers import UtilisateurLegereSerializer

        participants = evenement.inscriptions.select_related("participant").order_by(
            "date_inscription"
        )
        return Response(
            {
                "count": participants.count(),
                "results": [
                    UtilisateurLegereSerializer(i.participant).data for i in participants
                ],
            }
        )
