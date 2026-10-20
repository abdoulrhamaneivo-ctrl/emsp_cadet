"""Tests du dossier étudiant et du caractère privé de la carte."""

from io import BytesIO

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APIClient

from .auth_views import CourrielIndisponible
from .models import User, VerificationEtudiant
from .serializers import InscriptionSerializer


def _carte(nom="carte.jpg", format_image="JPEG"):
    sortie = BytesIO()
    Image.new("RGB", (800, 500), color="white").save(sortie, format=format_image)
    extension = "jpg" if format_image == "JPEG" else "png"
    return SimpleUploadedFile(
        nom if nom else f"carte.{extension}",
        sortie.getvalue(),
        content_type=f"image/{'jpeg' if format_image == 'JPEG' else 'png'}",
    )


def _donnees_inscription(email="personne@gmail.com", matricule="EMSP2024001"):
    return {
        "email": email,
        "prenom": "Personne",
        "nom": "Externe",
        "classe": "L1",
        "filiere": "Informatique",
        "matricule": matricule,
        "promotion": "2024",
        "carteEtudiant": _carte(),
        "password": "Rivage!Cobalt-74",
        "casquette": "cadet",
        "acceptConditions": True,
    }


@pytest.mark.django_db
def test_inscription_accepte_une_adresse_email_d_un_domaine_externe():
    serializer = InscriptionSerializer(data=_donnees_inscription("  Personne.Externe@gmail.com  "))

    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["email"] == "personne.externe@gmail.com"
    assert serializer.validated_data["matricule"] == "EMSP2024001"


@pytest.mark.django_db
def test_nouvelle_inscription_reste_bloquee_jusqua_validation_et_carte_privee(tmp_path):
    with override_settings(STUDENT_CARD_STORAGE_ROOT=tmp_path):
        serializer = InscriptionSerializer(data=_donnees_inscription())
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()

        verification = VerificationEtudiant.objects.get(utilisateur=user)
        assert user.statut_compte == User.StatutCompte.EN_ATTENTE
        assert user.is_active is False
        assert user.email_verifie is False
        assert verification.matricule == "EMSP2024001"
        assert verification.carte_etudiant.storage.exists(verification.carte_etudiant.name)
        with pytest.raises(ValueError, match="pas d'URL publique"):
            _ = verification.carte_etudiant.url
        verification.carte_etudiant.delete(save=True)


@pytest.mark.django_db
def test_matricule_unique_apres_normalisation(tmp_path):
    with override_settings(STUDENT_CARD_STORAGE_ROOT=tmp_path):
        serializer = InscriptionSerializer(data=_donnees_inscription())
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()

        doublon = InscriptionSerializer(
            data=_donnees_inscription("autre@gmail.com", " emsp-2024-001 ")
        )
        assert not doublon.is_valid()
        assert "matricule" in doublon.errors
        user.verification_etudiant.carte_etudiant.delete(save=True)


@pytest.mark.django_db
def test_fichier_non_image_refuse_meme_si_extension_et_type_sont_falsifies():
    donnees = _donnees_inscription()
    donnees["carteEtudiant"] = SimpleUploadedFile(
        "carte.jpg", b"contenu qui n'est pas une image", content_type="image/jpeg"
    )
    serializer = InscriptionSerializer(data=donnees)

    assert not serializer.is_valid()
    assert "carteEtudiant" in serializer.errors


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend")
def test_inscription_http_accepte_multipart_et_cree_un_compte_en_attente(tmp_path):
    with override_settings(STUDENT_CARD_STORAGE_ROOT=tmp_path):
        response = APIClient().post(
            "/api/auth/inscription/",
            _donnees_inscription("web@gmail.com"),
            format="multipart",
        )

        assert response.status_code == 201, response.json()
        user = User.objects.get(email="web@gmail.com")
        assert user.is_active is False
        assert user.statut_compte == User.StatutCompte.EN_ATTENTE
        assert VerificationEtudiant.objects.filter(utilisateur=user).exists()
        user.verification_etudiant.carte_etudiant.delete(save=True)


@pytest.mark.django_db
@override_settings(EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend")
def test_echec_envoi_email_annule_le_compte_et_supprime_la_carte_privee(
    tmp_path, monkeypatch
):
    from comptes import auth_views

    def echec_envoi(_user):
        raise CourrielIndisponible()

    monkeypatch.setattr(auth_views, "_envoyer_verification", echec_envoi)
    with override_settings(STUDENT_CARD_STORAGE_ROOT=tmp_path):
        response = APIClient().post(
            "/api/auth/inscription/",
            _donnees_inscription("echec@gmail.com"),
            format="multipart",
        )

        assert response.status_code == 503
        assert not User.objects.filter(email="echec@gmail.com").exists()
        assert not list(tmp_path.rglob("*.jpg"))


@pytest.mark.django_db
def test_compte_etudiant_en_attente_ne_peut_pas_obtenir_de_jeton(api):
    User.objects.create_user(
        email="attente@gmail.com",
        password="Rivage!Cobalt-74",
        email_verifie=True,
        statut_compte=User.StatutCompte.EN_ATTENTE,
        is_active=False,
    )

    reponse = api.post(
        "/api/auth/connexion/",
        {"email": "attente@gmail.com", "password": "Rivage!Cobalt-74"},
        format="json",
    )

    assert reponse.status_code == 401
    assert "attente de validation" in reponse.json()["detail"]
