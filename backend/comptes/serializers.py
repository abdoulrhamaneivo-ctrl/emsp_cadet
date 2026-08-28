"""Comptes — serializers (shape utilisateur consommé par le front T1/T3)."""

from rest_framework import serializers

from .models import Binome, User


class UtilisateurLegereSerializer(serializers.ModelSerializer):
    """Shape `Utilisateur` doc 21 §3.1 — prenom/nom/classe/filiere/photoUrl."""

    photoUrl = serializers.CharField(source="photo_url", read_only=True, default=None)

    class Meta:
        model = User
        fields = ["id", "prenom", "nom", "classe", "filiere", "photoUrl"]


class BinomeSerializer(serializers.ModelSerializer):
    aine = UtilisateurLegereSerializer(read_only=True)
    cadet = UtilisateurLegereSerializer(read_only=True)

    class Meta:
        model = Binome
        fields = ["id", "aine", "cadet", "statut"]
