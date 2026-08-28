"""Événements — serializers (shapes doc 10 §2, verbatim front)."""

from rest_framework import serializers

from comptes.serializers import UtilisateurLegereSerializer

from .models import Evenement


class EvenementSerializer(serializers.ModelSerializer):
    organisateur = UtilisateurLegereSerializer(read_only=True)
    dateHeure = serializers.DateTimeField(source="date_heure", read_only=True)
    capaciteMax = serializers.IntegerField(source="capacite_max", read_only=True)
    enLigne = serializers.BooleanField(source="en_ligne", read_only=True)
    nbInscrits = serializers.SerializerMethodField()
    inscrit = serializers.SerializerMethodField()

    class Meta:
        model = Evenement
        fields = [
            "id",
            "type",
            "titre",
            "description",
            "organisateur",
            "dateHeure",
            "lieu",
            "enLigne",
            "capaciteMax",
            "nbInscrits",
            "inscrit",
            "annule",
        ]

    def get_nbInscrits(self, obj):
        return obj.inscriptions.count()

    def get_inscrit(self, obj):
        request = self.context.get("request")
        if request is None or request.user.is_anonymous:
            return False
        return obj.inscriptions.filter(participant=request.user).exists()
