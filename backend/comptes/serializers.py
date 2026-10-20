"""Comptes — serializers (shape utilisateur + User v2 doc 11)."""

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Binome, User

NIVEAUX_AINE = ("L2", "L3", "M1", "M2", "alumni")


class UtilisateurLegereSerializer(serializers.ModelSerializer):
    """Shape `Utilisateur` doc 21 §3.1 — prenom/nom/classe/filiere/photoUrl.

    User v2 (doc 11) : le shape s'enrichit de niveauEtude (RG7) et
    candidatureAineOuverte (RG8) — consommés par la garde aîné (t4b) et
    l'interrupteur du profil.
    """

    photoUrl = serializers.SerializerMethodField()
    niveauEtude = serializers.SerializerMethodField()
    candidatureAineOuverte = serializers.SerializerMethodField()
    isAdmin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "prenom",
            "nom",
            "classe",
            "filiere",
            "photoUrl",
            "niveauEtude",
            "candidatureAineOuverte",
            "isAdmin",
        ]

    def get_photoUrl(self, obj):
        return obj.photo.url if obj.photo else None

    def get_niveauEtude(self, obj):
        return obj.niveau_etude or _niveau_de_classe(obj.classe)

    def get_isAdmin(self, obj):
        return bool(obj.is_staff or obj.is_superuser)

    def get_candidatureAineOuverte(self, obj):
        return obj.candidature_aine_ouverte


def _niveau_de_classe(classe):
    """Repli compat : niveau déduit du préfixe de `classe` (« L2 … »)."""
    prefixe = (classe or "").strip().lower()
    for niveau in NIVEAUX_AINE:
        if prefixe.startswith(niveau.lower()):
            return niveau
    return "L1"


class ProfilMoiSerializer(serializers.ModelSerializer):
    """Shape `/api/me/` — lecture/écriture des champs autorisés (doc 11 §2).

    Jamais exposés : isAdmin, is_staff, est_suspendu (RG5 — le rôle ne se
    change pas depuis cette page, il n'apparaît même pas dans le DOM).
    """

    photoUrl = serializers.SerializerMethodField(read_only=True)
    dateInscription = serializers.DateTimeField(source="date_joined", read_only=True)
    intentionAnneeSuivante = serializers.CharField(
        source="intention_annee_suivante", required=False, allow_blank=True
    )
    candidatureAineOuverte = serializers.BooleanField(
        source="candidature_aine_ouverte", required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "prenom",
            "nom",
            "classe",
            "filiere",
            "niveauEtude",
            "candidatureAineOuverte",
            "attentes",
            "ambitions",
            "projets",
            "pointsForts",
            "pointsFaibles",
            "intentionAnneeSuivante",
            "photoUrl",
            "dateInscription",
            "preferencesIA",
        ]
        read_only_fields = ["id", "email", "photoUrl", "dateInscription"]

    def get_niveauEtude(self, obj):
        return obj.niveau_etude or _niveau_de_classe(obj.classe)

    def get_photoUrl(self, obj):
        return obj.photo.url if obj.photo else None

    # ── Mapping camelCase (contrat front) ────────────────────────────────────
    pointsForts = serializers.JSONField(source="points_forts", required=False)
    pointsFaibles = serializers.JSONField(source="points_faibles", required=False)
    preferencesIA = serializers.JSONField(source="preferences_ia", required=False)
    niveauEtude = serializers.ChoiceField(
        choices=User.Niveau.choices, source="niveau_etude", required=False
    )

    def to_internal_value(self, donnees):
        # `candidatureAineOuverte` → `candidature_aine_ouverte` (RG8).
        if "candidatureAineOuverte" in donnees:
            donnees = {
                **donnees,
                "candidature_aine_ouverte": donnees["candidatureAineOuverte"],
            }
        # `preferencesIA` → `preferences_ia` (RG12.4).
        if "preferencesIA" in donnees:
            donnees = {
                **donnees,
                "preferences_ia": donnees["preferencesIA"],
            }
        return super().to_internal_value(donnees)

    def _valider_candidature(self, valeur):
        """RG7 : ouvrir la candidature en L1 est refusé (le front bloque déjà
        le toggle — le serveur revalide TOUT, doc 21 §3)."""
        utilisateur = self.instance
        if (
            valeur
            and utilisateur is not None
            and (utilisateur.niveau_etude or _niveau_de_classe(utilisateur.classe)) == "L1"
        ):
            raise serializers.ValidationError(
                "La candidature Aîné s'ouvre à partir de la L2 (RG7)."
            )
        return valeur

    def validate_email(self, valeur):
        # RG4 : l'email reste @emsp.int (champ read_only mais double barrière).
        if not valeur.lower().endswith("@emsp.int"):
            raise serializers.ValidationError("Adresse @emsp.int requise.")
        return valeur

    def validate(self, attributs):
        # RG7 garde (voir ci-dessus) + validation de l'intention (doc 15).
        intention = attributs.get("intention_annee_suivante")
        if intention is not None:
            niveau = (
                self.instance.niveau_etude if self.instance else None
            ) or "L1"
            if intention not in ("", "inconnu", "master", "alumni"):
                raise serializers.ValidationError("Intention inconnue.")
            # CA doc 15 n°4 : un M2 ne peut PAS déclarer « master ».
            if intention == "master" and niveau == "M2":
                raise serializers.ValidationError(
                    "Le M2 est la dernière année — l'intention « master » n'est pas possible."
                )
            attributs["intention_annee_suivante"] = intention or "inconnu"
        # Le validateur par champ ne court jamais pour `candidatureAineOuverte`
        # (source pointe sur le champ modèle) : la règle RG7 passe ici. DRF
        # fournit `validate()` en clés INTERNES (snake_case, cf. t4b leçons).
        if "candidature_aine_ouverte" not in attributs and self.initial_data.get(
            "candidatureAineOuverte"
        ) is not None:
            attributs["candidature_aine_ouverte"] = self._valider_candidature(
                bool(self.initial_data["candidatureAineOuverte"])
            )
        elif "candidature_aine_ouverte" in attributs:
            attributs["candidature_aine_ouverte"] = self._valider_candidature(
                attributs["candidature_aine_ouverte"]
            )
        return attributs

    def validate_ambitions(self, valeur):
        return _liste_textes(valeur, "ambitions", 5)

    def validate_projets(self, valeur):
        return _liste_textes(valeur, "projets", 8)

    def validate_points_forts(self, valeur):
        return _liste_textes(valeur, "points forts", 6)

    def validate_points_faibles(self, valeur):
        return _liste_textes(valeur, "points faibles", 6)


