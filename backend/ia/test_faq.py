"""Tests IA-4 FAQ L1 (doc 17 §2)."""

import pytest


@pytest.mark.django_db
def test_faq_trouve_inscription():
    from ia.faq import rechercher_reponse
    res = rechercher_reponse("Comment m'inscrire sur EMSP Connect ?")
    assert res["trouve"] is True
    assert res["reponse"] is not None
    assert len(res["reponse"]) > 0
    assert res["score"] > 0


@pytest.mark.django_db
def test_faq_trouve_parrainage():
    from ia.faq import rechercher_reponse
    res = rechercher_reponse("Comment fonctionne le parrainage ?")
    assert res["trouve"] is True
    assert res["reponse"] is not None
    assert len(res["reponse"]) > 0
    assert res["score"] > 0


@pytest.mark.django_db
def test_faq_non_trouve_retourne_false():
    from ia.faq import rechercher_reponse
    res = rechercher_reponse("Quelle est la capitale de la France ?")
    assert res["trouve"] is False


@pytest.mark.django_db
def test_faq_view_accessible(api):
    """POST /api/faq/ accessible sans auth (AllowAny)."""
    res = api.post("/api/faq/", {"question": "Comment m'inscrire ?"}, format="json")
    assert res.status_code == 200
    assert res.json()["trouve"] is True


@pytest.mark.django_db
def test_faq_view_non_trouve(api):
    res = api.post("/api/faq/", {"question": "Capital de la France ?"}, format="json")
    assert res.status_code == 200
    assert res.json()["trouve"] is False
