"""Fil d'actualité — modèles doc 09 §2 : publications, réactions fermées,
commentaires à UN niveau de réponse, signalements de modération."""

from django.conf import settings
from django.db import models


class Publication(models.Model):
    class Type(models.TextChoices):
        ANNONCE = "annonce", "Annonce"
        QUESTION = "question", "Question"
        SUCCES = "succes", "Succès"

    type = models.CharField(max_length=20, choices=Type.choices)
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="publications"
    )
    # 10..1200 chars — validé dans la vue (ErreurValidation 422).
    contenu = models.TextField()
    masquee = models.BooleanField(
        default=False, help_text="Masquée après signalement — en attente de modération."
    )
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_creation"]

    def __str__(self):
        return f"{self.get_type_display()} de {self.auteur} — {self.contenu[:40]}"


class Reaction(models.Model):
    """Réactions FERMÉES (3 codes fixes) — jamais de like générique (doc 09 §2).

    Unicité (publication, utilisateur, code) : un seul de chaque par personne ;
    le POST reçut un second fois = toggle OFF (la vue supprime la ligne).
    """

    class Code(models.TextChoices):
        BRAVO = "bravo", "Bravo"
        MERCI = "merci", "Merci"
        UTILE = "utile", "Utile"

    publication = models.ForeignKey(
        Publication, on_delete=models.CASCADE, related_name="reactions"
    )
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reactions_fil"
    )
    code = models.CharField(max_length=10, choices=Code.choices)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["publication", "utilisateur", "code"],
                name="reaction_unique_par_personne",
            )
        ]

    def __str__(self):
        return f"{self.code} — {self.utilisateur_id} sur publication {self.publication_id}"


class Commentaire(models.Model):
    """Commentaire de publication — UN seul niveau de réponse (doc 09 §2).

    Une réponse à une réponse est aplatie par la vue : `parent` remonte au
    parent racine (la mention `@Prénom` reste dans le texte, côté front).
    """

    publication = models.ForeignKey(
        Publication, on_delete=models.CASCADE, related_name="commentaires"
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="commentaires_fil"
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reponses",
    )
    # 2..600 chars — validé dans la vue.
    contenu = models.TextField()
    idempotency_key = models.CharField(max_length=64, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date_creation"]

    def __str__(self):
        return f"Commentaire de {self.auteur} sur publication {self.publication_id}"


class Signalement(models.Model):
    class Raison(models.TextChoices):
        SPAM = "spam", "Spam"
        HARCELEMENT = "harcelement", "Harcèlement"
        FAUX = "faux", "Fausse information"
        INFO = "info", "Contenu inapproprié"

    publication = models.ForeignKey(
        Publication,
        on_delete=models.CASCADE,
        related_name="signalements",
        null=True,
        blank=True,
    )
    commentaire = models.ForeignKey(
        Commentaire,
        on_delete=models.CASCADE,
        related_name="signalements",
        null=True,
        blank=True,
    )
    signalant = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="signalements_deposes"
    )
    raison = models.CharField(max_length=20, choices=Raison.choices)
    traite = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_creation"]

    def __str__(self):
        return f"Signalement #{self.pk} ({self.raison})"
