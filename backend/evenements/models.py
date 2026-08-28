"""Événements collectifs — modèles doc 10 §2 (§3.7 cahier des charges).

Un événement = activité OUVERTE À PLUSIEURS cadets (atelier, sortie, révision),
créée par un aîné ou l'admin. Chaque événement porte une discussion — réutilise
`fil.Commentaire` (décision t4b : un seul modèle de commentaire sur la plateforme).

Le message collectif « détails ont changé » est une PUBLICATION doc 09 (le
contenu collectif vit sur le Fil) — pas un duplicata ici.
"""

from django.conf import settings
from django.db import models
from django.db.models import Q


class Evenement(models.Model):
    type = models.CharField(max_length=40, blank=True)  # tag libre doc 10 §5
    titre = models.CharField(max_length=90)
    # 30..1500 chars — validé dans la vue.
    description = models.TextField()
    organisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="evenements_organises"
    )
    date_heure = models.DateTimeField()
    lieu = models.CharField(max_length=200, blank=True)
    en_ligne = models.BooleanField(default=False)
    capacite_max = models.PositiveIntegerField(default=15)  # 2..100 validé
    annule = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    # Discussion de l'événement = fil.Commentaire rattaché à une « publication
    # porteuse » dédiée (un seul modèle de commentaire sur la plateforme) —
    # créée paresseusement au premier message et EXCLUE du feed du Fil.
    publication_discussion = models.OneToOneField(
        "fil.Publication",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="evenement_discussion",
    )

    class Meta:
        ordering = ["date_heure"]

    def __str__(self):
        return f"{self.titre} — {self.date_heure:%d/%m/%Y %H:%M}"

    @property
    def nb_inscrits(self):
        return self.inscriptions.count()

    def messages_discussion(self):
        """Messages RACINE de la discussion (fil.Commentaire), chronologiques."""
        from fil.models import Commentaire

        if self.publication_discussion_id is None:
            return Commentaire.objects.none()
        return Commentaire.objects.filter(
            publication_id=self.publication_discussion_id, parent__isnull=True
        ).order_by("date_creation")

    def publication_ou_creee(self):
        """La publication porteuse de la discussion, créée au premier message."""
        from fil.models import Publication

        if self.publication_discussion_id is None:
            porteuse = Publication.objects.create(
                type=Publication.Type.ANNONCE,
                auteur=self.organisateur,
                contenu=f"Discussion de l'événement « {self.titre} »",
            )
            self.publication_discussion = porteuse
            self.save(update_fields=["publication_discussion"])
        return self.publication_discussion


class Inscription(models.Model):
    evenement = models.ForeignKey(
        Evenement, on_delete=models.CASCADE, related_name="inscriptions"
    )
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="inscriptions_evenements"
    )
    date_inscription = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["evenement", "participant"], name="inscription_unique_par_evenement"
            ),
        ]

    def __str__(self):
        return f"{self.participant_id} → événement {self.evenement_id}"


def evenements_a_venir():
    """Helper partagé liste/détail : à venir = futur ET non annulé (doc 10 §2)."""
    from django.utils import timezone

    return Evenement.objects.filter(
        Q(date_heure__gte=timezone.now()) & Q(annule=False)
    )
