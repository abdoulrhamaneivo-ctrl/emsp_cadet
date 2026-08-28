"""Tests Événements doc 10 — garde aîné, capacité, H-2h, discussion, annonce."""

import pytest

pytestmark = pytest.mark.django_db


def _auth(client, user):
    """Nouveau client PAR acteur — réutiliser la même instance APIClient
    écraserait le force_authenticate précédent (piège t4b, testé rouge)."""
    client.force_authenticate(user=user)
    return client


def _client(user):
    from rest_framework.test import APIClient

    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _corps_atelier(**plus):
    corps = {
        "type": "Atelier",
        "titre": "Atelier Packet Tracer",
        "description": (
            "Un atelier pratique pour poser les bases du routage statique, lab complet."
        ),
        "dateHeure": "2030-06-15T14:00:00Z",
        "lieu": "Salle B12",
        "enLigne": False,
        "capaciteMax": 3,
    }
    corps.update(plus)
    return corps


@pytest.fixture
def atelier(users):
    from evenements.models import Evenement

    return Evenement.objects.create(
        titre="Atelier SQL",
        description=(
            "Deux heures pour démuscler tes requêtes et finir par un mini-défaut à corriger."
        ),
        organisateur=users.awa,  # L3 Réseaux = aîné (convention préfixe classe)
        date_heure=timezone_dans(48),
        lieu="Salle B12",
        capacite_max=3,
    )


def timezone_dans(heures):
    from django.utils import timezone

    return timezone.localtime() + timezone.timedelta(hours=heures)


def test_cadet_ne_cree_pas_403(api, users):
    reponse = _auth(api, users.salim).post(  # Salim L1 = pas aîné
        "/api/evenements/", _corps_atelier(), format="json"
    )
    assert reponse.status_code == 403


def test_aine_cree_201(api, users):
    reponse = _auth(api, users.awa).post("/api/evenements/", _corps_atelier(), format="json")
    assert reponse.status_code == 201
    assert reponse.data["organisateur"]["id"] == users.awa.pk
    assert reponse.data["nbInscrits"] == 0


def test_admin_cree_201(api, users):
    from comptes.models import User

    admin = User.objects.create_user(
        email="admin@emsp.int", password="demo", prenom="Admin", nom="EMSP", is_staff=True
    )
    reponse = _auth(api, admin).post(
        "/api/evenements/", _corps_atelier(capaciteMax=15), format="json"
    )
    assert reponse.status_code == 201


def test_description_trop_courte_422(api, users):
    reponse = _auth(api, users.awa).post(
        "/api/evenements/", _corps_atelier(description="Trop court."), format="json"
    )
    assert reponse.status_code == 422


def test_presentiel_sans_lieu_422(api, users):
    reponse = _auth(api, users.awa).post(
        "/api/evenements/", _corps_atelier(lieu=""), format="json"
    )
    assert reponse.status_code == 422


def test_date_passee_422(api, users):
    from django.utils import timezone

    passee = (timezone.localtime() - timezone.timedelta(days=1)).isoformat()
    reponse = _auth(api, users.awa).post(
        "/api/evenements/", _corps_atelier(dateHeure=passee), format="json"
    )
    assert reponse.status_code == 422


def test_capacite_stricte_409(api, users, atelier):
    """Capacité 3 : ivo, salim entrent, awa complète → le 4e clic (ivo) est
    un toggle OFF autorisé (200). Sa place se libère : sa réinscription doit
    RÉUSSIR (201) — le 409 protège seulement la course au dernier place."""
    client_ivo = _client(users.ivo)
    assert client_ivo.post(f"/api/evenements/{atelier.pk}/inscription/").status_code == 201
    assert _client(users.salim).post(
        f"/api/evenements/{atelier.pk}/inscription/"
    ).status_code == 201
    assert _client(users.awa).post(f"/api/evenements/{atelier.pk}/inscription/").status_code == 201
    # Toggle OFF autorisé même à capacité pleine (c'est une SORTIE, pas une entrée)
    assert client_ivo.post(f"/api/evenements/{atelier.pk}/inscription/").status_code == 200
    # La place s'est libérée → réinscription OK (3/3 à nouveau)
    assert client_ivo.post(f"/api/evenements/{atelier.pk}/inscription/").status_code == 201
    # Un 4e utilisateur jamais inscrit, événement plein → 409
    from comptes.models import User

    koffi = User.objects.create_user(
        email="koffi@emsp.int", password="demo", prenom="Koffi", nom="Diallo", classe="L1 Info"
    )
    assert _client(koffi).post(f"/api/evenements/{atelier.pk}/inscription/").status_code == 409


