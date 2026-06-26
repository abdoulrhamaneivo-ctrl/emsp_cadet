"""
Modèles utilisateurs — comptes et profils Ainé & Cadet.

Référence CDC §2, §5 :
- Utilisateur : identité, rôle, classe, filière, photo
- Profil Ainé (ProfilParrain) : ambitions, motivations, projets, forces, faiblesses
"""
from django.contrib.auth.models import AbstractUser
from django.db import models

from .validators import validate_school_email


class User(AbstractUser):
    """Utilisateur Ainé & Cadet avec rôle métier (Cadet, Ainé ou admin)."""

    class Role(models.TextChoices):
        FILLEUL = "filleul", "Cadet (L1)"
        PARRAIN = "parrain", "Ainé (devancier)"
        ADMIN = "admin", "Administrateur"

    # Email institutionnel obligatoire (utilisé comme identifiant de connexion)
    email = models.EmailField(
        "Adresse email",
        unique=True,
        validators=[validate_school_email],
        help_text="Adresse @domaine école uniquement.",
    )
    role = models.CharField(
        "Rôle",
        max_length=20,
        choices=Role.choices,
        default=Role.FILLEUL,
        help_text="Modifiable uniquement par un administrateur (CDC R5).",
    )
    classe = models.CharField("Classe / niveau", max_length=50, blank=True)
    filiere = models.CharField("Filière", max_length=120, blank=True)
    photo = models.ImageField("Photo de profil", upload_to="profiles/", blank=True, null=True)
    attentes = models.TextField(
        "Attentes (Cadet)",
        blank=True,
        help_text="Ce que le Cadet attend de son Ainé.",
    )
    is_suspended = models.BooleanField(
        "Compte suspendu",
        default=False,
        help_text="Suspendu par l'administrateur (CDC §2).",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        verbose_name = "utilisateur"
        verbose_name_plural = "utilisateurs"

    def __str__(self) -> str:
        return f"{self.get_full_name()} ({self.get_role_display()})"

    @property
    def est_parrain(self) -> bool:
        return self.role == self.Role.PARRAIN

    @property
    def est_filleul(self) -> bool:
        return self.role == self.Role.FILLEUL


class ProfilParrain(models.Model):
    """
    Profil détaillé réservé aux Ainés (CDC §2, §3.2).

    Visible dans l'annuaire lorsque l'Ainé a de la capacité disponible.
    Nom technique conservé ; label UI = « Profil Ainé ».
    """

    utilisateur = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profil_parrain",
        limit_choices_to={"role": User.Role.PARRAIN},
    )
    ambitions = models.TextField("Ambitions", blank=True)
    motivations = models.TextField("Motivations", blank=True)
    projets = models.TextField("Projets en cours", blank=True)
    points_forts = models.TextField("Points forts", blank=True)
    points_faibles = models.TextField("Points faibles", blank=True)
    centres_interet = models.CharField(
        "Centres d'intérêt",
        max_length=255,
        blank=True,
        help_text="Mots-clés séparés par des virgules (suggestion automatique CDC §3.2).",
    )
    disponible = models.BooleanField(
        "Visible dans l'annuaire",
        default=True,
        help_text="Masqué automatiquement si capacité max atteinte (CDC R3).",
    )
    score_fiabilite = models.DecimalField(
        "Score de fiabilité",
        max_digits=3,
        decimal_places=2,
        default=0,
        help_text="Alimenté par les avis en fin de parrainage (CDC §3.6).",
    )
    reconduction_confirmee = models.BooleanField(
        "Reconduction confirmée",
        default=False,
        help_text="Coché si l'Ainé souhaite rester disponible l'année suivante.",
    )
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "profil Ainé"
        verbose_name_plural = "profils Ainés"

    def __str__(self) -> str:
        return f"Profil Ainé — {self.utilisateur.get_full_name()}"
