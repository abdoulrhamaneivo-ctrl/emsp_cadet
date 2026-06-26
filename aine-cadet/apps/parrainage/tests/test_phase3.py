"""
Tests Phase 3 — avis, badges, événements, dashboard admin (CDC §3.6–§3.8).
"""
from datetime import timedelta

from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from apps.accounts.models import ProfilParrain, User
from apps.parrainage.models import Avis, BadgeAttribution, DemandeParrainage, Evenement
from apps.parrainage.services import (
    attribuer_badges_parrain,
    peut_laissser_avis,
    peut_sinscrire_evenement,
    recalculer_score_fiabilite,
    soumettre_avis,
    terminer_parrainage,
)


class Phase3AvisTests(TestCase):
    """Fin de parrainage, avis et score de fiabilité."""

    def setUp(self):
        self.cadet = User.objects.create_user(
            username="cadet_p3",
            email="cadet_p3@emsp.int",
            password="testpass123",
            role=User.Role.FILLEUL,
        )
        self.aine = User.objects.create_user(
            username="aine_p3",
            email="aine_p3@emsp.int",
            password="testpass123",
            role=User.Role.PARRAIN,
        )
        ProfilParrain.objects.create(utilisateur=self.aine, disponible=True)
        self.parrainage = DemandeParrainage.objects.create(
            filleul=self.cadet,
            parrain=self.aine,
            statut=DemandeParrainage.Statut.ACCEPTE,
        )
        self.client = Client()

    def test_terminer_parrainage_libere_place(self):
        """R6 — terminer un parrainage le passe en statut terminé."""
        terminer_parrainage(self.parrainage, self.aine)
        self.parrainage.refresh_from_db()
        self.assertEqual(self.parrainage.statut, DemandeParrainage.Statut.TERMINE)
        self.assertIsNotNone(self.parrainage.date_fin)
        self.aine.profil_parrain.refresh_from_db()
        self.assertTrue(self.aine.profil_parrain.disponible)

    def test_avis_cadet_met_a_jour_score_fiabilite(self):
        """La note du Cadet alimente le score de fiabilité de l'Ainé."""
        terminer_parrainage(self.parrainage, self.aine)
        soumettre_avis(self.parrainage, self.cadet, 4, "Très bon accompagnement")
        self.aine.profil_parrain.refresh_from_db()
        self.assertEqual(float(self.aine.profil_parrain.score_fiabilite), 4.0)

    def test_un_seul_avis_par_participant(self):
        """Chaque participant ne peut laisser qu'un avis par parrainage."""
        terminer_parrainage(self.parrainage, self.aine)
        soumettre_avis(self.parrainage, self.cadet, 5)
        self.assertFalse(peut_laissser_avis(self.parrainage, self.cadet))

    def test_moyenne_score_sur_plusieurs_avis(self):
        """Le score est la moyenne des notes laissées par les Cadets."""
        terminer_parrainage(self.parrainage, self.aine)
        soumettre_avis(self.parrainage, self.cadet, 4)

        cadet2 = User.objects.create_user(
            username="cadet_p3b",
            email="cadet_p3b@emsp.int",
            password="x",
            role=User.Role.FILLEUL,
        )
        parrainage2 = DemandeParrainage.objects.create(
            filleul=cadet2,
            parrain=self.aine,
            statut=DemandeParrainage.Statut.TERMINE,
            date_fin=timezone.now(),
        )
        soumettre_avis(parrainage2, cadet2, 2)

        recalculer_score_fiabilite(self.aine)
        self.aine.profil_parrain.refresh_from_db()
        self.assertEqual(float(self.aine.profil_parrain.score_fiabilite), 3.0)

    def test_formulaire_avis_accessible(self):
        """Le Cadet accède au formulaire d'avis après clôture."""
        terminer_parrainage(self.parrainage, self.cadet)
        self.client.login(username="cadet_p3@emsp.int", password="testpass123")
        url = reverse("parrainage:avis_creer", kwargs={"pk": self.parrainage.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Retour d'expérience")


class Phase3BadgesTests(TestCase):
    """Attribution automatique des badges Ainé."""

    def setUp(self):
        self.aine = User.objects.create_user(
            username="aine_badges",
            email="aine_badges@emsp.int",
            password="x",
            role=User.Role.PARRAIN,
        )
        ProfilParrain.objects.create(utilisateur=self.aine, disponible=True)

    def test_badge_premier_parrainage(self):
        """Badge « premier parrainage » après un parcours terminé."""
        cadet = User.objects.create_user(
            username="c_b1",
            email="c_b1@emsp.int",
            password="x",
            role=User.Role.FILLEUL,
        )
        DemandeParrainage.objects.create(
            filleul=cadet,
            parrain=self.aine,
            statut=DemandeParrainage.Statut.TERMINE,
        )
        nouveaux = attribuer_badges_parrain(self.aine)
        self.assertIn("premier-parrainage", nouveaux)
        self.assertTrue(
            BadgeAttribution.objects.filter(
                parrain=self.aine,
                badge__code="premier-parrainage",
            ).exists()
        )

    def test_badge_evenement_organise(self):
        """Badge « événement organisé » après création d'un événement."""
        Evenement.objects.create(
            titre="Atelier révision",
            date_heure=timezone.now() + timedelta(days=7),
            lieu="Campus",
            organisateur=self.aine,
        )
        nouveaux = attribuer_badges_parrain(self.aine)
        self.assertIn("evenement-organise", nouveaux)


class Phase3EvenementsTests(TestCase):
    """Événements collectifs et inscriptions Cadet."""

    def setUp(self):
        self.cadet = User.objects.create_user(
            username="cadet_evt",
            email="cadet_evt@emsp.int",
            password="testpass123",
            role=User.Role.FILLEUL,
        )
        self.aine = User.objects.create_user(
            username="aine_evt",
            email="aine_evt@emsp.int",
            password="testpass123",
            role=User.Role.PARRAIN,
        )
        self.evenement = Evenement.objects.create(
            titre="Session révision",
            date_heure=timezone.now() + timedelta(days=3),
            lieu="Salle A",
            organisateur=self.aine,
            places_max=2,
        )
        self.client = Client()

    def test_inscription_cadet(self):
        """Un Cadet peut s'inscrire à un événement futur."""
        self.assertTrue(peut_sinscrire_evenement(self.evenement, self.cadet))
        self.client.login(username="cadet_evt@emsp.int", password="testpass123")
        url = reverse("parrainage:evenement_inscrire", kwargs={"pk": self.evenement.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.evenement.inscriptions.count(), 1)

    def test_liste_evenements(self):
        """La liste des événements est accessible aux utilisateurs connectés."""
        self.client.login(username="cadet_evt@emsp.int", password="testpass123")
        url = reverse("parrainage:evenements_liste")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Session révision")


class Phase3AdminDashboardTests(TestCase):
    """Statistiques dashboard administrateur."""

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin_p3",
            email="admin_p3@emsp.int",
            password="testpass123",
            role=User.Role.ADMIN,
        )
        self.client = Client()

    def test_dashboard_admin_stats(self):
        """Le dashboard admin affiche les indicateurs clés."""
        self.client.login(username="admin_p3@emsp.int", password="testpass123")
        response = self.client.get(reverse("parrainage:dashboard"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Parrainages actifs")
        self.assertContains(response, "Cadets sans Ainé")
