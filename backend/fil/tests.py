"""Tests Fil doc 09 — contrat REST (feed, publication, réactions, commentaires,
signalements, règle 1 question/jour) + pagination."""

import pytest

pytestmark = pytest.mark.django_db


def _force_auth(client, user):
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def publication(users):
    from fil.models import Publication

    return Publication.objects.create(
        type=Publication.Type.ANNONCE,
        auteur=users.awa,
        contenu="Annonce de test assez longue pour passer la validation de longueur.",
    )


def test_liste_vide_401_si_non_connecte(api):
    reponse = api.get("/api/publications/")
    assert reponse.status_code == 401


def test_feed_vide_200(api, users):
    reponse = _force_auth(api, users.ivo).get("/api/publications/")
    assert reponse.status_code == 200
    assert reponse.data == {"count": 0, "results": []}


def test_publication_valide_201(api, users):
    reponse = _force_auth(api, users.ivo).post(
        "/api/publications/",
        {"type": "succes", "contenu": "Mon premier test unitaire réussi !"},
        format="json",
    )
    assert reponse.status_code == 201
    assert reponse.data["type"] == "succes"
    assert reponse.data["reactions"] == {"bravo": 0, "merci": 0, "utile": 0}


def test_publication_trop_courte_422(api, users):
    reponse = _force_auth(api, users.ivo).post(
        "/api/publications/", {"type": "annonce", "contenu": "court"}, format="json"
    )
    assert reponse.status_code == 422


def test_publication_type_inconnu_422(api, users):
    reponse = _force_auth(api, users.ivo).post(
        "/api/publications/",
        {"type": "publipostage", "contenu": "Un contenu bien plus long que 10 chars."},
        format="json",
    )
    assert reponse.status_code == 422


def test_une_question_par_jour_409(api, users):
    client = _force_auth(api, users.ivo)
    premiere = client.post(
        "/api/publications/",
        {"type": "question", "contenu": "Quel est le meilleur ordre des couches OSI ?"},
        format="json",
    )
    assert premiere.status_code == 201
    seconde = client.post(
        "/api/publications/",
        {"type": "question", "contenu": "Et pourquoi pas l'ordre inverse, du lien vers l'appli ?"},
        format="json",
    )
    assert seconde.status_code == 409


def test_question_restantes_decline(api, users):
    client = _force_auth(api, users.ivo)
    avant = client.get("/api/publications/questions-restantes/").data
    assert avant["restantes"] == 1
    client.post(
        "/api/publications/",
        {"type": "question", "contenu": "Une question qui consomme le quota du jour."},
        format="json",
    )
    apres = client.get("/api/publications/questions-restantes/").data
    assert apres["restantes"] == 0


def test_edition_refusee_si_commentee_409(api, users, publication):
    from fil.models import Commentaire

    Commentaire.objects.create(
        publication=publication, auteur=users.ivo, contenu="Réponse utile"
    )
    reponse = _force_auth(api, users.awa).patch(
        f"/api/publications/{publication.pk}/",
        {"contenu": "Tentative d'édition après commentaire, bien assez longue."},
        format="json",
    )
    assert reponse.status_code == 409


def test_edition_par_non_auteur_403(api, users, publication):
    reponse = _force_auth(api, users.ivo).patch(
        f"/api/publications/{publication.pk}/",
        {"contenu": "Contenu modifié par quelqu'un d'autre, assez long."},
        format="json",
    )
    assert reponse.status_code == 403


def test_edition_par_auteur_200(api, users, publication):
    reponse = _force_auth(api, users.awa).patch(
        f"/api/publications/{publication.pk}/",
        {"contenu": "Contenu corrigé par l'auteur lui-même, assez long."},
        format="json",
    )
    assert reponse.status_code == 200
    assert reponse.data["contenu"].startswith("Contenu corrigé")


def test_reaction_toggle(api, users, publication):
    client = _force_auth(api, users.ivo)
    ajout = client.post(
        f"/api/publications/{publication.pk}/reactions/", {"code": "bravo"}, format="json"
    )
    assert ajout.status_code == 201 and ajout.data["maReaction"] == "bravo"
    retrait = client.post(
        f"/api/publications/{publication.pk}/reactions/", {"code": "bravo"}, format="json"
    )
    assert retrait.status_code == 200 and retrait.data["maReaction"] is None
    inconnu = client.post(
        f"/api/publications/{publication.pk}/reactions/", {"code": "cœur"}, format="json"
    )
    assert inconnu.status_code == 422


