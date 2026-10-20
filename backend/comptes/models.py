"""Comptes — utilisateur identifié par e-mail, binôme Cadet/Aîné, suspension RG11."""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class GestionnaireUtilisateur(BaseUserManager):
    """Manager sans username — l'identifiant est l'adresse e-mail."""

    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email est requis.")
        # username reste un champ AbstractUser (unique) : on l'aligne sur l'email.
        extra_fields.setdefault("username", email)
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Identifiant = adresse e-mail (jamais de username public)."""

    class Niveau(models.TextChoices):
        L1 = "L1", "L1"
        L2 = "L2", "L2"
        L3 = "L3", "L3"
        M1 = "M1", "M1"
        M2 = "M2", "M2"
        ALUMNI = "alumni", "Alumni"

    objects = GestionnaireUtilisateur()

    email = models.EmailField("email", unique=True)
    # Les comptes existants restent vérifiés. L'inscription publique crée
    # explicitement les nouveaux comptes avec email_verifie=False.
    email_verifie = models.BooleanField("email vérifié", default=True)
    prenom = models.CharField("prénom", max_length=80, blank=True)
    nom = models.CharField("nom", max_length=80, blank=True)
    filiere = models.CharField("filière", max_length=120, blank=True)
    classe = models.CharField("classe", max_length=40, blank=True)
    # User v2 (doc 11) — le niveau devient un champ réel (RG7 : conditionne
    # la candidature Aîné) ; `classe` reste le libellé d'affichage.
    niveau_etude = models.CharField(
        "niveau d'étude", max_length=10, choices=Niveau.choices, default=Niveau.L1
    )
    # Doc 15 §1 — déclaratif L3/M2 : master|alumni|inconnu (vérifié à la
    # transition, jamais une admission officielle).
    intention_annee_suivante = models.CharField(
        "intention année suivante", max_length=10, blank=True, default="inconnu"
    )
    # RG8 — LE grand interrupteur : ouvrir la candidature rend visible dans
    # l'annuaire (si vitrine complète). Fermer ne casse JAMAIS les binômes.
    candidature_aine_ouverte = models.BooleanField("candidature Aîné ouverte", default=False)
    attentes = models.TextField(
        "attentes", blank=True, help_text="Visible par les futurs Aînés (candidat cadet)."
    )
    # Vitrine Aîné (doc 11 §2 n°7) — complétude = conditions de visibilité.
    ambitions = models.JSONField(default=list, blank=True)
    projets = models.JSONField(default=list, blank=True)
    points_forts = models.JSONField(default=list, blank=True)
    points_faibles = models.JSONField(default=list, blank=True)
    photo = models.FileField("photo", upload_to="photos/", null=True, blank=True)
    # IA responsable (doc 17 §3) — opt-in strict (RG12.4), défaut FALSE.
    preferences_ia = models.JSONField(
        "préférences IA",
        default=dict,
        blank=True,
        help_text="matchingEnrichi, copilot — consentement révocable.",
    )
    # RG11 (doc 19 §4.1) : suspension → 423 avec {motif, fin}.
    est_suspendu = models.BooleanField("suspendu", default=False)
    fin_suspension = models.DateTimeField("fin de suspension", null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        verbose_name = "utilisateur"
        verbose_name_plural = "utilisateurs"

    def __str__(self):
        return self.email


class Binome(models.Model):
    """Parrainage actif : source du 403 « hors binôme » (RDV, doc 06 §2)."""

    class Statut(models.TextChoices):
        ACTIF = "actif", "Actif"
        CLOS = "clos", "Clos"

    aine = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="binomes_comme_aine"
    )
    cadet = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="binomes_comme_cadet"
    )
    statut = models.CharField(max_length=10, choices=Statut.choices, default=Statut.ACTIF)
    cree_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["aine", "cadet"],
                condition=models.Q(statut="actif"),
                name="binome_actif_unique_par_paire",
            )
        ]

    def __str__(self):
        return f"Binôme {self.aine_id} ↔ {self.cadet_id} ({self.statut})"

    @classmethod
    def binome_actif_existe(cls, user_a, user_b):
        """True si user_a et user_b partagent un binôme actif (ordre indifférent).

        Deux requêtes simples plutôt qu'un Q-OR : le planner SQLite 3.5x rend
        l'âme sur ce filtre (« internal query planner error »), coûteux à déboguer.
        """
        for aine, cadet in ((user_a, user_b), (user_b, user_a)):
            if cls.objects.filter(aine=aine, cadet=cadet, statut=cls.Statut.ACTIF).exists():
                return True
        return False
