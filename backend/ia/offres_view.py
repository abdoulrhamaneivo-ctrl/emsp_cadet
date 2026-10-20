"""IA-6 — Aide rédaction offres alumni (doc 17 §2).

Endpoint POST /api/offres/generer/ {typeOffre, variables} → {mission: [...], profil: [...], modalites: [...]}.
Opt-in RG12.4 via preferences_ia (réutilise copilot ou toggle dédié).
"""

from rest_framework.response import Response
from rest_framework.views import APIView

from config.exceptions import ErreurValidation
from ia.offres import generer_propositions_offre
from ia.integration import kill_switch_actif


class GenererOffreView(APIView):
    """POST /api/offres/generer/ {typeOffre, variables} → {mission, profil, modalites}.

    IA-6 (doc 17 §2) — Structure suggérée selon type d'offre.
    Opt-in RG12.4 : copilot (réutilise le même toggle) ou toggle dédié offres.
    """

    def post(self, request):
        if kill_switch_actif():
            raise ErreurValidation("L'assistant de rédaction est temporairement désactivé.")

        if not (request.user.preferences_ia or {}).get("copilot"):
            raise ErreurValidation("Active l'assistant de rédaction dans tes préférences IA.")

        type_offre = (request.data or {}).get("typeOffre")
        variables = (request.data or {}).get("variables") or {}

        if type_offre not in ("stage", "alternance", "cdi", "cdd", "freelance", "benevolat"):
            raise ErreurValidation("Type d'offre invalide.")
        if not isinstance(variables, dict):
            raise ErreurValidation("Les informations de l'offre sont invalides.")

        contexte = {
            str(cle): str(valeur)[:500]
            for cle, valeur in variables.items()
            if isinstance(cle, str) and isinstance(valeur, (str, int, float))
        }
        return Response(generer_propositions_offre(type_offre, contexte))
