"""Publication des événements temps réel (contrat WS doc 21 §4).

La source de vérité est le code REST (views) : il écrit en base PUIS publie
sur le groupe `conv.{id}`. Le consumer WS n'écrit jamais en base.
"""

import json
import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)


def publier(conversation_id, evenement):
    """Diffuse `evenement` (dict sérialisable) au groupe de la conversation."""
    couche = get_channel_layer()
    if couche is None:
        logger.warning("Aucune channel layer — événement WS perdu : %s", evenement)
        return
    async_to_sync(couche.group_send)(
        f"conv.{conversation_id}",
        {"type": "evenement.chat", "texte": json.dumps(evenement)},
    )
