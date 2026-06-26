"""
Modèles filières EMSP — contenu éditorial géré par l'admin.

Permet de maintenir descriptions, images et spécialités sans modifier le HTML à la main.
Export vitrine : `python manage.py export_filieres_vitrine`
"""
from django.db import models
from django.urls import reverse


class Filiere(models.Model):
    """Filière ou cycle de formation EMSP (FSP, FS MENUM, RegNUM, FCQ…)."""

    class TypeFormation(models.TextChoices):
        FID = "fid", "Formation Initiale Diplômante"
        FCQ = "fcq", "Formation Continue Qualifiante"
        AUTRE = "autre", "Autre"

    slug = models.SlugField("Identifiant URL", unique=True, max_length=80)
    nom = models.CharField("Nom affiché", max_length=200)
    code = models.CharField("Code court", max_length=30, blank=True, help_text="Ex. FSP, FS MENUM, RegNUM")
    type_formation = models.CharField(
        "Type",
        max_length=10,
        choices=TypeFormation.choices,
        default=TypeFormation.FID,
    )
    duree = models.CharField("Durée", max_length=120, blank=True, help_text="Ex. 10 mois, 10 semestres LMD")
    resume = models.TextField("Résumé court", help_text="Texte carte carousel / liste")
    description = models.TextField("Présentation détaillée", blank=True)
    conditions_admission = models.TextField("Conditions d'admission", blank=True)
    debouches = models.TextField("Débouchés / métiers", blank=True)
    cours = models.TextField("Programme des cours", blank=True)
    image = models.ImageField("Image vignette", upload_to="filieres/", blank=True, null=True)
    image_hero = models.ImageField("Image bannière", upload_to="filieres/hero/", blank=True, null=True)
    ordre = models.PositiveSmallIntegerField("Ordre d'affichage", default=0)
    publie = models.BooleanField("Publié sur la vitrine", default=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "filière"
        verbose_name_plural = "filières"
        ordering = ["ordre", "nom"]

    def __str__(self) -> str:
        return self.nom

    def get_absolute_url(self) -> str:
        return reverse("formations:detail", kwargs={"slug": self.slug})


class Specialite(models.Model):
    """Spécialité FS MENUM (LNUM, FDIG, MDIG, DSER, GARE…)."""

    filiere = models.ForeignKey(
        Filiere,
        on_delete=models.CASCADE,
        related_name="specialites",
    )
    code = models.CharField("Code", max_length=20, help_text="Ex. LNUM, FDIG")
    nom = models.CharField("Nom complet", max_length=200)
    description = models.TextField("Description", blank=True)
    debouches = models.TextField("Métiers visés", blank=True)
    cours = models.TextField("Programme de la spécialité", blank=True)
    ordre = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "spécialité"
        verbose_name_plural = "spécialités"
        ordering = ["ordre", "code"]

    def __str__(self) -> str:
        return f"{self.code} — {self.nom}"
