"""Comptes — serializers (shape utilisateur consommé par le front T1/T3)."""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Binome, User


class UtilisateurLegereSerializer(serializers.ModelSerializer):
    """Shape `Utilisateur` doc 21 §3.1 — prenom/nom/classe/filiere/photoUrl."""

    photoUrl = serializers.CharField(source="photo_url", read_only=True, default=None)

    class Meta:
        model = User
        fields = ["id", "prenom", "nom", "classe", "filiere", "photoUrl"]


class JetonConnexionSerializer(TokenObtainPairSerializer):
    """Message d'échec de connexion en français (contrat UX, doc 02 §5)."""

    default_error_messages = {
        "no_active_account": "E-mail ou mot de passe incorrect.",
    }


class BinomeSerializer(serializers.ModelSerializer):
    aine = UtilisateurLegereSerializer(read_only=True)
    cadet = UtilisateurLegereSerializer(read_only=True)

    class Meta:
        model = Binome
        fields = ["id", "aine", "cadet", "statut"]
