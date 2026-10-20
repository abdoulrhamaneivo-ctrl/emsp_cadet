"""Tests de l'inscription publique."""

import pytest

from .serializers import InscriptionSerializer


@pytest.mark.django_db
def test_inscription_accepte_une_adresse_email_d_un_domaine_externe():
    serializer = InscriptionSerializer(
        data={
            "email": "  Personne.Externe@gmail.com  ",
            "prenom": "Personne",
            "nom": "Externe",
            "classe": "L1",
            "filiere": "Informatique",
            "password": "Rivage!Cobalt-74",
            "casquette": "cadet",
            "acceptConditions": True,
        }
    )

    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["email"] == "personne.externe@gmail.com"
