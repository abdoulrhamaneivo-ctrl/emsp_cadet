"""IA responsable — modèles (doc 17).

RG12.6 (traçabilité) : chaque analyse est loggée (feature, score, raison,
cible polymorphe). RG12.1 : AUCUN champ de décision ici — l'IA ne fait que
proposer ; la décision humaine vit dans fil.Signalement (traité par admin).
"""

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class AppelIA(models.Model):
    """Journal des appels IA (RG12.6) — inspectable en admin."""

    class Feature(models.TextChoices):
        MODERATION = "moderation", "Modération préventive (IA-1)"

    feature = models.CharField(max_length=20, choices=Feature.choices)
    score = models.PositiveSmallIntegerField(help_text="0..100 — confiance de l'analyse")
    raison = models.CharField(max_length=200, blank=True)
    signalant_ia = models.BooleanField(
        default=True, help_text="Vrai si l'appel a débouché sur un signalement IA"
    )
    # Cible polymorphe : Publication ou Commentaire (jamais une conversation privée,
    # RG12.2 — le service d'analyse ne reçoit que ces deux types).
    cible_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    cible_id = models.PositiveIntegerField()
    cible = GenericForeignKey("cible_type", "cible_id")
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"IA {self.feature} score={self.score} — {self.raison[:50]}"
