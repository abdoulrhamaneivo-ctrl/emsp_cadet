"""Endpoints REST RDV — machine à états doc 06, serveur revalide TOUT (doc 21 §3.2)."""

from datetime import timedelta

from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from comptes.models import Binome, User
from config.exceptions import ErreurValidation

from .models import RendezVous
from .serializers import RendezVousSerializer

STATUTS_A_VENIR = ["propose", "confirme", "contre_propose"]
STATUTS_CLOS = ["passe", "refuse", "annule"]


def _rdv_autorise(request, pk):
    """404 si inconnu, et seulement MES rendez-vous (organisateur ou invité)."""
    return get_object_or_404(
        RendezVous,
        models.Q(organisateur=request.user) | models.Q(invite=request.user),
        pk=pk,
    )


def _parse_date_heure(valeur):
    """ISO 8601 ; RG doc 06 : > now + 5 min, sinon 422."""
    dt = parse_datetime(valeur or "")
    if dt is None:
        raise ErreurValidation("dateHeure invalide (ISO 8601 attendu).")
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_default_timezone())
    if dt <= timezone.now() + timedelta(minutes=5):
        raise ErreurValidation("Le créneau doit être au moins 5 minutes dans le futur.")
    return dt


class RendezVousListView(APIView):
    """GET ?scope=a_venir|passes — {count, results} chronologique asc."""

    def get(self, request):
        scope = request.query_params.get("scope", "a_venir")
        maintenant = timezone.now()
        rdvs = (
            RendezVous.objects.filter(
                models.Q(organisateur=request.user) | models.Q(invite=request.user)
            )
            .select_related("organisateur", "invite")
            .order_by("date_heure")
        )
        if scope == "passes":
            rdvs = rdvs.filter(
                models.Q(date_heure__lt=maintenant) | models.Q(statut__in=STATUTS_CLOS)
            )
        else:
            rdvs = rdvs.filter(
                date_heure__gte=maintenant, statut__in=STATUTS_A_VENIR
            )
        serializer = RendezVousSerializer(rdvs, many=True, context={"request": request})
        return Response({"count": len(serializer.data), "results": serializer.data})

    def post(self, request):
        """Proposition → 201 `propose` ; hors binôme : 403 (doc 06 §2)."""
        corps = request.data or {}
        invite_id = corps.get("inviteId")
        titre = (corps.get("titre") or "").strip()
        mode = corps.get("mode")
        lieu = (corps.get("lieu") or "").strip()

        if not invite_id or not titre or not mode:
            raise ErreurValidation("Champs requis : inviteId, titre, dateHeure, mode.")
        invite = User.objects.filter(pk=invite_id).first()
        if invite is None or not Binome.binome_actif_existe(request.user, invite):
            raise PermissionDenied("Invité introuvable ou hors binôme.")
        if mode == RendezVous.Mode.PRESENTIEL and not lieu:
            raise ErreurValidation("Le lieu est requis pour un rendez-vous en présentiel.")
        date_heure = _parse_date_heure(corps.get("dateHeure"))

        rdv = RendezVous.objects.create(
            organisateur=request.user,
            invite=invite,
            titre=titre,
            description=(corps.get("description") or "").strip() or None,
            date_heure=date_heure,
            lieu=lieu,
            mode=mode,
        )
        serializer = RendezVousSerializer(rdv, context={"request": request})
        return Response(serializer.data, status=201)


class ProchainView(APIView):
    """GET /api/rendez-vous/prochain/ — bannière J-1. Déclaré AVANT :id/ (piège T3a)."""

    def get(self, request):
        maintenant = timezone.now()
        rdv = (
            RendezVous.objects.filter(
                models.Q(organisateur=request.user) | models.Q(invite=request.user),
                statut=RendezVous.Statut.CONFIRME,
                rappel_vu=False,
                date_heure__gt=maintenant,
                date_heure__lte=maintenant + timedelta(hours=48),
            )
            .order_by("date_heure")
            .first()
        )
        data = RendezVousSerializer(rdv, context={"request": request}).data if rdv else None
        return Response({"result": data})


class RendezVousDetailView(APIView):
    """GET /api/rendez-vous/{id}/ — page détail (doc 06 §5)."""

    def get(self, request, pk):
        rdv = _rdv_autorise(request, pk)
        return Response(RendezVousSerializer(rdv, context={"request": request}).data)


class RepondreView(APIView):
    """PATCH /{id}/repondre/ {decision: confirme|refuse} — qui tranche ? (doc 06)"""

    def patch(self, request, pk):
        rdv = _rdv_autorise(request, pk)
        if rdv.statut == RendezVous.Statut.PROPOSE and request.user.pk != rdv.invite_id:
            raise PermissionDenied("Seul l'invité peut répondre à une proposition.")
        if (
            rdv.statut == RendezVous.Statut.CONTRE_PROPOSE
            and request.user.pk != rdv.organisateur_id
        ):
            raise PermissionDenied("Seul l'organisateur tranche une contre-proposition.")
        if rdv.statut not in (RendezVous.Statut.PROPOSE, RendezVous.Statut.CONTRE_PROPOSE):
            raise ErreurValidation("Ce rendez-vous n'attend pas de réponse.")
        rdv.appliquer_decision((request.data or {}).get("decision"))
        return Response(RendezVousSerializer(rdv, context={"request": request}).data)


class ContrePropositionView(APIView):
    """POST /{id}/contre-proposition/ {dateHeure, lieu} — l'invité propose ailleurs."""

    def post(self, request, pk):
        rdv = _rdv_autorise(request, pk)
        if request.user.pk != rdv.invite_id:
            raise PermissionDenied("Seul l'invité peut faire une contre-proposition.")
        corps = request.data or {}
        lieu = (corps.get("lieu") or "").strip()
        if not lieu:
            raise ErreurValidation("Le lieu est requis.")
        rdv.contre_proposer(_parse_date_heure(corps.get("dateHeure")), lieu)
        return Response(RendezVousSerializer(rdv, context={"request": request}).data)


class AnnulerView(APIView):
    """PATCH /{id}/annuler/ — tout statut sauf passe/refuse (doc 06)."""

    def patch(self, request, pk):
        rdv = _rdv_autorise(request, pk)
        rdv.annuler()
        return Response(RendezVousSerializer(rdv, context={"request": request}).data)


class RappelVuView(APIView):
    """PATCH /{id}/rappel-vu/ — le X masque la bannière, n'annule PAS le RDV."""

    def patch(self, request, pk):
        rdv = _rdv_autorise(request, pk)
        rdv.rappel_vu = True
        rdv.save(update_fields=["rappel_vu"])
        return Response({"ok": True})
