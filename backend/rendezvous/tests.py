"""Tests RDV — machine à états doc 06, /prochain/ avant /:id/, RG date/lieu/binôme."""

from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from rendezvous.models import RendezVous

pytestmark = pytest.mark.django_db


def _auth(api, user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _rdv(users, **surcharge):
    base = dict(
        organisateur=users.awa,
        invite=users.ivo,
        titre="Séance OSI",
        date_heure=timezone.now() + timedelta(days=1),
        lieu="Salle B12",
        mode="presentiel",
    )
    base.update(surcharge)
    return RendezVous.objects.create(**base)


def test_liste_scopes_a_venir_et_passes(api, users, binome):
    futur = _rdv(users)
    passe = _rdv(users, date_heure=timezone.now() - timedelta(days=2), titre="Vieux")
    client = _auth(api, users.ivo)

    a_venir = client.get("/api/rendez-vous/", {"scope": "a_venir"}).json()
    assert a_venir["count"] == 1
    assert a_venir["results"][0]["id"] == futur.pk
    assert a_venir["results"][0]["organisateurMoi"] is False  # organisé par Awa

    passes = client.get("/api/rendez-vous/", {"scope": "passes"}).json()
    assert [r["id"] for r in passes["results"]] == [passe.pk]


def test_prochain_avant_id_et_fenetre_48h(api, users, binome):
    rdv = _rdv(users, statut="confirme")
    client = _auth(api, users.ivo)

    prochain = client.get("/api/rendez-vous/prochain/").json()
    assert prochain["result"]["id"] == rdv.pk  # la route littérale n'est PAS avalée par :id

    # Hors fenêtre 48h → plus de bannière.
    _rdv(users, statut="confirme", date_heure=timezone.now() + timedelta(days=5))
    assert client.get("/api/rendez-vous/prochain/").json()["result"]["id"] == rdv.pk

    # Rappel vu → plus de bannière (le X masque, n'annule pas).
    client.patch(f"/api/rendez-vous/{rdv.pk}/rappel-vu/")
    assert client.get("/api/rendez-vous/prochain/").json()["result"] is None
    rdv.refresh_from_db()
    assert rdv.statut == "confirme"


def test_post_hors_binome_403_et_rg_422(api, users, binome, demain_14h):
    client = _auth(api, users.ivo)
    url = "/api/rendez-vous/"

    hors_binome = client.post(
        url,
        {"inviteId": users.salim.pk, "titre": "Café", "dateHeure": demain_14h.isoformat(),
         "lieu": "Hall", "mode": "presentiel"},
        format="json",
    )
    assert hors_binome.status_code == 403

    date_passee = client.post(
        url,
        {"inviteId": users.awa.pk, "titre": "Café", "dateHeure": "2020-01-01T10:00:00Z",
         "lieu": "Hall", "mode": "presentiel"},
        format="json",
    )
    assert date_passee.status_code == 422

    sans_lieu = client.post(
        url,
        {"inviteId": users.awa.pk, "titre": "Café", "dateHeure": demain_14h.isoformat(),
         "mode": "presentiel"},
        format="json",
    )
    assert sans_lieu.status_code == 422

    ok = client.post(
        url,
        {"inviteId": users.awa.pk, "titre": "Café", "dateHeure": demain_14h.isoformat(),
         "lieu": "Hall", "mode": "presentiel"},
        format="json",
    )
    assert ok.status_code == 201
    assert ok.json()["statut"] == "propose"
    assert ok.json()["organisateurMoi"] is True


def test_machine_etats_propose_confirme_refuse(api, users, binome):
    rdv = _rdv(users)  # Awa propose, Ivo (invité) répond
    client_ivo, client_awa = _auth(api, users.ivo), _auth(api, users.awa)
    url = f"/api/rendez-vous/{rdv.pk}/repondre/"

    # Seul l'invité tranche une propose (doc 06).
    assert client_awa.patch(url, {"decision": "refuse"}, format="json").status_code == 403
    ok = client_ivo.patch(url, {"decision": "confirme"}, format="json")
    assert ok.json()["statut"] == "confirme"

    # Décision inconnue → 422.
    assert client_ivo.patch(url, {"decision": "peut-etre"}, format="json").status_code == 422


def test_machine_etats_contre_proposition_tranchee_par_organisateur(api, users, binome):
    rdv = _rdv(users)
    client_ivo, client_awa = _auth(api, users.ivo), _auth(api, users.awa)
    nouveau = (timezone.now() + timedelta(days=3)).isoformat()

    # L'invité contre-propose.
    cp = client_ivo.post(
        f"/api/rendez-vous/{rdv.pk}/contre-proposition/",
        {"dateHeure": nouveau, "lieu": "Visio"},
        format="json",
    )
    assert cp.json()["statut"] == "contre_propose"
    assert cp.json()["contreProposition"]["lieu"] == "Visio"

    # Seul l'ORGANISATEUR tranche : Ivo (invité) → 403.
    url_repondre = f"/api/rendez-vous/{rdv.pk}/repondre/"
    refus = client_ivo.patch(url_repondre, {"decision": "confirme"}, format="json")
    assert refus.status_code == 403

    # Awa confirme → le créneau de la CP est appliqué.
    decision = client_awa.patch(url_repondre, {"decision": "confirme"}, format="json")
    corps = decision.json()
    assert corps["statut"] == "confirme"
    assert corps["contreProposition"] is None
    rdv.refresh_from_db()
    assert rdv.lieu == "Visio"


def test_annuler_interdits_et_passe(api, users, binome):
    rdv = _rdv(users, statut="confirme")
    client = _auth(api, users.ivo)
    assert client.patch(f"/api/rendez-vous/{rdv.pk}/annuler/").json()["statut"] == "annule"

    clos = _rdv(users, statut="refuse", titre="Refusé")
    assert client.patch(f"/api/rendez-vous/{clos.pk}/annuler/").status_code == 422
