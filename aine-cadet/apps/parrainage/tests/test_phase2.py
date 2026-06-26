"""
Tests Phase 2 — messagerie et rendez-vous (CDC §3.4–§3.5).
"""
from datetime import timedelta

from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from apps.accounts.models import ProfilParrain, User
from apps.parrainage.models import DemandeParrainage, Message, RendezVous
from apps.parrainage.services import compter_non_lus, peut_acceder_messagerie


class Phase2MessagerieTests(TestCase):
    """Accès messagerie et compteur non lus."""

    def setUp(self):
        self.cadet = User.objects.create_user(
            username="cadet2",
            email="cadet2@emsp.int",
            password="testpass123",
            first_name="Awa",
            last_name="Kone",
            role=User.Role.FILLEUL,
        )
        self.aine = User.objects.create_user(
            username="aine2",
            email="aine2@emsp.int",
            password="testpass123",
            first_name="Moussa",
            last_name="Diallo",
            role=User.Role.PARRAIN,
        )
        ProfilParrain.objects.create(utilisateur=self.aine, disponible=True)
        self.demande_attente = DemandeParrainage.objects.create(
            filleul=self.cadet,
            parrain=self.aine,
            statut=DemandeParrainage.Statut.EN_ATTENTE,
        )
        self.demande_acceptee = DemandeParrainage.objects.create(
            filleul=self.cadet,
            parrain=self.aine,
            statut=DemandeParrainage.Statut.ACCEPTE,
        )
        self.client = Client()

    def test_messagerie_acces_refuse_sans_parrainage_accepte(self):
        """La messagerie est bloquée si le parrainage n'est pas accepté."""
        self.assertFalse(peut_acceder_messagerie(self.demande_attente, self.cadet))

        self.client.login(username="cadet2@emsp.int", password="testpass123")
        url = reverse("parrainage:messages", kwargs={"pk": self.demande_attente.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_messagerie_acces_autorise_binome(self):
        """Ainé et Cadet du binôme accepté peuvent accéder au fil."""
        self.assertTrue(peut_acceder_messagerie(self.demande_acceptee, self.cadet))
        self.assertTrue(peut_acceder_messagerie(self.demande_acceptee, self.aine))

        self.client.login(username="cadet2@emsp.int", password="testpass123")
        url = reverse("parrainage:messages", kwargs={"pk": self.demande_acceptee.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Moussa Diallo")

    def test_compteur_non_lus(self):
        """Le compteur reflète les messages non lus reçus."""
        Message.objects.create(
            parrainage=self.demande_acceptee,
            expediteur=self.aine,
            contenu="Bonjour Cadet",
            lu=False,
        )
        Message.objects.create(
            parrainage=self.demande_acceptee,
            expediteur=self.cadet,
            contenu="Réponse Cadet",
            lu=False,
        )
        self.assertEqual(compter_non_lus(self.cadet), 1)
        self.assertEqual(compter_non_lus(self.aine), 1)

        # Ouverture du fil marque les messages de l'autre comme lus
        self.client.login(username="cadet2@emsp.int", password="testpass123")
        url = reverse("parrainage:messages", kwargs={"pk": self.demande_acceptee.pk})
        self.client.get(url)
        self.assertEqual(compter_non_lus(self.cadet), 0)
        self.assertEqual(compter_non_lus(self.aine), 1)


class Phase2RendezVousTests(TestCase):
    """Proposition et réponses RDV."""

    def setUp(self):
        self.cadet = User.objects.create_user(
            username="cadet3",
            email="cadet3@emsp.int",
            password="testpass123",
            role=User.Role.FILLEUL,
        )
        self.aine = User.objects.create_user(
            username="aine3",
            email="aine3@emsp.int",
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

    def test_proposition_rdv(self):
        """Un membre du binôme peut proposer un RDV."""
        self.client.login(username="aine3@emsp.int", password="testpass123")
        url = reverse("parrainage:rdv_proposer", kwargs={"pk": self.parrainage.pk})
        date_rdv = (timezone.now() + timedelta(days=2)).strftime("%Y-%m-%dT%H:%M")
        response = self.client.post(url, {
            "titre": "Café campus",
            "date_heure": date_rdv,
            "lieu": "Hall EMSP",
        })
        self.assertEqual(response.status_code, 302)
        rdv = RendezVous.objects.get(parrainage=self.parrainage)
        self.assertEqual(rdv.statut, RendezVous.Statut.PROPOSE)
        self.assertEqual(rdv.organisateur, self.aine)

    def test_accepter_refuser_rdv(self):
        """Le destinataire peut accepter ou refuser une proposition."""
        rdv = RendezVous.objects.create(
            parrainage=self.parrainage,
            organisateur=self.aine,
            titre="Rencontre",
            date_heure=timezone.now() + timedelta(days=1),
            lieu="Campus",
            statut=RendezVous.Statut.PROPOSE,
        )

        self.client.login(username="cadet3@emsp.int", password="testpass123")
        url_accepter = reverse(
            "parrainage:rdv_repondre",
            kwargs={"pk": self.parrainage.pk, "rdv_id": rdv.pk, "action": "accepter"},
        )
        self.client.get(url_accepter)
        rdv.refresh_from_db()
        self.assertEqual(rdv.statut, RendezVous.Statut.ACCEPTE)

        rdv2 = RendezVous.objects.create(
            parrainage=self.parrainage,
            organisateur=self.aine,
            titre="Autre RDV",
            date_heure=timezone.now() + timedelta(days=3),
            lieu="Salle B",
            statut=RendezVous.Statut.PROPOSE,
        )
        url_refuser = reverse(
            "parrainage:rdv_repondre",
            kwargs={"pk": self.parrainage.pk, "rdv_id": rdv2.pk, "action": "refuser"},
        )
        self.client.get(url_refuser)
        rdv2.refresh_from_db()
        self.assertEqual(rdv2.statut, RendezVous.Statut.REFUSE)