def test_commentaire_aplatit_les_reponses(api, users, publication):
    client = _force_auth(api, users.ivo)
    racine = client.post(
        f"/api/publications/{publication.pk}/commentaires/",
        {"contenu": "Racine", "idempotencyKey": "c1"},
        format="json",
    )
    niveau1 = client.post(
        f"/api/publications/{publication.pk}/commentaires/",
        {"contenu": "Réponse niveau 1", "parentId": racine.data["id"], "idempotencyKey": "c2"},
        format="json",
    )
    niveau2 = client.post(
        f"/api/publications/{publication.pk}/commentaires/",
        {
            "contenu": "Réponse à la réponse",
            "parentId": niveau1.data["id"],
            "idempotencyKey": "c3",
        },
        format="json",
    )
    # Le niveau 2 est aplati : son parent = la racine (parentId de niveau1).
    assert niveau2.data["parentId"] == racine.data["id"]
    from fil.models import Commentaire

    assert Commentaire.objects.get(pk=niveau2.data["id"]).parent_id == racine.data["id"]


def test_commentaire_idempotent(api, users, publication):
    client = _force_auth(api, users.ivo)
    corps = {"contenu": "Message idempotent", "idempotencyKey": "cle-1"}
    premiere = client.post(
        f"/api/publications/{publication.pk}/commentaires/", corps, format="json"
    )
    deuxieme = client.post(
        f"/api/publications/{publication.pk}/commentaires/", corps, format="json"
    )
    assert premiere.status_code == 201 and deuxieme.status_code == 201
    assert premiere.data["id"] == deuxieme.data["id"]


def test_commentaire_trop_court_422(api, users, publication):
    reponse = _force_auth(api, users.ivo).post(
        f"/api/publications/{publication.pk}/commentaires/",
        {"contenu": "x", "idempotencyKey": "c-x"},
        format="json",
    )
    assert reponse.status_code == 422


def test_suppression_commentaire_admin_ok_auteur_ok_autre_403(api, users, publication):
    from comptes.models import User as UserModele
    from fil.models import Commentaire

    commentaire = Commentaire.objects.create(
        publication=publication, auteur=users.salim, contenu="À supprimer"
    )
    autre = _force_auth(api, users.ivo).delete(f"/api/commentaires/{commentaire.pk}/")
    assert autre.status_code == 403
    admin = UserModele.objects.create_user(
        email="admin@emsp.int",
        password="demo",
        prenom="Admin",
        nom="EMSP",
        is_staff=True,
    )
    admin_client = _force_auth(api, admin)
    assert admin_client.delete(f"/api/commentaires/{commentaire.pk}/").status_code == 200


def test_signalement_masque_la_publication(api, users, publication):

    reponse = _force_auth(api, users.salim).post(
        "/api/signalements/",
        {
            "contentType": "publication",
            "objectId": publication.pk,
            "raison": "spam",
        },
        format="json",
    )
    assert reponse.status_code == 201
    publication.refresh_from_db()
    assert publication.masquee is True
    # L'auteur la voit toujours (panneau « en attente de modération » côté front)…
    liste_awa = _force_auth(api, users.awa).get("/api/publications/").data
    assert any(p["id"] == publication.pk for p in liste_awa["results"])
    # …mais plus les autres.
    liste_ivo = _force_auth(api, users.ivo).get("/api/publications/").data
    assert not any(p["id"] == publication.pk for p in liste_ivo["results"])


def test_signalement_raison_inconnue_422(api, users, publication):
    reponse = _force_auth(api, users.ivo).post(
        "/api/signalements/",
        {"contentType": "publication", "objectId": publication.pk, "raison": "megalol"},
        format="json",
    )
    assert reponse.status_code == 422


def test_pagination_feed(api, users):
    from fil.models import Publication

    for i in range(12):
        Publication.objects.create(
            type=Publication.Type.ANNONCE,
            auteur=users.awa,
            contenu=f"Publication de remplissage numéro {i} — bien assez longue.",
        )
    page1 = _force_auth(api, users.ivo).get("/api/publications/").data
    page2 = _force_auth(api, users.ivo).get("/api/publications/?page=2").data
    assert page1["count"] == 12
    assert len(page1["results"]) == 10
    assert len(page2["results"]) == 2
