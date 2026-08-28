"""Tests WebSocket — token requis, participants seulement, diffusion message.new (doc 21 §4)."""

import asyncio

import pytest
from channels.testing import WebsocketCommunicator
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

pytestmark = pytest.mark.django_db


def _client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _access(user):
    return str(RefreshToken.for_user(user).access_token)


def _connecter(token):
    # Bind DIRECT sur le routing WS : isole le consumer de la stack racine
    # (AllowedHostsOriginValidator / AuthMiddlewareStack) pendant les tests.
    from channels.routing import URLRouter

    from messagerie.routing import websocket_urlpatterns

    return WebsocketCommunicator(
        URLRouter(websocket_urlpatterns), f"/ws/chat/?token={token}"
    )


def test_ws_sans_token_valide_refuse(users):
    async def scenario():
        communicateur = _connecter("jeton-faux")
        connecte, _ = await communicateur.connect()
        if connecte:
            await communicateur.disconnect()
        return connecte

    # Le serveur de test Channels ne restitue pas le code de close distant :
    # on asserte le REFUS, pas le code exact (4401 côté serveur réel).
    assert asyncio.run(scenario()) is False


@pytest.mark.django_db(transaction=True)
def test_join_non_participant_refuse(users, conv_privee):
    # transaction=True : les fixtures doivent être COMMITÉES pour être visibles
    # depuis le thread du consumer (database_sync_to_async = autre connexion DB).
    jeton_salim = _access(users.salim)

    async def scenario():
        communicateur = _connecter(jeton_salim)
        connecte, _ = await communicateur.connect()
        if not connecte:
            return None
        await communicateur.send_json_to({"type": "join", "conversationId": conv_privee.pk})
        reponse = await communicateur.receive_json_from(timeout=3)
        await communicateur.disconnect()
        return reponse

    reponse = asyncio.run(scenario())
    assert reponse["type"] == "erreur"  # Salim n'est pas participant


@pytest.mark.django_db(transaction=True)
def test_message_new_diffuse_au_binome(api, users, conv_privee):
    """E2E : Ivo joint la conv, Awa POST en REST → Ivo reçoit message.new."""
    jeton_ivo = _access(users.ivo)  # hors boucle async (cf. ci-dessus)
    client_awa = _client(users.awa)

    async def scenario():
        communicateur = _connecter(jeton_ivo)
        connecte, _ = await communicateur.connect()
        if not connecte:
            return None
        await communicateur.send_json_to({"type": "join", "conversationId": conv_privee.pk})
        await asyncio.sleep(0.3)  # laisse le join être traité
        await asyncio.to_thread(
            client_awa.post,
            f"/api/conversations/{conv_privee.pk}/messages/",
            {"contenu": "Coucou temps réel", "idempotencyKey": "ws-1"},
            format="json",
        )
        evenement = await communicateur.receive_json_from(timeout=3)
        await communicateur.disconnect()
        return evenement

    evenement = asyncio.run(scenario())
    assert evenement["type"] == "message.new"
    assert evenement["conversationId"] == conv_privee.pk
    assert evenement["message"]["contenu"] == "Coucou temps réel"
    assert evenement["message"]["envoyeParMoi"] is False  # reçu par Ivo, envoyé par Awa
