"""Fil — serializers (shapes doc 09 §2, verbatim front)."""

from rest_framework import serializers

from comptes.serializers import UtilisateurLegereSerializer

from .models import Commentaire, Publication


class CommentaireSerializer(serializers.ModelSerializer):
    auteur = UtilisateurLegereSerializer(read_only=True)
    dateCreation = serializers.DateTimeField(source="date_creation", read_only=True)
    publicationId = serializers.IntegerField(source="publication_id", read_only=True)
    parentId = serializers.SerializerMethodField()

    class Meta:
        model = Commentaire
        fields = [
            "id",
            "publicationId",
            "parentId",
            "auteur",
            "contenu",
            "dateCreation",
        ]

    def get_parentId(self, obj):
        return obj.parent_id


class PublicationSerializer(serializers.ModelSerializer):
    auteur = UtilisateurLegereSerializer(read_only=True)
    dateCreation = serializers.DateTimeField(source="date_creation", read_only=True)
    reactions = serializers.SerializerMethodField()
    maReaction = serializers.SerializerMethodField()
    nbCommentaires = serializers.SerializerMethodField()

    class Meta:
        model = Publication
        fields = [
            "id",
            "type",
            "auteur",
            "contenu",
            "dateCreation",
            "reactions",
            "maReaction",
            "nbCommentaires",
            "masquee",
            "enVerification",
        ]
        read_only_fields = ["masquee", "enVerification"]

    enVerification = serializers.BooleanField(source="en_verification", read_only=True)

    def get_reactions(self, obj):
        decompte = {"bravo": 0, "merci": 0, "utile": 0}
        for reaction in obj.reactions.all():
            if reaction.code in decompte:
                decompte[reaction.code] += 1
        return decompte

    def get_maReaction(self, obj):
        request = self.context.get("request")
        if request is None or request.user.is_anonymous:
            return None
        reaction = obj.reactions.filter(utilisateur=request.user).first()
        return reaction.code if reaction else None

    def get_nbCommentaires(self, obj):
        return obj.commentaires.count()
