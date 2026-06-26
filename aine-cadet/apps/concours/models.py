"""
Modèle d'inscription au concours d'entrée EMSP.

Formulaire public lié depuis la vitrine concours.html.
"""
from django.db import models


class AnneeConcours(models.Model):
    """Session de concours — dates et frais éditables par l'admin chaque rentrée."""

    annee = models.CharField(
        "Année / promotion",
        max_length=30,
        help_text="Ex. 2025-2026 — 3e promotion FS MENUM",
    )
    date_limite = models.DateField(
        "Date limite de candidature",
        help_text="Dernier jour pour déposer le dossier en ligne.",
    )
    frais_fcfa = models.PositiveIntegerField(
        "Frais d'inscription (FCFA)",
        default=25000,
        help_text="Montant indicatif affiché sur la vitrine et le formulaire.",
    )
    active = models.BooleanField(
        "Session active",
        default=False,
        help_text="Une seule session active à la fois. Vérifier www.emsp.int chaque rentrée.",
    )

    class Meta:
        verbose_name = "année concours"
        verbose_name_plural = "années concours"
        ordering = ["-date_limite"]

    def __str__(self) -> str:
        suffix = " (active)" if self.active else ""
        return f"{self.annee}{suffix}"

    def save(self, *args, **kwargs):
        if self.active:
            AnneeConcours.objects.exclude(pk=self.pk).update(active=False)
        super().save(*args, **kwargs)


class InscriptionConcours(models.Model):
    """Candidature au concours FS MENUM (uniquement)."""

    class SpecialiteFSMenum(models.TextChoices):
        LNUM = "LNUM", "Logistique & Numérique"
        FDIG = "FDIG", "Finance Digitale"
        MDIG = "MDIG", "Marketing Digital"
        DSER = "DSER", "Digitalisation des Services"
        GARE = "GARE", "Gestion des Activités Réglementées"

    class StatutCandidature(models.TextChoices):
        EN_ATTENTE = "en_attente", "En attente"
        VALIDE = "valide", "Validé / Admis à composer"
        REJETE = "rejete", "Rejeté"

    nom = models.CharField("Nom", max_length=120)
    prenom = models.CharField("Prénom", max_length=120)
    moyenne_examen = models.DecimalField(
        "Moyenne à l'examen",
        max_digits=4,
        decimal_places=2,
        help_text="Moyenne obtenue au baccalauréat ou examen équivalent.",
    )
    identite_collante_bac = models.CharField(
        "N° identité collante (examen BAC)",
        max_length=80,
        help_text="Numéro figurant sur la pièce d'identité collante de l'examen.",
    )
    
    # Choix de filières restreints aux spécialités de la FS MENUM
    filiere_choix_1 = models.CharField(
        "1er choix de spécialité", 
        max_length=120, 
        choices=SpecialiteFSMenum.choices
    )
    filiere_choix_2 = models.CharField(
        "2e choix de spécialité", 
        max_length=120, 
        choices=SpecialiteFSMenum.choices
    )
    filiere_choix_3 = models.CharField(
        "3e choix de spécialité", 
        max_length=120, 
        choices=SpecialiteFSMenum.choices
    )
    
    # Fichiers requis
    photo_candidat = models.FileField(
        "Photo d'identité", 
        upload_to="concours/photos/", 
        blank=True, 
        null=True,
        help_text="Format image (JPEG/PNG) ou PDF."
    )
    type_piece_cni = models.CharField(
        "Type de pièce d'identité", 
        max_length=20, 
        choices=[
            ("cni", "Carte d'identité"),
            ("recepisse", "Récépissé de CNI"),
            ("autre", "Autre pièce")
        ], 
        default="cni"
    )
    cni_document = models.FileField(
        "Pièce d'identité (Fichier)", 
        upload_to="concours/cni/", 
        blank=True, 
        null=True,
        help_text="Fichier PDF ou Image."
    )
    collante_bac = models.FileField(
        "Collante du BAC (Fichier)", 
        upload_to="concours/bac/", 
        blank=True, 
        null=True,
        help_text="Fichier PDF ou Image."
    )
    
    # Contrôle de la réception
    statut = models.CharField(
        "Statut du dossier",
        max_length=20,
        choices=StatutCandidature.choices,
        default=StatutCandidature.EN_ATTENTE
    )

    email = models.EmailField("E-mail de contact", blank=True)
    date_inscription = models.DateTimeField("Date d'inscription", auto_now_add=True)
    annee_academique = models.ForeignKey(
        "parrainage.AnneeAcademique",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inscriptions_concours",
        verbose_name="Année académique",
    )

    class Meta:
        verbose_name = "inscription concours"
        verbose_name_plural = "inscriptions concours"
        ordering = ["-date_inscription"]

    def __str__(self) -> str:
        return f"{self.prenom} {self.nom} — {self.get_filiere_choix_1_display()}"

    def save(self, *args, **kwargs):
        return super().save(*args, **kwargs)

