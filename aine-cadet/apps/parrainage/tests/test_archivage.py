"""Tests archivage année académique."""
from datetime import date

from django.core.management import call_command
from django.test import TestCase

from apps.accounts.models import ProfilParrain, User
from apps.parrainage.models import AnneeAcademique, DemandeParrainage


class ArchiverAnneeTests(TestCase):
    """Vérifie la commande archiver_annee."""

    def setUp(self):
        self.annee = AnneeAcademique.objects.create(
            libelle="2024-2025",
            date_debut=date(2024, 9, 1),
            date_fin=date(2025, 8, 31),
            est_active=True,
        )
        self.annee_suiv = AnneeAcademique.objects.create(
            libelle="2025-2026",
            date_debut=date(2025, 9, 1),
            date_fin=date(2026, 8, 31),
            est_active=False,
        )
        self.parrain = User.objects.create_user(
            username="aine1",
            email="aine1@emsp.int",
            password="testpass123",
            first_name="Ainé",
            last_name="Test",
            role=User.Role.PARRAIN,
        )
        ProfilParrain.objects.create(utilisateur=self.parrain, reconduction_confirmee=False)
        self.filleul = User.objects.create_user(
            username="cadet1",
            email="cadet1@emsp.int",
            password="testpass123",
            first_name="Cadet",
            last_name="Test",
            role=User.Role.FILLEUL,
        )
        self.demande = DemandeParrainage.objects.create(
            filleul=self.filleul,
            parrain=self.parrain,
            statut=DemandeParrainage.Statut.ACCEPTE,
            annee_academique=self.annee,
        )

    def test_archiver_cloture_parrainages(self):
        call_command("archiver_annee", annee_id=self.annee.pk)
        self.demande.refresh_from_db()
        self.annee.refresh_from_db()
        self.annee_suiv.refresh_from_db()
        self.assertEqual(self.demande.statut, DemandeParrainage.Statut.TERMINE)
        self.assertFalse(self.annee.est_active)
        self.assertTrue(self.annee_suiv.est_active)
        profil = self.parrain.profil_parrain
        profil.refresh_from_db()
        self.assertFalse(profil.disponible)
