"""Tests auth & suspension — RG11 423, cookie httpOnly, rotation refresh (doc 21 §6)."""

import pytest
from django.utils import timezone

pytestmark = pytest.mark.django_db


def _connecter(api, email):
    return api.post("/api/auth/connexion/", {"email": email, "password": "demo"}, format="json")


def test_connexion_renvoie_access_et_cookie_httponly(api, users, settings):
    reponse = _connecter(api, "ivo@emsp.int")
    assert reponse.status_code == 200
    assert "access" in reponse.json()
    cookie = reponse.cookies["refresh_token"]
    assert cookie["httponly"]  # jamais lisible en JS (doc 19 §5.1)
    assert cookie["path"] == settings.SIMPLE_JWT["REFRESH_TOKEN_COOKIE_PATH"]


def test_refresh_sans_corps_renvoie_un_access(api, users):
    _connecter(api, "ivo@emsp.int")
    reponse = api.post("/api/auth/refresh/")  # le cookie fait le travail
    assert reponse.status_code == 200
    assert "access" in reponse.json()


def test_refresh_ignore_un_bearer_incorrect_et_utilise_le_cookie(api, users):
    _connecter(api, "ivo@emsp.int")
    refresh = api.cookies["refresh_token"].value
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh}")

    reponse = api.post("/api/auth/refresh/")

    assert reponse.status_code == 200
    assert "access" in reponse.json()


def test_acces_sans_token_refuse(api, users):
    assert api.get("/api/conversations/").status_code == 401


def test_mauvais_mot_de_passe_401(api, users):
    reponse = api.post(
        "/api/auth/connexion/", {"email": "ivo@emsp.int", "password": "faux"}, format="json"
    )
    assert reponse.status_code == 401
    assert "incorrect" in reponse.json()["detail"].lower()


def test_compte_suspendu_423_avec_motif_et_fin(api, users):
    users.ivo.est_suspendu = True
    users.ivo.fin_suspension = timezone.now() + timezone.timedelta(days=3)
    users.ivo.save()
    access = _connecter(api, "ivo@emsp.int").json()["access"]
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    reponse = api.get("/api/conversations/")
    assert reponse.status_code == 423
    assert reponse.json()["motif"] == "suspendu"
    assert reponse.json()["fin"] is not None


def test_deconnexion_blackliste_le_refresh(api, users):
    _connecter(api, "ivo@emsp.int")
    assert api.post("/api/auth/deconnexion/").status_code == 200
    # Le refresh a été blacklisté : plus d'access possible.
    assert api.post("/api/auth/refresh/").status_code == 401
