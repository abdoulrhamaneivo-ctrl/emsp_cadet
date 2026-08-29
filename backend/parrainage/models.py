"""Parrainage — modèles (docs 05/07) : demandes cadet→aîné, avis post-clôture.
Le binôme lui-même vit dans comptes.Binome (modèle unique, déjà consommé)."""

from django.conf import settings
from django.db import models


class Demande(models.Model):
    """Demande de parrainage d'un cadet vers un aîné (doc 05 §2).

    statut : en_attente → acceptee (→ Binome créé) | refusee | annulee
    """

    class Statut(models.TextChoices):
        EN_ATTENTE = "en_attente", "En attente"
        ACCEPTEE = "acceptee", "Acceptée"
        REFUSEE = "refusee", "Refusée"
        ANNULEE = "annulee", "Annulée"

    cadet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="demandes_envoyees",
    )
    aine = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="demandes_recues",
    )
    message = models.TextField("message d'accompagnement", blank=True)
    statut = models.CharField(
        max_length=12, choices=Statut.choices, default=Statut.EN_ATTENTE
    )
    motif_refus = models.TextField(blank=True)
    motif_partage = models.BooleanField(default=False)
    date_demande = models.DateTimeField(auto_now_add=True)
    date_reponse = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-date_demande"]

    def __str__(self):
        return f"Demande {self.cadet_id}→{self.aine_id} ({self.statut})"


class Avis(models.Model):
    """Avis de fiabilité post-clôture (doc 07) — un seul par binôme+côté."""

    class Cote(models.TextChoices):
        CADET = "cadet", "Cadet"
        AINE = "aine", "Aîné"

    binome = models.ForeignKey(
        "comptes.Binome", on_delete=models.CASCADE, related_name="avis"
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="avis_donnes"
    )
    cote = models.CharField(max_length=6, choices=Cote.choices)
    note = models.PositiveSmallIntegerField()  # 1..5 validé au serializer
    commentaire = models.TextField(blank=True)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["binome", "cote"], name="avis_unique_par_binome_et_cote"
            )
        ]

    def __str__(self):
        return f"Avis {self.cote} binôme {self.binome_id} : {self.note}/5"
