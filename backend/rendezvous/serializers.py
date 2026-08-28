"""RDV — serializer avec les champs calculés du contrat (organisateurMoi, contreProposition)."""

from rest_framework import serializers

from comptes.serializers import UtilisateurLegereSerializer

from .models import RendezVous


class RendezVousSerializer(serializers.ModelSerializer):
    organisateur = UtilisateurLegereSerializer(read_only=True)
    invite = UtilisateurLegereSerializer(read_only=True)
    organisateurMoi = serializers.SerializerMethodField()
    dateHeure = serializers.DateTimeField(source="date_heure")
    mode = serializers.CharField(read_only=True)
    statut = serializers.CharField(read_only=True)
    lieu = serializers.CharField(read_only=True)
    contreProposition = serializers.SerializerMethodField()
    rappelVu = serializers.BooleanField(source="rappel_vu", read_only=True)

    class Meta:
        model = RendezVous
        fields = [
            "id",
            "organisateur",
            "invite",
            "organisateurMoi",
            "titre",
            "description",
            "dateHeure",
            "lieu",
            "mode",
            "statut",
            "contreProposition",
            "rappelVu",
        ]

    def get_organisateurMoi(self, obj):
        return obj.organisateur_id == self.context["request"].user.pk

    def get_contreProposition(self, obj):
        if obj.cp_date_heure is None:
            return None
        return {
            "dateHeure": obj.cp_date_heure,
            "lieu": obj.cp_lieu or "",
        }
