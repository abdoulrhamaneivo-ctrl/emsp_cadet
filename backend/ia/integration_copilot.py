"""IA-3 — Copilot profil (doc 17 §2)."""

import logging

from django.conf import settings

from .models import AppelIA
from .copilot import generer_propositions

logger = logging.getLogger(__name__)


def appeler_copilot(request, section, mots_cles):
    """Génère 3 propositions pour la section profil demandée.

    Retourne {propositions: [...]} — l'IA propose, l'utilisateur insère (RG12.1/3).
    Journalise l'appel (RG12.6).
    """
    if getattr(settings, "IA_DESACTIVEE", False):
        return {"propositions": []}

    propositions = generer_propositions(section, mots_cles or "")
    try:
        AppelIA.objects.create(
            feature=AppelIA.Feature.MODERATION,  # on réutilise le même type, feature distincte idéale pour V2
            score=0,  # pas de score pour copilot
            raison=f"Copilot {section}: {mots_cles[:100]}",
            signalant_ia=False,
            cible_type=None,
            cible_id=request.user.pk,
        )
    except Exception:  # noqa: BLE001 — le journal ne doit pas bloquer la suggestion
        logger.exception("Échec de journalisation du copilot profil")
    return {"propositions": propositions}
