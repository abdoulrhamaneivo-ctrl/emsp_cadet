"""Annuaire + aperçus /me — endpoints consommés par le front T1/T2 (docs 04/05).

V2 : l'annuaire est alimenté par les comptes RÉELS (candidature ouverte +
vitrine complète + niveau éligible RG7), plus aucune liste en dur.
Règle Ivo : les CTA de demande restent servis (404 si l'aîné n'est pas
visible) — la garde promo devançante vit dans parrainage.views.
"""

from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView

from comptes.models import Binome, User
from config.exceptions import ErreurValidation

NIVEAUX_ELIGIBLES = ("L2", "L3", "M1", "M2", "alumni")


def _garde(request):
    if not request.user.is_authenticated:
        raise ErreurValidation("Connexion requise.")
    return request.user


def _profil_aine(user, moi):
    """Shape ProfilAine (doc 04) : carte annuaire complète."""
    nb_cadets = Binome.objects.filter(aine=user, statut=Binome.Statut.ACTIF).count()
    est_mon_aine = bool(
        moi
        and Binome.objects.filter(
            aine=user, cadet=moi, statut=Binome.Statut.ACTIF
        ).exists()
    )
    return {
        "id": user.pk,
        "prenom": user.prenom,
        "nom": user.nom,
        "classe": user.classe,
        "filiere": user.filiere,
        "niveauEtude": user.niveau_etude,
        "photoUrl": user.photo.url if user.photo else None,
        "ambitions": user.ambitions or [],
        "projets": user.projets or [],
        "pointsForts": user.points_forts or [],
        "pointsFaibles": user.points_faibles or [],
        "nbCadetsActifs": nb_cadets,
        "quota": 5,
        "complet": nb_cadets >= 5,
        "estMonAine": est_mon_aine,
    }


class ParrainsView(APIView):
    """GET /api/parrains/ — annuaire des aînés éligibles (RG7 + RG8 + vitrine)."""

    def get(self, request):
        moi = _garde(request)
        comptes = (
            User.objects.filter(
                is_active=True,
                candidature_aine_ouverte=True,
                niveau_etude__in=NIVEAUX_ELIGIBLES,
            )
            .exclude(pk=moi.pk)
            .prefetch_related()
        )
        # Complétude : photo + ambitions≥3 + projets≥1 + forces≥2 + faibles≥1
        visibles = [u for u in comptes if _complet(u)]
        q = (request.query_params.get("q") or "").strip().lower()
        if q:
            visibles = [
                u
                for u in visibles
                if q in f"{u.prenom} {u.nom}".lower()
                or q in (u.filiere or "").lower()
                or q in (u.classe or "").lower()
            ]
        filiere = (request.query_params.get("filiere") or "").strip().lower()
        if filiere:
            visibles = [u for u in visibles if filiere in (u.filiere or "").lower()]
        # RG3 : complets exclus sauf inclureComplets=true
        if request.query_params.get("inclureComplets") != "true":
            visibles = [
                u
                for u in visibles
                if Binome.objects.filter(
                    aine=u, statut=Binome.Statut.ACTIF
                ).count()
                < 5
            ]
        return Response(
            {
                "count": len(visibles),
                "results": [_profil_aine(u, moi) for u in visibles[:50]],
            }
        )


def _complet(user):
    return (
        bool(user.photo)
        and len(user.ambitions or []) >= 3
        and len(user.projets or []) >= 1
        and len(user.points_forts or []) >= 2
        and len(user.points_faibles or []) >= 1
    )


class SuggestionsView(APIView):
    """GET /api/parrains/suggestions/ — max 3, enrichi par l'IA (IA-2).

    raisonIA = pourquoi ce profil (similarité attentes↔vitrine).
    Respecte RG12.4 : si matchingEnrichi=false → tri promo-devançante seul (sans IA).
    """

    def get(self, request):
        moi = _garde(request)
        from parrainage.rules import niveau_de, promotion_devancante

        devancant = promotion_devancante(niveau_de(moi))
        candidats = [
            u
            for u in User.objects.filter(
                is_active=True,
                candidature_aine_ouverte=True,
                niveau_etude__in=NIVEAUX_ELIGIBLES,
            )
            .exclude(pk=moi.pk)
            if _complet(u)
            and Binome.objects.filter(aine=u, statut=Binome.Statut.ACTIF).count() < 5
        ]

        # IA-2 : matching enrichi si consentement actif
        prefs_ia = moi.preferences_ia or {}
        if prefs_ia.get("matchingEnrichi"):
            from ia.matching import calculer_score_matching, generer_raison_ia

            for u in candidats:
                vitrine = {
                    "ambitions": u.ambitions or [],
                    "projets": u.projets or [],
                    "pointsForts": u.points_forts or [],
                    "pointsFaibles": u.points_faibles or [],
                }
                u._score_ia = calculer_score_matching(moi.attentes or "", vitrine)
                u._raison_ia = generer_raison_ia(moi.attentes or "", vitrine)

            # Tri par score IA décroissant (promo devançante = bonus implicite via vitrine)
            candidats.sort(key=lambda u: u._score_ia, reverse=True)

        else:
            # Fallback : promo devançante d'abord (comportement pré-IA)
            candidats.sort(key=lambda u: 0 if u.niveau_etude == devancant else 1)

        resultats = []
        for u in candidats[:3]:
            item = _profil_aine(u, moi)
            if hasattr(u, "_raison_ia"):
                item["raisonIA"] = u._raison_ia
            elif u.niveau_etude == devancant:
                item["raisonIA"] = f"De la promo qui devance directement la tienne ({devancant})."
            else:
                item["raisonIA"] = "Profil complet proche de ta filière."
            resultats.append(item)

        return Response({"results": resultats})


class ParrainDetailView(APIView):
    """GET /api/parrains/:id/ — fiche (404 si non visible, doc 04 §2)."""

    def get(self, request, parrain_id):
        moi = _garde(request)
        user = User.objects.filter(
            pk=parrain_id,
            is_active=True,
            candidature_aine_ouverte=True,
            niveau_etude__in=NIVEAUX_ELIGIBLES,
        ).first()
        if user is None or not _complet(user):
            raise ErreurValidation("Cet Aîné n'existe plus ou n'est pas visible.")
        return Response(_profil_aine(user, moi))


class GroupsResumeView(APIView):
    """GET /api/me/groups-resume/ — conversations Famille du binôme (doc 13)."""

    def get(self, request):
        moi = _garde(request)
        from messagerie.models import Conversation

        conversations = (
            Conversation.objects.filter(participants=moi)
            .filter(type="groupe_famille")
            .distinct()
        )
        return Response(
            {
                "results": [
                    {
                        "conversationId": c.pk,
                        "type": c.type,
                        "titre": c.titre_groupe or "",
                        "nbMembres": c.participants.count(),
                    }
                    for c in conversations
                ]
            }
        )


class MesRendezVousView(APIView):
    """GET /api/me/rendez-vous/ — aperçu RDV du binôme (doc 05 PanneauMonAine)."""

    def get(self, request):
        moi = _garde(request)
        from django.utils import timezone

        from rendezvous.models import RendezVous
        from rendezvous.serializers import RendezVousSerializer

        rdvs = (
            RendezVous.objects.filter(
                (Q(organisateur=moi) | Q(invite=moi)),
                date_heure__gte=timezone.now() - timezone.timedelta(days=7),
            )
            .order_by("date_heure")[:10]
        )
        return Response({"results": RendezVousSerializer(rdvs, many=True).data})
