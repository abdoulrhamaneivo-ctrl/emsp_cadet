"""Endpoints REST parrainage — contrat front docs 04/05 verbatim + règles
Ivo en dur (promo devançante, transition sans casse de binômes)."""

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from comptes.models import Binome, User
from comptes.serializers import UtilisateurLegereSerializer
from config.exceptions import ErreurValidation

from .models import Avis, Demande
from .rules import (
    BinomeActif,
    ErreurParrainage,
    niveau_de,
    peut_parrainer,
    promotion_devancante,
    verifie_engagements,
    verifie_quota,
)


def _garde(request):
    if not request.user.is_authenticated:
        raise ErreurValidation("Connexion requise.")
    return request.user


# ── Contrat doc 05 §2 : /api/me/parrainage/ ──────────────────────────────────
class MonParrainageView(APIView):
    def get(self, request):
        moi = _garde(request)
        binome_aine = BinomeActif(moi).select_related("aine").first()
        mes_binomes_cadets = Binome.objects.filter(
            aine=moi, statut=Binome.Statut.ACTIF
        ).select_related("cadet")
        demande_attente = (
            Demande.objects.filter(cadet=moi, statut=Demande.Statut.EN_ATTENTE)
            .select_related("aine")
            .first()
        )

        def facette(binome, sens):
            autre = binome.cadet if sens == "donne_a" else binome.aine
            avis = Avis.objects.filter(binome=binome, auteur=moi).exists()
            return {
                "id": binome.id,
                "autre": UtilisateurLegereSerializer(autre).data,
                "dateDebut": binome.cree_le,
                "statut": binome.statut,
                "avisDonne": avis,
                "sens": sens,
            }

        def facette_demande(demande):
            return {
                "id": demande.id,
                "cadet": UtilisateurLegereSerializer(demande.cadet).data,
                "aine": UtilisateurLegereSerializer(demande.aine).data,
                "statut": demande.statut,
                "dateDemande": demande.date_demande,
                "dateReponse": demande.date_reponse,
                "motifRefus": demande.motif_refus if demande.motif_partage else None,
                "message": demande.message,
            }

        return Response(
            {
                "binomeActif": bool(binome_aine),
                "aineActif": (
                    UtilisateurLegereSerializer(binome_aine.aine).data
                    if binome_aine
                    else None
                ),
                "demandeEnAttente": (
                    facette_demande(demande_attente) if demande_attente else None
                ),
                "monAine": facette(binome_aine, "recu_de_mon_aine") if binome_aine else None,
                "cadetsActifs": [
                    facette(b, "donne_a") for b in mes_binomes_cadets
                ],
                "historiqueEnvoyes": [
                    facette_demande(d)
                    for d in Demande.objects.filter(cadet=moi)
                    .exclude(statut=Demande.Statut.EN_ATTENTE)[:20]
                ],
                "historiqueRecus": [
                    facette_demande(d)
                    for d in Demande.objects.filter(aine=moi)
                    .exclude(statut=Demande.Statut.EN_ATTENTE)[:20]
                ],
            }
        )


# ── Création de demande (doc 04 §5 : POST /api/parrains/:id/demande/) ───────
class DemandeParrainView(APIView):
    def post(self, request, parrain_id):
        cadet = _garde(request)
        aine = get_object_or_404(
            User, pk=parrain_id, candidature_aine_ouverte=True, is_active=True
        )
        message = ((request.data or {}).get("message") or "").strip()

        try:
            verifie_engagements(cadet)
            verifie_quota(aine)
        except ErreurParrainage as erreur:
            raise ErreurValidation(str(erreur)) from erreur

        # RÈGLE IVO n°2 : la promo devançante UNIQUEMENT.
        if not peut_parrainer(cadet, aine):
            devancant = promotion_devancante(niveau_de(cadet))
            raise ErreurValidation(
                (
                    f"Tu ne peux demander qu'un Aîné de la promo {devancant} "
                    f"— celle qui devance directement la tienne (L{'' or 1}→L2, L2→L3…)."
                )
                if devancant
                else "Ton niveau ne permet plus de demander un Aîné (dernière promo)."
            )

        deja = Demande.objects.filter(
            cadet=cadet, aine=aine, statut=Demande.Statut.EN_ATTENTE
        ).exists()
        if deja:
            raise ErreurValidation("Une demande vers cet Aîné est déjà en attente.")

        demande = Demande.objects.create(cadet=cadet, aine=aine, message=message[:1000])
        return Response(
            {
                "id": demande.id,
                "cadet": UtilisateurLegereSerializer(demande.cadet).data,
                "aine": UtilisateurLegereSerializer(demande.aine).data,
                "statut": demande.statut,
                "dateDemande": demande.date_demande,
                "dateReponse": None,
                "motifRefus": None,
                "message": demande.message,
            },
            status=201,
        )


