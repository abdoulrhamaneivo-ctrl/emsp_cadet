"""Offres publiées par les alumni et candidatures des étudiants."""

from django.conf import settings
from django.db import models


class Offre(models.Model):
    class Type(models.TextChoices):
        STAGE = "stage", "Stage"
        ALTERNANCE = "alternance", "Alternance"
        CDI = "cdi", "CDI"
        CDD = "cdd", "CDD"
        FREELANCE = "freelance", "Freelance"
        BENEVOLAT = "benevolat", "Bénévolat"

    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="offres_publiees",
    )
    titre = models.CharField(max_length=120)
    type_offre = models.CharField(max_length=16, choices=Type.choices)
    entreprise = models.CharField(max_length=120)
    localisation = models.CharField(max_length=160)
    mission = models.TextField(max_length=2000)
    profil = models.TextField(max_length=2000)
    modalites = models.TextField(max_length=2000)
    salaire = models.CharField(max_length=120, blank=True)
    teletravail = models.CharField(max_length=120, blank=True)
    date_limite = models.DateField(null=True, blank=True)
    publiee = models.BooleanField(default=True)
    date_publication = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_publication", "id"]
        indexes = [models.Index(fields=["publiee", "date_publication"])]

    def __str__(self):
        return f"{self.titre} — {self.entreprise}"


class Candidature(models.Model):
    offre = models.ForeignKey(Offre, on_delete=models.CASCADE, related_name="candidatures")
    candidat = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidatures_offres",
    )
    message = models.TextField(max_length=2000, blank=True)
    date_candidature = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_candidature"]
        constraints = [
            models.UniqueConstraint(
                fields=["offre", "candidat"], name="candidature_unique_par_offre"
            )
        ]

    def __str__(self):
        return f"{self.candidat_id} → offre {self.offre_id}"
