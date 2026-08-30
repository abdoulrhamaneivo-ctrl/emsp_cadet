"""Admin — statistiques et TRANSITION ANNUELLE (docs 12/15 + règle Ivo n°1).

La transition monte les niveaux mais ne touche JAMAIS comptes.Binome :
« en fin d'année on ne perd pas ses aînés et filleuls » (verbatim user).
Atomique : soit tout passe, rien n'est à moitié fait (doc 15 §2 n°3).
"""

from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView

from comptes.models import Binome, User
from comptes.serializers import UtilisateurLegereSerializer
from config.exceptions import ErreurValidation
from ia.silence import detecter_binomes_silencieux, creer_nudge_binome

ORDRE = ["L1", "L2", "L3", "M1", "M2", "alumni"]


def _garde_admin(request):
    user = request.user
    if not user.is_authenticated or not (user.is_staff or user.is_superuser):
        raise ErreurValidation("Réservé à l'administration.")
    return user


class StatsAdminView(APIView):
    """GET /api/admin/stats/ — KPI doc 12 §2 (sous-ensemble utile V1)."""

    def get(self, request):
        _garde_admin(request)
        from parrainage.models import Demande

        return Response(
            {
                "parrainagesActifs": Binome.objects.filter(statut=Binome.Statut.ACTIF).count(),
                "demandesEnAttente": Demande.objects.filter(
                    statut=Demande.Statut.EN_ATTENTE
                ).count(),
                "etudiants": User.objects.exclude(niveau_etude="alumni").count(),
                "alumni": User.objects.filter(niveau_etude="alumni").count(),
            }
        )


def _niveau_suivant(niveau):
    """L1→L2→L3→M1→M2 ; M2/alumni = fins de cycle (gérées à part)."""
    index = ORDRE.index(niveau) if niveau in ORDRE else 0
    return ORDRE[min(index + 1, ORDRE.index("M2"))]


class TransitionApercuView(APIView):
    """GET /api/admin/transition-apercu/ — récapitulatif SANS exécution."""

    def get(self, request):
        _garde_admin(request)
        promotions, fins, anomalies = [], [], []

        for user in User.objects.filter(is_active=True).order_by("niveau_etude", "email"):
            niveau = user.niveau_etude
            if niveau not in ORDRE:
                anomalies.append({"user": user.email, "raison": f"Niveau inconnu : {niveau!r}"})
                continue
            if niveau in ("L1", "L2", "M1"):
                promotions.append(
                    {
                        "id": user.id,
                        "user": UtilisateurLegereSerializer(user).data,
                        "niveauActuel": niveau,
                        "niveauSuivant": _niveau_suivant(niveau),
                    }
                )
            elif niveau == "L3":
                intention = getattr(user, "intention_annee_suivante", "inconnu") or "inconnu"
                propose = "M1" if intention == "master" else "alumni"
                fins.append(
                    {
                        "id": user.id,
                        "user": UtilisateurLegereSerializer(user).data,
                        "intention": intention,
                        "niveauSuivantPropose": propose,
                        "parDefaut": intention not in ("master", "alumni"),
                    }
                )
            elif niveau == "M2":
                fins.append(
                    {
                        "id": user.id,
                        "user": UtilisateurLegereSerializer(user).data,
                        "intention": "fin_de_cycle",
                        "niveauSuivantPropose": "alumni",
                        "parDefaut": False,
                    }
                )

        return Response({"promotions": promotions, "finsDeCycle": fins, "anomalies": anomalies})


class TransitionExecuterView(APIView):
    """POST /api/admin/transition-executer/ — ATOMIQUE + binômes intacts.

    body {decisionParUser: {id: "L2"|"M1"|"alumni"|…}} — l'admin a validé
    chaque ligne de l'aperçu ; le serveur revalide et applique en une seule
    transaction. Les binômes ne sont JAMAIS touchés (règle Ivo n°1) : les
    alumni gardent leurs cadets actifs, les cadets gardent leur aîné.
    """

    def post(self, request):
        _garde_admin(request)
        decisions = (request.data or {}).get("decisionParUser") or {}
        if not isinstance(decisions, dict) or not decisions:
            raise ErreurValidation("Aucune décision fournie.")

        niveaux_valides = set(ORDRE)
        with transaction.atomic():
            modifiees = 0
            for id_texte, niveau_cible in decisions.items():
                if niveau_cible not in niveaux_valides:
                    raise ErreurValidation(f"Niveau cible invalide : {niveau_cible!r}")
                user = User.objects.select_for_update().filter(pk=int(id_texte)).first()
                if user is None:
                    raise ErreurValidation(f"Compte {id_texte} introuvable.")
                user.niveau_etude = niveau_cible
                user.save(update_fields=["niveau_etude"])
                modifiees += 1
            # RÈGLE IVO n°1 — zéro opération sur comptes.Binome ici.
            binomes_actifs = Binome.objects.filter(statut=Binome.Statut.ACTIF).count()

        return Response(
            {
                "ok": True,
                "modifiees": modifiees,
                "binomesConserves": binomes_actifs,
                "message": (
                    "Transition appliquée — les parrainages en cours sont "
                    "conservés, personne ne perd son Aîné ni ses filleuls."
                ),
            }
        )


class BinomesSilencieuxView(APIView):
    """GET /api/admin/binomes-silencieux/ — liste des binômes à risque (IA-5).

    Critères (métas only RG12.2) : dernier message Famille > 21j OU
    ≥ 3 RDV annulés sur 30j. Retourne liste avec raisons + option nudge.
    """

    def get(self, request):
        _garde_admin(request)
        from ia.silence import detecter_binomes_silencieux

        silencieux = detecter_binomes_silencieux()
        # Enrichir avec infos utilisateur
        resultats = []
        for s in silencieux:
            from comptes.serializers import UtilisateurLegereSerializer
            from comptes.models import User
            aine = User.objects.get(pk=s["aine_id"])
            cadet = User.objects.get(pk=s["cadet_id"])
            resultats.append({
                "binomeId": s["binome_id"],
                "aine": UtilisateurLegereSerializer(aine).data,
                "cadet": UtilisateurLegereSerializer(cadet).data,
                "raisons": s["raisons"],
            })
        return Response({"results": resultats, "count": len(resultats)})

    def post(self, request):
        """POST {binomeId} → envoie un nudge bienveillant aux DEUX membres (IA-5)."""
        _garde_admin(request)
        binome_id = (request.data or {}).get("binomeId")
        if not binome_id:
            raise ErreurValidation("binomeId requis.")
        from ia.silence import detecter_binomes_silencieux, creer_nudge_binome
        silencieux = detecter_binomes_silencieux()
        cible = next((s for s in silencieux if s["binome_id"] == binome_id), None)
        if not cible:
            raise ErreurValidation("Binôme non trouvé dans la liste des silencieux.")
        creer_nudge_binome(binome_id, cible["raisons"])
        return Response({"ok": True, "message": "Nudge envoyé aux deux membres."})
