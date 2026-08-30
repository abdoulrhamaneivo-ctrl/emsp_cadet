"""IA-6 — Aide rédaction offres alumni (doc 17 §2).

Endpoint POST /api/offres/generer/ {typeOffre, variables} → {mission: [...], profil: [...], modalites: [...]}.
Opt-in RG12.4 via preferences_ia (réutilise copilot ou toggle dédié).
"""

from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView

from ia.offres import generer_propositions_offre
from ia.integration import kill_switch_actif


class GenererOffreView(APIView):
    """POST /api/offres/generer/ {typeOffre, variables} → {mission, profil, modalites}.

    IA-6 (doc 17 §2) — Structure suggérée selon type d'offre.
    Opt-in RG12.4 : copilot (réutilise le même toggle) ou toggle dédié offres.
    """

    def post(self, request):
        if kill_switch_actif():
            return Response({"mission": [], "profil": [], "modalites": []})

        type_offre = (request.data or {}).get("typeOffre")
        variables = (request.data or {}).get("variables") or {}

        if type_offre not in ("stage", "alternance", "cdi", "cdd", "freelance", "benevolat"):
            from config.exceptions import ErreurValidation
            raise ErreurValidation("Type d'offre invalide.")

        try:
            from ia.offres import generer_propositions_offre
            return Response(generer_propositions_offre(type_offre, variables))
        except Exception:  # noqa: BLE001 — dégradation silencieuse
            return Response({"mission": [], "profil": [], "modalites": []})