def _liste_textes(valeur, libelle, maximum):
    """Listes de vitrine : chaînes non vides, 160 chars max par item."""
    if valeur in (None, ""):
        return []
    if not isinstance(valeur, list):
        raise serializers.ValidationError(f"{libelle} : liste attendue.")
    nettoyee = [str(item).strip()[:160] for item in valeur if str(item).strip()]
    if len(nettoyee) > maximum:
        raise serializers.ValidationError(f"{libelle} : {maximum} éléments maximum.")
    return nettoyee


class JetonConnexionSerializer(TokenObtainPairSerializer):
    """Message d'échec de connexion en français (contrat UX, doc 02 §5)."""

    default_error_messages = {
        "no_active_account": "E-mail ou mot de passe incorrect.",
    }

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.email_verifie:
            raise AuthenticationFailed(
                "Confirme ton adresse e-mail avant de te connecter.", code="email_non_verifie"
            )
        return data


class InscriptionSerializer(serializers.Serializer):
    """Création d'un compte étudiant; le rôle admin reste réservé au backend."""

    email = serializers.EmailField()
    prenom = serializers.CharField(max_length=80, trim_whitespace=True)
    nom = serializers.CharField(max_length=80, trim_whitespace=True)
    classe = serializers.CharField(max_length=40)
    filiere = serializers.CharField(max_length=120)
    password = serializers.CharField(write_only=True, min_length=8)
    casquette = serializers.ChoiceField(choices=("cadet", "aine"))
    acceptConditions = serializers.BooleanField()

    def validate_email(self, value):
        value = value.strip().lower()
        if not value.endswith("@emsp.int"):
            raise serializers.ValidationError("Utilise ton adresse e-mail @emsp.int.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Un compte utilise déjà cette adresse.")
        return value

    def validate(self, attrs):
        if not attrs["acceptConditions"]:
            raise serializers.ValidationError(
                {"acceptConditions": "Tu dois accepter les conditions d'utilisation."}
            )
        niveau = attrs["classe"].strip().split()[0].upper()
        if attrs["casquette"] == "aine" and niveau not in {"L2", "L3", "M1", "M2"}:
            raise serializers.ValidationError(
                {"casquette": "Le rôle Aîné est réservé aux étudiants à partir de L2."}
            )
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": exc.messages}) from exc
        return attrs

    def create(self, validated_data):
        casquette = validated_data.pop("casquette")
        validated_data.pop("acceptConditions")
        password = validated_data.pop("password")
        niveau = validated_data["classe"].strip().split()[0].upper()
        if niveau not in User.Niveau.values:
            niveau = User.Niveau.L1
        return User.objects.create_user(
            **validated_data,
            password=password,
            niveau_etude=niveau,
            candidature_aine_ouverte=casquette == "aine",
            email_verifie=False,
        )


class BinomeSerializer(serializers.ModelSerializer):
    aine = UtilisateurLegereSerializer(read_only=True)
    cadet = UtilisateurLegereSerializer(read_only=True)

    class Meta:
        model = Binome
        fields = ["id", "aine", "cadet", "statut"]
