"""Les liens de reset révoquent les sessions déjà ouvertes."""

import pytest
from django.contrib.auth.tokens import default_token_generator
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework_simplejwt.tokens import AccessToken


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend")
def test_reset_revoque_refresh_et_access_existants(api, users):
    user = users.ivo
    connexion = api.post(
        "/api/auth/connexion/",
        {"email": user.email, "password": "demo"},
        format="json",
    )
    assert connexion.status_code == 200
    access = connexion.json()["access"]
    refresh = api.cookies["refresh_token"].value

    reinitialisation = api.post(
        "/api/auth/reinitialiser-mot-de-passe/",
        {
            "uid": urlsafe_base64_encode(force_bytes(user.pk)),
            "token": default_token_generator.make_token(user),
            "password": "Mauve!Riviere-2026",
        },
        format="json",
    )
    assert reinitialisation.status_code == 200
    user.refresh_from_db()
    assert user.check_password("Mauve!Riviere-2026")
    assert user.password_version == 1

    client_session = api.__class__()
    client_session.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    assert client_session.get("/api/auth/session/").status_code == 401

    api.cookies["refresh_token"] = refresh
    actualisation = api.post("/api/auth/refresh/")
    assert actualisation.status_code == 401


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend")
def test_reset_refuse_un_jeton_invalide_sans_modifier_le_mot_de_passe(api, users):
    user = users.ivo
    reponse = api.post(
        "/api/auth/reinitialiser-mot-de-passe/",
        {
            "uid": urlsafe_base64_encode(force_bytes(user.pk)),
            "token": "jeton-invalide",
            "password": "Mauve!Riviere-2026",
        },
        format="json",
    )

    assert reponse.status_code == 400
    user.refresh_from_db()
    assert user.check_password("demo")


@pytest.mark.django_db
@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
    BREVO_TRANSPORT="api",
    BREVO_API_KEY="",
    DEFAULT_FROM_EMAIL="",
)
def test_reset_valide_le_lien_meme_si_brevo_est_indisponible(api, users):
    user = users.ivo
    reinitialisation = api.post(
        "/api/auth/reinitialiser-mot-de-passe/",
        {
            "uid": urlsafe_base64_encode(force_bytes(user.pk)),
            "token": default_token_generator.make_token(user),
            "password": "Mauve!Riviere-2026",
        },
        format="json",
    )

    assert reinitialisation.status_code == 200
    user.refresh_from_db()
    assert user.check_password("Mauve!Riviere-2026")


@pytest.mark.django_db
def test_ancien_jeton_sans_version_reste_valide_jusqua_un_changement_de_mot_de_passe(api, users):
    jeton_legacy = AccessToken.for_user(users.ivo)
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {jeton_legacy}")

    reponse = api.get("/api/auth/session/")

    assert reponse.status_code == 200
    assert reponse.json()["estAuthentifie"] is True