def test_desinscription_bloquee_h2_422(api, users):
    from evenements.models import Evenement, Inscription

    bientot = Evenement.objects.create(
        titre="Atelier imminent",
        description="Séance qui commence dans une heure, désinscription bloquée.",
        organisateur=users.awa,
        date_heure=timezone_dans(1),
        lieu="Visio",
        en_ligne=True,
        capacite_max=10,
    )
    Inscription.objects.create(evenement=bientot, participant=users.ivo)
    reponse = _auth(api, users.ivo).post(f"/api/evenements/{bientot.pk}/inscription/")
    assert reponse.status_code == 422


def test_organisateur_ne_se_desinscrit_pas_422(api, users, atelier):
    from evenements.models import Inscription

    Inscription.objects.create(evenement=atelier, participant=users.awa)
    reponse = _auth(api, users.awa).post(f"/api/evenements/{atelier.pk}/inscription/")
    assert reponse.status_code == 422


def test_discussion_reservee_aux_inscrits(api, users, atelier):
    from evenements.models import Inscription

    autre = _auth(api, users.salim)
    assert autre.post(
        f"/api/evenements/{atelier.pk}/messages/",
        {"contenu": "Je ne suis pas inscrit"},
        format="json",
    ).status_code == 403
    inscrit = _auth(api, users.ivo)
    Inscription.objects.create(evenement=atelier, participant=users.ivo)
    reponse = inscrit.post(
        f"/api/evenements/{atelier.pk}/messages/",
        {"contenu": "Question depuis la discussion !"},
        format="json",
    )
    assert reponse.status_code == 201
    # GET : liste simple (discussion plate, doc 10 — pas de pagination imposée)
    messages = inscrit.get(f"/api/evenements/{atelier.pk}/messages/").data
    assert any("Question depuis la discussion" in m["contenu"] for m in messages)


def test_message_discussion_hors_fil(api, users, atelier):
    """Le message d'événement n'apparaît PAS dans le feed du Fil (t4b)."""
    from evenements.models import Inscription

    Inscription.objects.create(evenement=atelier, participant=users.ivo)
    _auth(api, users.ivo).post(
        f"/api/evenements/{atelier.pk}/messages/",
        {"contenu": "Message d'événement"},
        format="json",
    )
    feed = _auth(api, users.awa).get("/api/publications/").data
    assert not any("Message d'événement" in p["contenu"] for p in feed["results"])


def test_annulation_organisateur_publie_sur_le_fil(api, users, atelier):
    reponse = _auth(api, users.awa).patch(
        f"/api/evenements/{atelier.pk}/modifier/", {"annule": True}, format="json"
    )
    assert reponse.status_code == 200
    assert reponse.data["annule"] is True
    feed = _auth(api, users.ivo).get("/api/publications/").data
    assert any("Atelier SQL" in p["contenu"] for p in feed["results"])
    # Et l'événement annulé disparaît du scope a_venir
    liste = _auth(api, users.ivo).get("/api/evenements/").data
    assert not any(e["id"] == atelier.pk for e in liste["results"])


def test_patch_par_non_organisateur_403(api, users, atelier):
    reponse = _auth(api, users.ivo).patch(
        f"/api/evenements/{atelier.pk}/modifier/", {"titre": "Hijack tenté ici"}, format="json"
    )
    assert reponse.status_code == 403


def test_participants_organisateur_toujours_liste(api, users, atelier):
    atelier.inscriptions.create(participant=users.ivo)
    atelier.inscriptions.create(participant=users.awa)
    donnees = _auth(api, users.salim).get(f"/api/evenements/{atelier.pk}/participants/").data
    assert donnees["count"] == 2
    assert any(p["id"] == users.awa.pk for p in donnees["results"])


def test_liste_scope_passes(api, users):
    from evenements.models import Evenement

    Evenement.objects.create(
        titre="Événement passé",
        description="Séance historique conservée pour le détail et la discussion.",
        organisateur=users.awa,
        date_heure=timezone_dans(-24),
        lieu="Bibliothèque",
        capacite_max=10,
    )
    a_venir = _auth(api, users.ivo).get("/api/evenements/").data
    passes = _auth(api, users.ivo).get("/api/evenements/?scope=passes").data
    assert not any("passé" in e["titre"] for e in a_venir["results"])
    assert passes["results"]
