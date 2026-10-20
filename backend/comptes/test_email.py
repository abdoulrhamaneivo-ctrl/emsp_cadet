"""Tests du transport Brevo par API HTTPS."""

import json
from unittest.mock import MagicMock, patch

import pytest
from django.test import override_settings

from .auth_views import CourrielIndisponible, _envoyer


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
    BREVO_API_KEY="cle-api-test",
    BREVO_TRANSPORT="api",
    DEFAULT_FROM_EMAIL="EMSP Connect <no-reply@example.com>",
    EMAIL_HOST_USER="",
    EMAIL_HOST_PASSWORD="",
)
def test_envoi_api_brevo_utilise_https_et_envoie_le_contenu_html():
    response = MagicMock()
    response.status = 201
    response.__enter__.return_value = response

    with patch("comptes.auth_views.urlopen", return_value=response) as urlopen:
        _envoyer("admin@example.com", "Sujet", "Texte", "<p>HTML</p>")

    request = urlopen.call_args.args[0]
    payload = json.loads(request.data)
    assert request.full_url == "https://api.brevo.com/v3/smtp/email"
    assert request.get_header("Api-key") == "cle-api-test"
    assert payload["sender"] == {"email": "no-reply@example.com", "name": "EMSP Connect"}
    assert payload["to"] == [{"email": "admin@example.com"}]
    assert payload["subject"] == "Sujet"
    assert payload["htmlContent"] == "<p>HTML</p>"
    assert payload["textContent"] == "Texte"
    urlopen.assert_called_once()


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
    BREVO_API_KEY="cle-api-test",
    BREVO_TRANSPORT="api",
    DEFAULT_FROM_EMAIL="no-reply@example.com",
    EMAIL_HOST_USER="",
    EMAIL_HOST_PASSWORD="",
)
def test_erreur_api_brevo_est_remontee_comme_indisponibilite_courriel():
    with patch("comptes.auth_views.urlopen", side_effect=TimeoutError("timeout")):
        with pytest.raises(CourrielIndisponible):
            _envoyer("admin@example.com", "Sujet", "Texte", "<p>HTML</p>")


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.smtp.EmailBackend",
    BREVO_API_KEY="",
    BREVO_TRANSPORT="api",
    DEFAULT_FROM_EMAIL="no-reply@example.com",
    EMAIL_HOST_USER="smtp-user",
    EMAIL_HOST_PASSWORD="smtp-password",
)
def test_transport_api_sans_cle_refuse_sans_repli_smtp():
    with patch("comptes.auth_views.urlopen") as urlopen:
        with pytest.raises(CourrielIndisponible):
            _envoyer("admin@example.com", "Sujet", "Texte", "<p>HTML</p>")
    urlopen.assert_not_called()
