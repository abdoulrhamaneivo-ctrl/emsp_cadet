"""Tests IA-6 : génération des propositions uniquement après consentement."""

import pytest

pytestmark = pytest.mark.django_db


def test_generer_offre_necessite_consentement(api, users):
    api.force_authenticate(user=users.awa)
    reponse = api.post(
        "/api/offres/generer/",
        {"typeOffre": "stage", "variables": {"projet": "réseaux"}},
        format="json",
    )
    assert reponse.status_code == 422
    assert "préférences IA" in reponse.data["detail"]


def test_generer_offre_propose_trois_textes_par_section_avec_consentement(api, users):
    users.awa.preferences_ia = {"copilot": True}
    users.awa.save(update_fields=["preferences_ia"])
    api.force_authenticate(user=users.awa)
    reponse = api.post(
        "/api/offres/generer/",
        {
            "typeOffre": "stage",
            "variables": {
                "equipe": "Réseaux",
                "projet": "supervision du campus",
                "taches_principales": "configurer les équipements",
                "formation": "Télécoms",
            },
        },
        format="json",
    )
    assert reponse.status_code == 200
    assert set(reponse.data) == {"mission", "profil", "modalites"}
    assert all(len(reponse.data[section]) == 3 for section in reponse.data)
    assert "supervision du campus" in reponse.data["mission"][0]
