"""Tests Profil doc 11 — PATCH me (RG5/RG7/RG8), visibilité annuaire, photo,
suppression de compte. Critères d'acceptation §8."""


import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

pytestmark = pytest.mark.django_db


def _client(user):
    from rest_framework.test import APIClient

    client = APIClient()
    client.force_authenticate(user=user)
    return client


def _png(nom="photo.png", taille=200):
    # PNG minimal valide (1×1) — le type mime est forcé par le nom.
    octets = bytes.fromhex(
        "89504e470d0a1a0a0000000d494844520000000100000001080600000"
        "01f15c4890000000d49444154789c626001000000ffff030000060005"
        "57bfabd40000000049454e44ae426082"
    )
    return SimpleUploadedFile(nom, octets * max(1, taille // len(octets)), "image/png")


def test_get_me_shape_v2_sans_roles(api, users):
    donnees = _client(users.awa).get("/api/me/").data
    assert donnees["niveauEtude"] == "L3"
    assert donnees["candidatureAineOuverte"] is False
    assert "isAdmin" not in donnees and "isStaff" not in donnees  # RG5, CA §8 n°5
    assert "email" in donnees


def test_patch_champs_autorises(api, users):
    reponse = _client(users.ivo).patch(
        "/api/me/",
        {"attentes": "Comprendre les réseaux de A à Z.", "filiere": "Digitalisation"},
        format="json",
    )
    assert reponse.status_code == 200
    assert reponse.data["attentes"].startswith("Comprendre")


def test_patch_email_immuable(api, users):
    _client(users.ivo).patch("/api/me/", {"email": "pirate@evil.com"}, format="json")
    users.ivo.refresh_from_db()
    assert users.ivo.email == "ivo@emsp.int"  # Adresse e-mail en lecture seule.


def test_ouverture_candidature_l1_422(api, users):
    reponse = _client(users.salim).patch(
        "/api/me/", {"candidatureAineOuverte": True}, format="json"
    )
    assert reponse.status_code == 422  # RG7 — CA §8 n°1 (POST direct refusé)


def test_ouverture_candidature_l2_200(api, users):
    reponse = _client(users.ivo).patch(
        "/api/me/", {"candidatureAineOuverte": True}, format="json"
    )
    assert reponse.status_code == 200
    assert reponse.data["candidatureAineOuverte"] is True
    users.ivo.refresh_from_db()
    assert users.ivo.candidature_aine_ouverte is True


def test_promotion_l1_l2_toast_sans_auto_ouverture(api, users):
    reponse = _client(users.salim).patch(
        "/api/me/", {"niveauEtude": "L2"}, format="json"
    )
    assert reponse.status_code == 200
    assert reponse.data["promotionDisponible"] is True  # CA §8 n°2
    assert reponse.data["candidatureAineOuverte"] is False  # jamais d'auto-ouverture


def test_fermer_candidature_ne_casse_pas_le_binome(api, users, binome):
    from comptes.models import Binome

    reponse = _client(users.awa).patch(
        "/api/me/", {"candidatureAineOuverte": False}, format="json"
    )
    assert reponse.status_code == 200
    binome.refresh_from_db()
    assert binome.statut == Binome.Statut.ACTIF  # RG8 — CA §8 n°3


def test_visibilite_annuaire_checklist_1_1(api, users):
    client = _client(users.ivo)
    avant = client.get("/api/me/visibilite-annuaire/").data
    assert avant["visible"] is False
    assert avant["motifs"][0] == "candidature"  # en tête (doc 11 §2 n°7)
    assert set(avant["motifs"]) == {
        "candidature",
        "photo",
        "ambitions",
        "projets",
        "pointsForts",
        "pointsFaibles",
    }
    _client(users.ivo).patch(
        "/api/me/",
        {
            "candidatureAineOuverte": True,
            "ambitions": ["a", "b", "c"],
            "projets": ["un projet"],
            "pointsForts": ["fort 1", "fort 2"],
            "pointsFaibles": ["faible 1"],
        },
        format="json",
    )
    apres = client.get("/api/me/visibilite-annuaire/").data
    assert apres["motifs"] == ["photo"]  # il ne manque que la photo
    assert apres["visible"] is False


def test_visibilite_l1_pas_de_motif_candidature(api, users):
    motifs = _client(users.salim).get("/api/me/visibilite-annuaire/").data["motifs"]
    assert "candidature" not in motifs  # L1 = parcours, pas un manquement


def test_photo_upload_valide_201(api, users):
    reponse = _client(users.ivo).post(
        "/api/me/photo/", {"photo": _png()}, format="multipart"
    )
    assert reponse.status_code == 201
    assert reponse.data["photoUrl"]
    users.ivo.refresh_from_db()
    assert users.ivo.photo


def test_photo_type_refuse_422(api, users):
    faux = SimpleUploadedFile("photo.exe", b"MZ...", "application/octet-stream")
    reponse = _client(users.ivo).post("/api/me/photo/", {"photo": faux}, format="multipart")
    assert reponse.status_code == 422


def test_suppression_compte_mauvais_prenom_422(api, users):
    reponse = _client(users.ivo).delete(
        "/api/me/compte/", {"confirmationPrenom": "Autre"}, format="json"
    )
    assert reponse.status_code == 422
    users.ivo.refresh_from_db()
    assert users.ivo.is_active


def test_suppression_compte_ok_desactive_et_anonymise(api, users, binome):
    reponse = _client(users.ivo).delete(
        "/api/me/compte/", {"confirmationPrenom": "ivo"}, format="json"
    )
    assert reponse.status_code == 200
    users.ivo.refresh_from_db()
    assert users.ivo.is_active is False
    assert users.ivo.email.startswith("supprime-")


def test_vitrine_listes_validees(api, users):
    reponse = _client(users.ivo).patch(
        "/api/me/",
        {"ambitions": ["une", "deux", "trois", "quatre", "cinq", "six"]},
        format="json",
    )
    # Contrat 422 (règle métier RG7/vitrine) — MoiView traduit DRF 400 → 422
    assert reponse.status_code == 422
