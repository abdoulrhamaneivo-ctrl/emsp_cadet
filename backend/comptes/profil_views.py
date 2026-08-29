"""Profil courant (doc 11) — PATCH /api/me/, visibilité annuaire, photo,
suppression de compte self-serve (double confirmation par prénom)."""

from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from comptes.serializers import (
    ProfilMoiSerializer,
    _niveau_de_classe,
)
from config.exceptions import ErreurValidation


class MoiView(APIView):
    """GET/PATCH /api/me/ — profil courant (shape User v2 doc 11 §2)."""

    def get(self, request):
        return Response(ProfilMoiSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfilMoiSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        try:
            serializer.is_valid(raise_exception=True)
        except DRFValidationError as erreur:
            # Contrat doc 21 : les règles MÉTIER (RG7…) sortent en 422, pas en
            # 400 DRF — le front traite le 422 comme message francisé direct.
            raise ErreurValidation(erreur.detail) from erreur

        # RG7 — une PROMOTION L1→L2 ne doit jamais ouvrir la candidature en
        # silence : après enregistrement, on signale l'éligibilité au front
        # (toast-action doc 11 §5). Un PATCH qui OUVRE en L1 reste 422
        # (validateur serializer), un PATCH qui change le niveau est accepté.
        ancien_niveau = request.user.niveau_etude
        serializer.save()
        promotion = (
            ancien_niveau == "L1"
            and serializer.instance.niveau_etude in ("L2", "L3", "M1", "M2")
        )
        donnees = ProfilMoiSerializer(serializer.instance).data
        donnees["promotionDisponible"] = promotion
        return Response(donnees)


class VisibiliteAnnuaireView(APIView):
    """GET /api/me/visibilite-annuaire/ — {visible, motifs} checklist 1:1.

    Motifs doc 11 §2 n°7 (dans l'ordre d'affichage) : candidature ouverte,
    photo, ambitions ≥ 3, projets ≥ 1, points forts ≥ 2, points faibles ≥ 1.
    """

    def get(self, request):
        utilisateur = request.user
        niveaux = utilisateur.ambitions or []
        projets = utilisateur.projets or []
        forts = utilisateur.points_forts or []
        faibles = utilisateur.points_faibles or []
        niveau = utilisateur.niveau_etude or _niveau_de_classe(utilisateur.classe)

        conditions = [
            ("candidature", utilisateur.candidature_aine_ouverte),
            ("photo", bool(utilisateur.photo)),
            ("ambitions", len(niveaux) >= 3),
            ("projets", len(projets) >= 1),
            ("pointsForts", len(forts) >= 2),
            ("pointsFaibles", len(faibles) >= 1),
        ]
        # En L1 la candidature n'est pas un « motif manquant » : c'est le
        # parcours (doc 11 §1 — pas une punition). Visible=False systématique.
        if niveau == "L1":
            conditions = [c for c in conditions if c[0] != "candidature"]
        motifs = [cle for cle, ok in conditions if not ok]
        return Response({"visible": not motifs, "motifs": motifs})


class PreferencesIAView(APIView):
    """GET /api/me/preferences-ia/ — préférences IA (doc 17 §3 / RG12.4)."""

    def get(self, request):
        prefs = request.user.preferences_ia or {}
        return Response({
            "matchingEnrichi": bool(prefs.get("matchingEnrichi")),
            "copilot": bool(prefs.get("copilot")),
        })


class PhotoMoiView(APIView):
    """POST /api/me/photo/ — multipart {photo} ≤ 5 Mo, jpg/png/webp.

    Le crop carré 400×400 est fait côté client (doc 11 §2 n°6) ; le serveur
    revalide taille et type.
    """

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        fichier = request.FILES.get("photo")
        if fichier is None:
            raise ErreurValidation("Fichier photo manquant.")
        if fichier.size > 5 * 1024 * 1024:
            raise ErreurValidation("Photo : 5 Mo maximum.")
        if (fichier.content_type or "") not in ("image/jpeg", "image/png", "image/webp"):
            raise ErreurValidation("Format accepté : JPG, PNG ou WebP.")
        request.user.photo = fichier
        request.user.save(update_fields=["photo"])
        return Response(
            {"photoUrl": request.user.photo.url}, status=status.HTTP_201_CREATED
        )


class SupprimerCompteView(APIView):
    """DELETE /api/me/compte/ {confirmationPrenom} — self-serve (cahier §6).

    Double étape : le prénom doit correspondre exactement. L'anonymisation des
    avis publiés est documentée dans la modale front avant confirmation.
    """

    def delete(self, request):
        prenom = ((request.data or {}).get("confirmationPrenom") or "").strip()
        if not prenom or prenom.lower() != (request.user.prenom or "").strip().lower():
            raise ErreurValidation(
                "Confirmation incorrecte — saisis ton prénom exactement."
            )
        with transaction.atomic():
            # Anonymisation de l'empreinte avant suppression en cascade.
            request.user.email = f"supprime-{request.user.pk}@emsp.int"
            request.user.is_active = False
            request.user.save(update_fields=["email", "is_active"])
        return Response({"ok": True})
