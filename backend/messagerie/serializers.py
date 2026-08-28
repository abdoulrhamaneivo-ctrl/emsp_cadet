"""Messagerie — serializers (shapes doc 21 §3.1, verbatim front T3a)."""

from rest_framework import serializers

from .models import Conversation, Lecture, Message


class DernierMessageSerializer(serializers.Serializer):
    contenu = serializers.CharField()
    dateEnvoi = serializers.DateTimeField(source="date_envoi")


class GroupeSerializer(serializers.Serializer):
    titre = serializers.CharField(source="titre_groupe")
    iconeCode = serializers.CharField(source="icone_code")
    membres = serializers.SerializerMethodField()

    def get_membres(self, obj):
        from comptes.serializers import UtilisateurLegereSerializer

        return UtilisateurLegereSerializer(obj.participants.all(), many=True).data


class ConversationSerializer(serializers.ModelSerializer):
    type = serializers.CharField(read_only=True)
    interlocuteur = serializers.SerializerMethodField()
    groupe = serializers.SerializerMethodField()
    dernierMessage = serializers.SerializerMethodField()
    nonLus = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "type", "interlocuteur", "groupe", "dernierMessage", "nonLus"]

    def _moi(self):
        return self.context["request"].user

    def get_interlocuteur(self, obj):
        if obj.type != Conversation.Type.PRIVE:
            return None
        from comptes.serializers import UtilisateurLegereSerializer

        autre = obj.participants.exclude(pk=self._moi().pk).first()
        return UtilisateurLegereSerializer(autre).data if autre else None

    def get_groupe(self, obj):
        if obj.type != Conversation.Type.GROUPE_FAMILLE:
            return None
        return GroupeSerializer(obj).data

    def get_dernierMessage(self, obj):
        dernier = obj.messages.order_by("-pk").first()
        return DernierMessageSerializer(dernier).data if dernier else None

    def get_nonLus(self, obj):
        return Lecture.non_lus_pour(obj, self._moi())


class MessageSerializer(serializers.ModelSerializer):
    conversationId = serializers.IntegerField(source="conversation_id", read_only=True)
    dateEnvoi = serializers.DateTimeField(source="date_envoi", read_only=True)
    auteurId = serializers.IntegerField(source="auteur_id", read_only=True)
    envoyeParMoi = serializers.SerializerMethodField()
    idempotencyKey = serializers.CharField(source="idempotency_key")

    class Meta:
        model = Message
        fields = [
            "id",
            "conversationId",
            "contenu",
            "dateEnvoi",
            "auteurId",
            "envoyeParMoi",
            "idempotencyKey",
        ]

    def get_envoyeParMoi(self, obj):
        return obj.auteur_id == self.context["request"].user.pk
