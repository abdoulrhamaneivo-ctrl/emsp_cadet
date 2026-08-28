"""Consumer WS chat — contrat doc 21 §4 (join / typing / presence).

Consumer ASYNC : l'ORM n'est JAMAIS appelé directement dans la boucle
(`database_sync_to_async` obligatoire, sinon SynchronousOnlyOperation).
Le message.new est publié par la couche REST (temps_reel.publier) ; ce consumer
n'écrit jamais en base.
"""

import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken


def _cookies_du_scope(scope):
    """Parse le header Cookie (indépendant de la stack de middlewares)."""
    for cle, valeur in scope.get("headers", []):
        if cle == b"cookie":
            return dict(
                morceau.strip().split("=", 1)
                for morceau in valeur.decode().split(";")
                if "=" in morceau
            )
    return {}


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """ws://…/ws/chat/?token=<access> — groupes `conv.{id}`, participants seulement."""

    async def connect(self):
        params = dict(
            morceau.split("=", 1)
            for morceau in self.scope["query_string"].decode().split("&")
            if "=" in morceau
        )
        # 1) token JWT en query (contrat front) ; 2) repli : cookie httpOnly —
        # Path=/ donc présent sur la poignée de main WS en mode proxy même origine.
        self.utilisateur = await self._utilisateur_depuis(
            params.get("token", ""),
            _cookies_du_scope(self.scope).get(settings.SIMPLE_JWT_REFRESH_COOKIE),
        )
        if self.utilisateur is None or not self.utilisateur.is_active:
            await self.close(code=4401)
            return
        self.groupes_joints = set()
        await self.accept()

    async def receive_json(self, contenu):
        type_evenement = contenu.get("type")
        conversation_id = contenu.get("conversationId")
        if type_evenement == "join" and conversation_id:
            await self.rejoindre(conversation_id)
        elif type_evenement == "typing" and conversation_id:
            await self.diffuser(
                conversation_id, {"type": "typing", "conversationId": conversation_id}
            )

    async def rejoindre(self, conversation_id):
        if not await self._est_participant(conversation_id):
            await self.send_json({"type": "erreur", "detail": "Conversation inconnue."})
            return
        groupe = f"conv.{conversation_id}"
        if groupe not in self.groupes_joints:
            await self.channel_layer.group_add(groupe, self.channel_name)
            self.groupes_joints.add(groupe)

    async def disconnect(self, code):
        for groupe in list(self.groupes_joints):
            await self.channel_layer.group_discard(groupe, self.channel_name)
            await self.channel_layer.group_send(
                groupe,
                {
                    "type": "evenement.chat",
                    "texte": json.dumps(
                        {
                            "type": "presence",
                            "utilisateurId": self.utilisateur.pk,
                            "enLigne": False,
                        }
                    ),
                },
            )

    # Handler des événements publiés par la couche REST (type: "evenement.chat").
    async def evenement_chat(self, message):
        evenement = json.loads(message["texte"])
        # `envoyeParMoi` est du point de vue du DESTINATAIRE (contrat front) :
        # la couche REST diffuse le payload de l'expéditeur, on le réécrit ici.
        if evenement.get("type") == "message.new" and "message" in evenement:
            evenement["message"]["envoyeParMoi"] = (
                evenement["message"].get("auteurId") == self.utilisateur.pk
            )
        await self.send(text_data=json.dumps(evenement))

    # ── Helpers async (ORM via database_sync_to_async) ────────────────────────
    @staticmethod
    async def _utilisateur_depuis(token_access, token_refresh):
        if token_access:
            utilisateur = await ChatConsumer._utilisateur_du_token(token_access)
            if utilisateur is not None:
                return utilisateur
        if token_refresh:
            return await ChatConsumer._utilisateur_du_cookie(token_refresh)
        return None

    @staticmethod
    @database_sync_to_async
    def _utilisateur_du_token(token):
        try:
            valide = JWTAuthentication().get_validated_token(token)
            return JWTAuthentication().get_user(valide)
        except (TokenError, InvalidToken, AuthenticationFailed):
            return None

    @staticmethod
    @database_sync_to_async
    def _utilisateur_du_cookie(token_refresh):
        from django.contrib.auth import get_user_model

        try:
            user_id = RefreshToken(token_refresh).payload.get("user_id")
            if user_id is None:
                return None
            return get_user_model().objects.get(pk=user_id)
        except (TokenError, InvalidToken, get_user_model().DoesNotExist):
            return None

    @database_sync_to_async
    def _est_participant(self, conversation_id):
        from messagerie.models import Conversation

        return Conversation.objects.filter(
            pk=conversation_id, participants=self.utilisateur
        ).exists()

    @staticmethod
    async def diffuser(conversation_id, evenement):
        """Rediffuse au groupe (typing…) — même enveloppe que temps_reel.publier."""
        from channels.layers import get_channel_layer

        couche = get_channel_layer()
        await couche.group_send(
            f"conv.{conversation_id}",
            {"type": "evenement.chat", "texte": json.dumps(evenement)},
        )
