"""IA-3 — Copilot profil (doc 17 §2)."""

from django.conf import settings
from django.utils.text import Truncator

from .models import AppelIA
from .copilot import generer_propositions


def appeler_copilot(request, section, mots_cles):
    """Génère 3 propositions pour la section profil demandée.

    Retourne {propositions: [...]} — l'IA propose, l'utilisateur insère (RG12.1/3).
    Journalise l'appel (RG12.6).
    """
    if getattr(settings, "IA_DESACTIVEE", False):
        return {"propositions": []}

    try:
        from ia.copilot import generer_propositions

        propositions = generer_propositions(section, mots_cles or "")
        AppelIA.objects.create(
            feature=AppelIA.Feature.MODERATION,  # on réutilise le même type, feature distincte idéale pour V2
            score=0,  # pas de score pour copilot
            raison=f"Copilot {section}: {mots_cles[:100]}",
            signalant_ia=False,
            cible_type=None,
            cible_id=request.user.pk,
        )
        return {"propositions": propositions}
    except Exception:  # noqa: BLE001 — dégradation silencieuse
        return {"propositions": []}
