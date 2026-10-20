"""API des offres et candidatures — les annonces restent liées à leur auteur."""

from django.db import IntegrityError, transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from config.exceptions import ErreurConflit, ErreurValidation

from .models import Candidature, Offre
from .serializers import (
    CandidatureCreationSerializer,
    CandidatureSerializer,
    OffreCreationSerializer,
    OffreSerializer,
)


def _offres_actives():
    return Offre.objects.filter(publiee=True).filter(
        Q(date_limite__isnull=True) | Q(date_limite__gte=timezone.localdate())
    )


class OffresView(APIView):
    """GET les annonces actives; POST autorisé aux alumni et à l'administration."""

    def get(self, request):
        offres = _offres_actives().select_related("auteur").prefetch_related("candidatures")
        query = (request.query_params.get("q") or "").strip()
        if query:
            offres = offres.filter(
                Q(titre__icontains=query)
                | Q(entreprise__icontains=query)
                | Q(localisation__icontains=query)
                | Q(mission__icontains=query)
            )
        type_offre = request.query_params.get("type")
        if type_offre in Offre.Type.values:
            offres = offres.filter(type_offre=type_offre)
        lieu = (request.query_params.get("localisation") or "").strip()
        if lieu:
            offres = offres.filter(localisation__icontains=lieu)
        telework = request.query_params.get("telework")
        if telework == "oui":
            offres = offres.filter(teletravail__iregex=r"remote|hybride|télétravail")
        elif telework == "non":
            offres = offres.exclude(teletravail__iregex=r"remote|hybride|télétravail")
        donnees = OffreSerializer(offres, many=True, context={"request": request}).data
        return Response({"count": len(donnees), "results": donnees})

    def post(self, request):
        if not (
            request.user.is_staff
            or request.user.is_superuser
            or request.user.niveau_etude == "alumni"
        ):
            raise PermissionDenied(
                "La publication d'une offre est réservée aux alumni et à l'administration."
            )
        serializer = OffreCreationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offre = serializer.save(auteur=request.user)
        return Response(OffreSerializer(offre, context={"request": request}).data, status=201)


class OffreDetailView(APIView):
    def get(self, request, pk):
        offre = get_object_or_404(_offres_actives().select_related("auteur"), pk=pk)
        return Response(OffreSerializer(offre, context={"request": request}).data)


class CandidaterView(APIView):
    def post(self, request, pk):
        offre = get_object_or_404(_offres_actives(), pk=pk)
        if offre.auteur_id == request.user.pk:
            raise ErreurValidation("Tu ne peux pas candidater à ta propre offre.")
        serializer = CandidatureCreationSerializer(data=request.data or {})
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                Candidature.objects.create(
                    offre=offre,
                    candidat=request.user,
                    message=serializer.validated_data.get("message", ""),
                )
        except IntegrityError as erreur:
            if Candidature.objects.filter(offre=offre, candidat=request.user).exists():
                raise ErreurConflit(
                    "Tu as déjà envoyé une candidature pour cette offre."
                ) from erreur
            raise
        return Response({"candidatureEnvoyee": True}, status=201)


class CandidaturesOffreView(APIView):
    """Les coordonnées des candidats ne sont visibles que par l'auteur et l'admin."""

    def get(self, request, pk):
        offre = get_object_or_404(Offre, pk=pk)
        if offre.auteur_id != request.user.pk and not (
            request.user.is_staff or request.user.is_superuser
        ):
            raise PermissionDenied("Seul l'auteur de l'offre peut consulter ses candidatures.")
        candidatures = Candidature.objects.filter(offre=offre).select_related("candidat")
        donnees = CandidatureSerializer(candidatures, many=True).data
        return Response({"count": len(donnees), "results": donnees})