# ── Listes envoyées/reçues (doc 05 §2) ───────────────────────────────────────
class DemandesView(APIView):
    def get(self, request):
        moi = _garde(request)
        sens = request.query_params.get("sens", "envoyees")
        statut = request.query_params.get("statut")
        champ = "cadet" if sens == "envoyees" else "aine"
        queryset = Demande.objects.filter(**{champ: moi}).select_related("cadet", "aine")
        if statut:
            queryset = queryset.filter(statut=statut)
        total = queryset.count()
        return Response(
            {
                "count": total,
                "results": [_demande_json(d, moi) for d in queryset[:50]],
            }
        )


def _demande_json(demande, moi):
    return {
        "id": demande.id,
        "cadet": UtilisateurLegereSerializer(demande.cadet).data,
        "aine": UtilisateurLegereSerializer(demande.aine).data,
        "statut": demande.statut,
        "dateDemande": demande.date_demande,
        "dateReponse": demande.date_reponse,
        "motifRefus": demande.motif_refus if demande.motif_partage else None,
        "message": demande.message,
    }


# ── Répondre / annuler ────────────────────────────────────────────────────────
class RepondreDemandeView(APIView):
    def post(self, request, demande_id):
        moi = _garde(request)
        demande = get_object_or_404(
            Demande, pk=demande_id, aine=moi, statut=Demande.Statut.EN_ATTENTE
        )
        decision = (request.data or {}).get("decision")
        if decision not in ("acceptee", "refusee"):
            raise ErreurValidation("Décision inconnue (acceptee|refusee).")

        if decision == "refusee":
            demande.statut = "refusee"
            demande.motif_refus = ((request.data or {}).get("motifRefus") or "")[:500]
            demande.motif_partage = bool((request.data or {}).get("partagerMotif"))
            demande.date_reponse = timezone.now()
            demande.save()
            return Response(_demande_json(demande, moi))

        # Acceptation : RG1 côté aîné (une demande en attente max ? NON — un
        # aîné peut recevoir plusieurs demandes, il répond à chacune) + quota.
        try:
            verifie_quota(moi)
        except ErreurParrainage as erreur:
            raise ErreurValidation(str(erreur)) from erreur
        with transaction.atomic():
            demande.statut = "acceptee"
            demande.date_reponse = timezone.now()
            demande.save()
            if Binome.objects.filter(
                aine=demande.aine, cadet=demande.cadet, statut=Binome.Statut.ACTIF
            ).exists():
                raise ErreurValidation("Ce binôme existe déjà.")
            Binome.objects.create(aine=demande.aine, cadet=demande.cadet)
        return Response(_demande_json(demande, moi))


class AnnulerDemandeView(APIView):
    def patch(self, request, demande_id):
        moi = _garde(request)
        demande = get_object_or_404(
            Demande, pk=demande_id, cadet=moi, statut=Demande.Statut.EN_ATTENTE
        )
        demande.statut = "annulee"
        demande.date_reponse = timezone.now()
        demande.save()
        return Response(_demande_json(demande, moi))


# ── Clôture (RG6) + avis (doc 07) ────────────────────────────────────────────
class ClotureParrainageView(APIView):
    def post(self, request, parrainage_id):
        moi = _garde(request)
        binome = get_object_or_404(Binome, pk=parrainage_id, statut=Binome.Statut.ACTIF)
        if moi not in (binome.aine, binome.cadet):
            raise ErreurValidation("Ce binôme n'est pas le tien.")
        binome.statut = Binome.Statut.CLOS
        binome.save(update_fields=["statut"])
        return Response({"avisRequis": True})


class AvisParrainageView(APIView):
    def post(self, request, parrainage_id):
        moi = _garde(request)
        binome = get_object_or_404(Binome, pk=parrainage_id, statut=Binome.Statut.CLOS)
        if moi not in (binome.aine, binome.cadet):
            raise ErreurValidation("Ce binôme n'est pas le tien.")
        cote = "aine" if moi == binome.aine else "cadet"
        note = (request.data or {}).get("note")
        if not isinstance(note, int) or not 1 <= note <= 5:
            raise ErreurValidation("Note entre 1 et 5.")
        if Avis.objects.filter(binome=binome, cote=cote).exists():
            raise ErreurValidation("RG6 : tu as déjà donné ton avis sur ce parrainage.")
        Avis.objects.create(
            binome=binome,
            auteur=moi,
            cote=cote,
            note=note,
            commentaire=((request.data or {}).get("commentaire") or "")[:1000],
        )
        return Response({"ok": True}, status=201)
