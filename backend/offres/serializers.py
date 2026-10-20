"""Sérialisation des offres publiques, sans exposer les coordonnées privées."""

from rest_framework import serializers

from .models import Candidature, Offre


class OffreSerializer(serializers.ModelSerializer):
    typeContrat = serializers.CharField(source="type_offre", read_only=True)
    datePublication = serializers.DateTimeField(source="date_publication", read_only=True)
    dateLimite = serializers.DateField(source="date_limite", read_only=True, allow_null=True)
    telework = serializers.CharField(source="teletravail", read_only=True)
    auteur = serializers.SerializerMethodField()
    estAuteur = serializers.SerializerMethodField()
    candidatureEnvoyee = serializers.SerializerMethodField()

    class Meta:
        model = Offre
        fields = [
            "id",
            "titre",
            "typeContrat",
            "entreprise",
            "localisation",
            "mission",
            "profil",
            "modalites",
            "salaire",
            "telework",
            "datePublication",
            "dateLimite",
            "auteur",
            "estAuteur",
            "candidatureEnvoyee",
        ]

    def get_auteur(self, obj):
        return f"{obj.auteur.prenom} {obj.auteur.nom}".strip()

    def get_estAuteur(self, obj):
        request = self.context.get("request")
        return bool(request and request.user.is_authenticated and request.user.pk == obj.auteur_id)

    def get_candidatureEnvoyee(self, obj):
        request = self.context.get("request")
        return bool(
            request
            and request.user.is_authenticated
            and obj.candidatures.filter(candidat=request.user).exists()
        )


class OffreCreationSerializer(serializers.ModelSerializer):
    typeOffre = serializers.ChoiceField(source="type_offre", choices=Offre.Type.choices)
    dateLimite = serializers.DateField(source="date_limite", required=False, allow_null=True)
    telework = serializers.CharField(source="teletravail", required=False, allow_blank=True)

    class Meta:
        model = Offre
        fields = [
            "titre",
            "typeOffre",
            "entreprise",
            "localisation",
            "mission",
            "profil",
            "modalites",
            "salaire",
            "telework",
            "dateLimite",
        ]

    def validate_titre(self, value):
        value = value.strip()
        if not 5 <= len(value) <= 120:
            raise serializers.ValidationError("Le titre doit compter entre 5 et 120 caractères.")
        return value

    def validate_entreprise(self, value):
        value = value.strip()
        if not 2 <= len(value) <= 120:
            raise serializers.ValidationError(
                "Indique le nom de l'entreprise ou de l'organisation."
            )
        return value

    def validate_localisation(self, value):
        value = value.strip()
        if not 2 <= len(value) <= 160:
            raise serializers.ValidationError("Indique une ville, un quartier ou le télétravail.")
        return value

    def validate(self, attrs):
        from django.utils import timezone

        for key, label in (
            ("mission", "mission"),
            ("profil", "profil recherché"),
            ("modalites", "modalités"),
        ):
            text = (attrs.get(key) or "").strip()
            if not 20 <= len(text) <= 2000:
                raise serializers.ValidationError(
                    {key: f"La section {label} doit compter entre 20 et 2000 caractères."}
                )
            attrs[key] = text
        date_limite = attrs.get("date_limite")
        if date_limite and date_limite < timezone.localdate():
            raise serializers.ValidationError(
                {"dateLimite": "La date limite doit être aujourd'hui ou dans le futur."}
            )
        return attrs


class CandidatureCreationSerializer(serializers.Serializer):
    message = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def validate_message(self, value):
        return value.strip()


class CandidatureSerializer(serializers.ModelSerializer):
    prenom = serializers.CharField(source="candidat.prenom", read_only=True)
    nom = serializers.CharField(source="candidat.nom", read_only=True)
    email = serializers.EmailField(source="candidat.email", read_only=True)
    classe = serializers.CharField(source="candidat.classe", read_only=True)
    dateCandidature = serializers.DateTimeField(source="date_candidature", read_only=True)

    class Meta:
        model = Candidature
        fields = ["id", "prenom", "nom", "email", "classe", "message", "dateCandidature"]
