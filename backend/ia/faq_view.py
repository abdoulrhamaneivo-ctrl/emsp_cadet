"""IA-4 — FAQ L1 (doc 17 §2)."""

from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ia.faq import rechercher_reponse
from ia.integration import kill_switch_actif


class FAQView(APIView):
    """POST /api/faq/ {question} → {trouve, reponse, sources, score}.

    IA-4 (doc 17 §2) — Chatbot FAQ L1 : base connaissances validée admin.
    Si trouve → réponse + sources (ChipIA). Sinon → bouton "Poser à la communauté" → Fil.
    Opt-in RG12.4 : matchingEnrichi (réutilise le même toggle) ou toggle dédié.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        if kill_switch_actif():
            return Response({"trouve": False, "reponse": None, "sources": [], "score": 0})

        question = (request.data or {}).get("question", "").strip()
        if not question or len(question) < 3:
            return Response({"trouve": False, "reponse": None, "sources": [], "score": 0})

        from ia.faq import rechercher_reponse
        resultat = rechercher_reponse(question)
        return Response({
            "trouve": resultat["trouve"],
            "reponse": resultat["reponse"],
            "sources": resultat["sources"],
            "score": resultat["score"],
        })