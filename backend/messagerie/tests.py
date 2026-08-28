"""Tests messagerie — idempotence, curseur descendant, /lu/, 403 hors participants.

Verbatim des règles doc 08 §2 telles qu'implémentées par les mocks MSW T3a.
"""

import pytest
from rest_framework.test import APIClient

from messagerie.models import Message

pytestmark = pytest.mark.django_db


def _auth(api, user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _creer_messages(conversation, auteur, n, prefixe="msg"):
    return [
        Message.objects.create(
            conversation=conversation,
            auteur=auteur,
            contenu=f"{prefixe} {i}",
            idempotency_key=f"cle-{prefixe}-{i}",
        )
        for i in range(n)
    ]


def test_conversations_tri_plus_recents_dabord_et_shape(api, users, conv_privee):
    from messagerie.models import Conversation

    famille = Conversation.objects.create(
        type=Conversation.Type.GROUPE_FAMILLE,
        titre_groupe="Ta famille",
        icone_code="users",
    )
    famille.participants.set([users.ivo, users.salim])
    _creer_messages(conv_privee, users.awa, 2)
    _creer_messages(famille, users.salim, 1)  # plus récente au sens dernier message

    client = _auth(api, users.ivo)
    reponse = client.get("/api/conversations/")
    assert reponse.status_code == 200
    results = reponse.json()["results"]
    assert len(results) == 2
    assert set(results[0]) == {"id", "type", "interlocuteur", "groupe", "dernierMessage", "nonLus"}
    privee = next(c for c in results if c["type"] == "prive")
    assert privee["interlocuteur"]["prenom"] == "Awa"
    assert privee["groupe"] is None
    assert privee["dernierMessage"]["contenu"] == "msg 1"


def test_pagination_curseur_descendante(api, users, conv_privee):
    messages = _creer_messages(conv_privee, users.awa, 20)  # ids 1..20, insertion chronologique
    client = _auth(api, users.ivo)

    page1 = client.get(f"/api/conversations/{conv_privee.pk}/messages/").json()
    assert len(page1["results"]) == 8
    assert page1["hasMore"] is True
    assert page1["cursor"] == messages[12].pk  # 8e plus récent (id 13) = DERNIER renvoyé
    ids = [m["id"] for m in page1["results"]]
    assert ids == sorted(ids, reverse=True)  # plus récents d'abord

    page2 = client.get(
        f"/api/conversations/{conv_privee.pk}/messages/", {"avant": page1["cursor"]}
    ).json()
    assert all(m["id"] < page1["cursor"] for m in page2["results"])
    assert page2["results"][0]["id"] == messages[11].pk
    assert page2["results"][0]["envoyeParMoi"] is False


def test_post_idempotent_meme_cle_meme_message(api, users, conv_privee):
    client = _auth(api, users.ivo)
    corps = {"contenu": "Salut Awa !", "idempotencyKey": "abc-123"}
    premiere = client.post(
        f"/api/conversations/{conv_privee.pk}/messages/", corps, format="json"
    )
    seconde = client.post(
        f"/api/conversations/{conv_privee.pk}/messages/", corps, format="json"
    )
    assert premiere.status_code == seconde.status_code == 201
    assert premiere.json()["id"] == seconde.json()["id"]  # zéro doublon (règle 1)
    assert Message.objects.filter(conversation=conv_privee).count() == 1
    assert premiere.json()["envoyeParMoi"] is True


def test_post_contenu_vide_ou_trop_long_422(api, users, conv_privee):
    client = _auth(api, users.ivo)
    url = f"/api/conversations/{conv_privee.pk}/messages/"
    vide = client.post(url, {"contenu": "   ", "idempotencyKey": "k1"}, format="json")
    trop_long = client.post(
        url, {"contenu": "x" * 2001, "idempotencyKey": "k2"}, format="json"
    )
    assert vide.status_code == 422
    assert trop_long.status_code == 422


def test_non_participant_403(api, users, conv_privee):
    client = _auth(api, users.salim)
    reponse = client.get(f"/api/conversations/{conv_privee.pk}/messages/")
    assert reponse.status_code == 403


def test_marquer_lu_remise_a_zero_et_diffusion(api, users, conv_privee):
    _creer_messages(conv_privee, users.awa, 3)
    client = _auth(api, users.ivo)
    data = client.get(f"/api/conversations/{conv_privee.pk}/messages/").json()
    dernier_id = data["results"][0]["id"]

    reponse = client.patch(
        f"/api/conversations/{conv_privee.pk}/lu/",
        {"dernierMessageId": dernier_id},
        format="json",
    )
    assert reponse.json() == {"ok": True}
    conversations = client.get("/api/conversations/").json()["results"]
    assert conversations[0]["nonLus"] == 0
