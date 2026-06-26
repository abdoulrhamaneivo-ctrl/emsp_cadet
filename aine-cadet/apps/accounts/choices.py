"""
Choix métier partagés — classe et filière EMSP.

Utilisés par les formulaires d'inscription, profils et filtres annuaire.
"""
from django.db import models


class ClasseNiveau(models.TextChoices):
    """Niveaux d'études proposés à l'inscription."""

    L1 = "L1", "L1 — Licence 1"
    L2 = "L2", "L2 — Licence 2"
    L3 = "L3", "L3 — Licence 3"
    M1 = "M1", "M1 — Master 1"
    M2 = "M2", "M2 — Master 2"
    LIC1 = "Licence 1", "Licence 1"
    LIC2 = "Licence 2", "Licence 2"
    LIC3 = "Licence 3", "Licence 3"
    MAST1 = "Master 1", "Master 1"
    MAST2 = "Master 2", "Master 2"


class FiliereEMSP(models.TextChoices):
    """Filières de l'école (alignées vitrine EMSP)."""

    FS_MENUM = "FS MENUM", "FS MENUM — Économie Numérique"
    FSP = "FSP", "FSP — Formations Supérieures Postales"
    REGNUM = "RegNUM", "RegNUM — Régulation du Numérique"
    AUTRE = "Autre", "Autre filière"


# Option vide pour les selects (inscription / filtres optionnels)
CLASSE_CHOICES_VIDES = [("", "— Sélectionnez votre niveau —")] + list(ClasseNiveau.choices)
FILIERE_CHOICES_VIDES = [("", "— Sélectionnez votre filière —")] + list(FiliereEMSP.choices)

# Options filtres annuaire (toutes les valeurs)
CLASSE_FILTRE_CHOICES = [("", "Toutes les classes")] + list(ClasseNiveau.choices)
FILIERE_FILTRE_CHOICES = [("", "Toutes les filières")] + list(FiliereEMSP.choices)
