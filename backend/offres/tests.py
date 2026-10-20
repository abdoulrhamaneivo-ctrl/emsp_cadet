"""Contrats métier des offres — sans données préchargées."""

import pytest

pytestmark = pytest.mark.django_db


def _client(user):
    from rest_framework.test import APIClient

    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _offre(**overrides):
    data = {
        "titre": "Développeur web junior",
        "typeOffre": "stage",
        "entreprise": "EMSP Services",
        "localisation": "Abidjan, Cocody",
        "mission": "Concevoir et maintenir des interfaces web accessibles pour les étudiants.",
        "profil": "Connaître JavaScript et React, et pouvoir travailler en équipe.",
        "modalites": "Stage de six mois, gratification à définir avec la personne retenue.",
        "salaire": "À définir",
        "telework": "Hybride",
    }
    data.update(overrides)
    return data


def test_liste_vide_sans_offres_prechargees(api, users):
    reponse = _client(users.ivo).get("/api/offres/")
    assert reponse.status_code == 200
    assert reponse.data == {"count": 0, "results": []}


def test_alumni_cree_offre_persistante_et_visible(api, users):
    from comptes.models import User

    alumni = User.objects.create_user(
        email="auteur@emsp.int", password="demo", prenom="Awa", nom="Kouassi", niveau_etude="alumni"
    )
    reponse = _client(alumni).post("/api/offres/", _offre(), format="json")
    assert reponse.status_code == 201
    assert reponse.data["titre"] == "Développeur web junior"
    assert reponse.data["typeContrat"] == "stage"
    assert reponse.data["estAuteur"] is True
    assert reponse.data["candidatureEnvoyee"] is False

    liste = _client(users.ivo).get("/api/offres/")
    assert liste.data["count"] == 1
    assert liste.data["results"][0]["entreprise"] == "EMSP Services"


def test_etudiant_ne_peut_pas_publier_offre(api, users):
    reponse = _client(users.ivo).post("/api/offres/", _offre(), format="json")
    assert reponse.status_code == 403


def test_offre_expiree_non_listee_ni_consultable(api, users):
    from django.utils import timezone

    from comptes.models import User
    from offres.models import Offre

    alumni = User.objects.create_user(
        email="auteur@emsp.int", password="demo", niveau_etude="alumni"
    )
    offre = Offre.objects.create(
        auteur=alumni,
        titre="Offre passée",
        type_offre="stage",
        entreprise="Entreprise",
        localisation="Abidjan",
        mission="Une mission suffisamment longue pour être valide.",
        profil="Un profil suffisamment long pour être valide.",
        modalites="Des modalités suffisamment longues pour être valides.",
        date_limite=timezone.localdate() - timezone.timedelta(days=1),
    )
    client = _client(users.ivo)
    assert client.get("/api/offres/").data["count"] == 0
    assert client.get(f"/api/offres/{offre.pk}/").status_code == 404


def test_candidature_unique_et_auteur_ne_peut_pas_postuler(api, users):
    from comptes.models import User
    from offres.models import Offre

    alumni = User.objects.create_user(
        email="auteur@emsp.int", password="demo", niveau_etude="alumni"
    )
    offre = Offre.objects.create(
        auteur=alumni,
        titre="Stage en développement",
        type_offre="stage",
        entreprise="EMSP Services",
        localisation="Abidjan",
        mission="Développer des outils pour la communauté EMSP.",
        profil="Connaître les bases de JavaScript et de React.",
        modalites="Stage de six mois, calendrier à convenir avec le tuteur.",
    )

    candidat = _client(users.ivo)
    url = f"/api/offres/{offre.pk}/candidater/"
    assert (
        candidat.post(url, {"message": "Je souhaite candidater."}, format="json").status_code == 201
    )
    assert candidat.post(url, {"message": "Deuxième envoi."}, format="json").status_code == 409
    assert _client(alumni).post(url, {}, format="json").status_code == 422

    candidatures_url = f"/api/offres/{offre.pk}/candidatures/"
    reponse_auteur = _client(alumni).get(candidatures_url)
    assert reponse_auteur.status_code == 200
    assert reponse_auteur.data["count"] == 1
    assert reponse_auteur.data["results"][0]["email"] == users.ivo.email
    assert candidat.get(candidatures_url).status_code == 403
