"""
Modèles parrainage — cœur métier Ainé & Cadet.

Référence CDC §3.3 à §3.8 et §5.
"""
from django.conf import settings
from django.db import models


class AnneeAcademique(models.Model):
    """Année académique EMSP — clôture et archivage fin d'année."""

    libelle = models.CharField("Libellé", max_length=20, help_text="Ex. 2025-2026")
    date_debut = models.DateField("Date de début")
    date_fin = models.DateField("Date de fin")
    est_active = models.BooleanField("Année active", default=False)

    class Meta:
        verbose_name = "année académique"
        verbose_name_plural = "années académiques"
        ordering = ["-date_debut"]

    def __str__(self) -> str:
        suffix = " (active)" if self.est_active else ""
        return f"{self.libelle}{suffix}"


class DemandeParrainage(models.Model):
    """
    Demande de mise en relation Cadet → Ainé (CDC §3.3).

    Statuts :
    - en_attente : en attente de réponse de l'Ainé
    - accepte : accompagnement actif (messagerie + RDV activés)
    - refuse : refusée par l'Ainé
    - termine : parcours clos (libère une place, déclenche avis — CDC R6)
    """

    class Statut(models.TextChoices):
        EN_ATTENTE = "en_attente", "En attente"
        ACCEPTE = "accepte", "Accepté"
        REFUSE = "refuse", "Refusé"
        TERMINE = "termine", "Terminé"

    filleul = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="demandes_envoyees",
        limit_choices_to={"role": "filleul"},
    )
    parrain = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="demandes_recues",
        limit_choices_to={"role": "parrain"},
    )
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE,
    )
    message_introduction = models.TextField(
        "Message d'introduction",
        blank=True,
        help_text="Présentation du Cadet à son Ainé.",
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_reponse = models.DateTimeField(null=True, blank=True)
    date_fin = models.DateTimeField(null=True, blank=True)
    annee_academique = models.ForeignKey(
        AnneeAcademique,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="demandes_parrainage",
        verbose_name="Année académique",
    )

    class Meta:
        verbose_name = "demande de parrainage"
        verbose_name_plural = "demandes de parrainage"
        # Évite les doublons en attente entre le même binôme
        constraints = [
            models.UniqueConstraint(
                fields=["filleul", "parrain"],
                condition=models.Q(statut="en_attente"),
                name="unique_demande_en_attente",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.filleul} → {self.parrain} ({self.get_statut_display()})"

    @property
    def est_active(self) -> bool:
        return self.statut == self.Statut.ACCEPTE


class Message(models.Model):
    """Messagerie privée parrain ↔ filleul (CDC §3.4). Active après acceptation."""

    parrainage = models.ForeignKey(
        DemandeParrainage,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    expediteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="messages_envoyes",
    )
    contenu = models.TextField("Contenu")
    date_envoi = models.DateTimeField(auto_now_add=True)
    lu = models.BooleanField("Lu", default=False)

    class Meta:
        verbose_name = "message"
        verbose_name_plural = "messages"
        ordering = ["date_envoi"]

    def __str__(self) -> str:
        return f"Message de {self.expediteur} ({self.date_envoi:%d/%m/%Y %H:%M})"


class RendezVous(models.Model):
    """Proposition de rendez-vous entre parrain et filleul (CDC §3.5)."""

    class Statut(models.TextChoices):
        PROPOSE = "propose", "Proposé"
        ACCEPTE = "accepte", "Accepté"
        REFUSE = "refuse", "Refusé"
        CONTRE_PROPOSITION = "contre_proposition", "Contre-proposition"

    parrainage = models.ForeignKey(
        DemandeParrainage,
        on_delete=models.CASCADE,
        related_name="rendez_vous",
    )
    organisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="rdv_organises",
    )
    titre = models.CharField("Titre", max_length=200)
    date_heure = models.DateTimeField("Date et heure")
    lieu = models.CharField("Lieu", max_length=255)
    statut = models.CharField(
        max_length=30,
        choices=Statut.choices,
        default=Statut.PROPOSE,
    )
    rappel_envoye = models.BooleanField("Rappel envoyé", default=False)

    class Meta:
        verbose_name = "rendez-vous"
        verbose_name_plural = "rendez-vous"
        ordering = ["date_heure"]

    def __str__(self) -> str:
        return f"{self.titre} — {self.date_heure:%d/%m/%Y %H:%M}"


class Avis(models.Model):
    """Retour d'expérience en fin de parrainage (CDC §3.6)."""

    parrainage = models.ForeignKey(
        DemandeParrainage,
        on_delete=models.CASCADE,
        related_name="avis",
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="avis_rediges",
    )
    note = models.PositiveSmallIntegerField(
        "Note",
        help_text="Échelle 1 à 5.",
    )
    commentaire = models.TextField("Commentaire", blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "avis"
        verbose_name_plural = "avis"

    def __str__(self) -> str:
        return f"Avis {self.note}/5 — {self.auteur}"


class Evenement(models.Model):
    """Événement collectif (atelier, sortie…) — CDC §3.7."""

    titre = models.CharField("Titre", max_length=200)
    description = models.TextField("Description", blank=True)
    date_heure = models.DateTimeField("Date et heure")
    lieu = models.CharField("Lieu", max_length=255)
    organisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="evenements_organises",
    )
    places_max = models.PositiveIntegerField("Places maximum", null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    annee_academique = models.ForeignKey(
        AnneeAcademique,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="evenements",
        verbose_name="Année académique",
    )

    class Meta:
        verbose_name = "événement"
        verbose_name_plural = "événements"
        ordering = ["date_heure"]

    def __str__(self) -> str:
        return self.titre


class InscriptionEvenement(models.Model):
    """Inscription d'un filleul à un événement collectif."""

    evenement = models.ForeignKey(
        Evenement,
        on_delete=models.CASCADE,
        related_name="inscriptions",
    )
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="inscriptions_evenements",
    )
    date_inscription = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "inscription événement"
        verbose_name_plural = "inscriptions événements"
        unique_together = ("evenement", "participant")


class Badge(models.Model):
    """Badge de reconnaissance parrain — CDC §3.8."""

    code = models.SlugField("Code", unique=True)
    libelle = models.CharField("Libellé", max_length=100)
    description = models.TextField("Description", blank=True)

    class Meta:
        verbose_name = "badge"
        verbose_name_plural = "badges"

    def __str__(self) -> str:
        return self.libelle


class BadgeAttribution(models.Model):
    """Attribution d'un badge à un parrain."""

    parrain = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="badges_obtenus",
        limit_choices_to={"role": "parrain"},
    )
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name="attributions")
    date_attribution = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "attribution de badge"
        verbose_name_plural = "attributions de badges"
        unique_together = ("parrain", "badge")
