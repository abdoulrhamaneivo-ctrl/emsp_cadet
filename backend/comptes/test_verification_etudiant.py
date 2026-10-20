"""Accès aux cartes et décisions de validation réservés au personnel."""

from io import BytesIO

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APIClient

from .models import User, VerificationEtudiant
from .serializers import InscriptionSerializer


def _carte():
    sortie = BytesIO()
    Image.new("RGB", (800, 500), color="white").save(sortie, format="JPEG")
    return SimpleUploadedFile("carte.jpg", sortie.getvalue(), content_type="image/jpeg")


def _creer_dossier():
    serializer = InscriptionSerializer(
        data={
            "email": "candidate@gmail.com",
            "prenom": "Awa",
            "nom": "Kouassi",
            "classe": "L2",
            "filiere": "Informatique",
            "matricule": "EMSP-2024-009",
            "promotion": "2024",
            "carteEtudiant": _carte(),
            "password": "Rivage!Cobalt-74",
            "casquette": "cadet",
            "acceptConditions": True,
        }
    )
    assert serializer.is_valid(), serializer.errors
    return serializer.save()


@pytest.mark.django_db(transaction=True)
def test_carte_etudiante_est_visible_seulement_a_l_admin_et_supprimee_apres_decision(tmp_path):
    with override_settings(
        STUDENT_CARD_STORAGE_ROOT=tmp_path,
        EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend",
    ):
        candidate = _creer_dossier()
        candidate.email_verifie = True
        candidate.save(update_fields=["email_verifie"])
        verification = VerificationEtudiant.objects.get(utilisateur=candidate)
        nom_carte = verification.carte_etudiant.name
        User.objects.create_user(
            email="ancienne@gmail.com",
            prenom="Awa",
            nom="Kouassi",
            classe="L2",
        )
        admin = User.objects.create_user(
            email="admin@gmail.com", password="admin-pass", is_staff=True
        )
        client_admin = APIClient()
        client_admin.force_authenticate(admin)
        client_etudiant = APIClient()
        client_etudiant.force_authenticate(User.objects.create_user(email="membre@gmail.com"))

        refuse = client_etudiant.get(
            f"/api/admin/verifications-etudiants/{verification.pk}/carte/"
        )
        assert refuse.status_code == 422

        liste = client_admin.get("/api/admin/verifications-etudiants/")
        assert liste.status_code == 200
        assert liste["Cache-Control"] == "no-store, private"
        assert liste.json()["results"][0]["matricule"] == "EMSP2024009"
        assert liste.json()["results"][0]["homonymeMemeClasseOuPromotion"] is True

        carte = client_admin.get(
            f"/api/admin/verifications-etudiants/{verification.pk}/carte/"
        )
        assert carte.status_code == 200
        assert carte["Content-Type"] == "image/jpeg"
        assert carte["Cache-Control"] == "no-store, private"

        decision = client_admin.post(
            "/api/admin/verifications-etudiants/",
            {"verificationId": verification.pk, "decision": "approuver"},
            format="json",
        )
        assert decision.status_code == 200
        candidate.refresh_from_db()
        verification.refresh_from_db()
        assert candidate.is_active is True
        assert candidate.statut_compte == User.StatutCompte.ACTIF
        assert not verification.carte_etudiant
        assert not verification.carte_etudiant.storage.exists(nom_carte)

        apres_decision = client_admin.get(
            f"/api/admin/verifications-etudiants/{verification.pk}/carte/"
        )
        assert apres_decision.status_code == 422
        connexion = client_etudiant.post(
            "/api/auth/connexion/",
            {"email": "candidate@gmail.com", "password": "Rivage!Cobalt-74"},
            format="json",
        )
        assert connexion.status_code == 200


@pytest.mark.django_db
def test_validation_admin_refusee_tant_que_le_mail_n_est_pas_confirme(tmp_path):
    with override_settings(
        STUDENT_CARD_STORAGE_ROOT=tmp_path,
        EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend",
    ):
        candidate = _creer_dossier()
        verification = VerificationEtudiant.objects.get(utilisateur=candidate)
        admin = User.objects.create_user(
            email="admin@gmail.com", password="admin-pass", is_staff=True
        )
        api = APIClient()
        api.force_authenticate(admin)

        reponse = api.post(
            "/api/admin/verifications-etudiants/",
            {"verificationId": verification.pk, "decision": "approuver"},
            format="json",
        )

        assert reponse.status_code == 422
        candidate.refresh_from_db()
        assert candidate.statut_compte == User.StatutCompte.EN_ATTENTE
        assert candidate.is_active is False
        verification.carte_etudiant.delete(save=True)
