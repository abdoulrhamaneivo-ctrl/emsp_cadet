"""Tests IA-2 Matching enrichi (doc 17 §2) — unitaires."""

import pytest


@pytest.mark.django_db
def test_matching_score_zero_si_attentes_vides():
    from ia.matching import calculer_score_matching
    score = calculer_score_matching("", {"ambitions": ["reseau"], "projets": [], "pointsForts": [], "pointsFaibles": []})
    assert score == 0


@pytest.mark.django_db
def test_matching_score_eleve_si_termes_communs():
    from ia.matching import calculer_score_matching
    score = calculer_score_matching(
        "Je veux apprendre les reseaux et la securite",
        {"ambitions": ["reseau", "securite"], "projets": ["projet vpn"], "pointsForts": ["linux"], "pointsFaibles": []}
    )
    assert score > 0


@pytest.mark.django_db
def test_matching_raison_ia_contient_termes_communs():
    from ia.matching import generer_raison_ia
    raison = generer_raison_ia(
        "Je veux faire du reseau et de la securite",
        {"ambitions": ["reseau", "securite"], "projets": ["vpn"], "pointsForts": ["linux"], "pointsFaibles": []}
    )
    assert "reseau" in raison.lower() or "securite" in raison.lower()
