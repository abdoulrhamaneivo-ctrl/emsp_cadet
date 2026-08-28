"""RDV — machine à états doc 06 : propose→confirme/refuse/contre_propose→…→passe."""

from django.conf import settings
from django.db import models


class RendezVous(models.Model):
    class Statut(models.TextChoices):
        PROPOSE = "propose", "Proposé"
        CONFIRME = "confirme", "Confirmé"
        REFUSE = "refuse", "Refusé"
        CONTRE_PROPOSE = "contre_propose", "Contre-proposé"
        ANNULE = "annule", "Annulé"
        PASSE = "passe", "Passé"

    class Mode(models.TextChoices):
        PRESENTIEL = "presentiel", "Présentiel"
        VISIO = "visio", "Visio"

    organisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rdv_organises"
    )
    invite = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rdv_invitations"
    )
    titre = models.CharField(max_length=160)
    # null assumé : le contrat doc 21 émet `description: null` (verbatim front T3a).
    description = models.TextField(null=True, blank=True)  # noqa: DJ001
    date_heure = models.DateTimeField()
    lieu = models.CharField(max_length=200, blank=True)
    mode = models.CharField(max_length=20, choices=Mode.choices)
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.PROPOSE)
    # Contre-proposition en attente (doc 06 : une seule à la fois).
    cp_date_heure = models.DateTimeField(null=True, blank=True)
    cp_lieu = models.CharField(max_length=200, blank=True)
    rappel_vu = models.BooleanField(default=False)
    cree_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date_heure"]

    def __str__(self):
        return f"#{self.pk} {self.titre} ({self.statut})"

    # ── Machine à états (doc 06 §2) ───────────────────────────────────────────
    def appliquer_decision(self, decision):
        """`confirme`/`refuse` — l'invité répond à un propose, l'organisateur
        tranche une contre_propose (confirme = reprendre SON créneau)."""
        from config.exceptions import ErreurValidation

        if decision not in (self.Statut.CONFIRME, self.Statut.REFUSE):
            raise ErreurValidation("Décision inconnue.")
        if self.statut == self.Statut.CONTRE_PROPOSE and decision == self.Statut.CONFIRME:
            self.date_heure = self.cp_date_heure or self.date_heure
            self.lieu = self.cp_lieu or self.lieu
            self.cp_date_heure = None
            self.cp_lieu = ""
        self.statut = decision
        self.save()

    def contre_proposer(self, date_heure, lieu):
        from config.exceptions import ErreurValidation

        if self.statut not in (self.Statut.PROPOSE, self.Statut.CONTRE_PROPOSE):
            raise ErreurValidation("Ce rendez-vous n'accepte plus de contre-proposition.")
        self.statut = self.Statut.CONTRE_PROPOSE
        self.cp_date_heure = date_heure
        self.cp_lieu = lieu
        self.save()

    def annuler(self):
        from config.exceptions import ErreurValidation

        if self.statut in (self.Statut.PASSE, self.Statut.REFUSE):
            raise ErreurValidation("Ce rendez-vous est déjà clos.")
        self.statut = self.Statut.ANNULE
        self.save()
