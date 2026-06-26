"""
Modèles bibliothèque numérique EMSP.

Ressources publiques (vitrine médiathèque) et documents réservés aux étudiants connectés.
"""
from django.core.exceptions import ValidationError
from django.db import models
from django.urls import reverse


class RessourceDocument(models.Model):
    """Document ou lien pédagogique — PDF uploadé ou URL externe."""

    class Categorie(models.TextChoices):
        BROCHURE = "brochure", "Brochure institutionnelle"
        COURS = "cours", "Support de cours"
        REGLEMENT = "reglement", "Règlement / procédure"
        PUBLICATION = "publication", "Publication / actualité"
        AUTRE = "autre", "Autre ressource"

    titre = models.CharField("Titre", max_length=200)
    categorie = models.CharField(
        "Catégorie",
        max_length=20,
        choices=Categorie.choices,
        default=Categorie.AUTRE,
    )
    resume = models.TextField("Résumé court", blank=True, help_text="Texte affiché sur la liste.")
    fichier = models.FileField(
        "Fichier PDF",
        upload_to="bibliotheque/",
        blank=True,
        null=True,
        help_text="PDF hébergé sur le serveur (prioritaire sur le lien externe).",
    )
    lien_externe = models.URLField(
        "Lien externe",
        blank=True,
        help_text="URL alternative si le fichier n'est pas uploadé.",
    )
    publie = models.BooleanField("Publié", default=True)
    reserve_etudiants = models.BooleanField(
        "Réservé aux étudiants connectés",
        default=True,
        help_text="Si décoché, la ressource apparaît aussi sur la vitrine médiathèque (publique).",
    )
    ordre = models.PositiveSmallIntegerField("Ordre d'affichage", default=0)
    date_publication = models.DateTimeField("Date de publication", auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ressource documentaire"
        verbose_name_plural = "ressources documentaires"
        ordering = ["ordre", "-date_publication"]

    def __str__(self) -> str:
        return self.titre

    def get_absolute_url(self) -> str:
        return reverse("bibliotheque:detail", kwargs={"pk": self.pk})

    def clean(self):
        if not self.fichier and not self.lien_externe:
            raise ValidationError("Indiquez un fichier PDF ou un lien externe.")

    @property
    def url_telechargement(self) -> str:
        """URL de téléchargement ou lien externe."""
        if self.fichier:
            return self.fichier.url
        return self.lien_externe


class MediaBibliotheque(models.Model):
    """Photos et vidéos pour l'album/médiathèque gérées par l'admin."""

    class TypeMedia(models.TextChoices):
        PHOTO = "photo", "Photo"
        VIDEO = "video", "Vidéo"

    titre = models.CharField("Titre", max_length=200)
    type_media = models.CharField(
        "Type de média", 
        max_length=10, 
        choices=TypeMedia.choices, 
        default=TypeMedia.PHOTO
    )
    fichier = models.FileField(
        "Fichier média (Photo / Vidéo)", 
        upload_to="bibliotheque/medias/", 
        blank=True, 
        null=True,
        help_text="Téléchargez le fichier s'il est hébergé localement."
    )
    video_url = models.URLField(
        "URL Vidéo externe (ex. YouTube)", 
        blank=True,
        help_text="Lien vers la vidéo si non hébergée localement."
    )
    legende = models.TextField("Légende / Description", blank=True)
    ordre = models.PositiveSmallIntegerField("Ordre d'affichage", default=0)
    publie = models.BooleanField("Publié", default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "média bibliothèque"
        verbose_name_plural = "médias bibliothèque"
        ordering = ["ordre", "-date_creation"]

    def __str__(self) -> str:
        return f"{self.get_type_media_display()} — {self.titre}"

