"""Tests vues Phase 1 — parcours inscription et annuaire."""
from django.core import mail
from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import ProfilParrain, User


class VuesPhase1Tests(TestCase):
    def setUp(self):
        self.client = Client()
        self.aine = User.objects.create_user(
            username="v_aine",
            email="v_aine@emsp.int",
            password="testpass123",
            role=User.Role.PARRAIN,
            first_name="Ibra",
            last_name="Sow",
        )
        ProfilParrain.objects.create(utilisateur=self.aine, disponible=True)

    def test_accueil_public(self):
        response = self.client.get(reverse("parrainage:accueil"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Ainé")

    def test_annuaire_authentifie(self):
        cadet = User.objects.create_user(
            username="v_cadet",
            email="v_cadet@emsp.int",
            password="testpass123",
            role=User.Role.FILLEUL,
        )
        self.client.login(username="v_cadet@emsp.int", password="testpass123")
        response = self.client.get(reverse("parrainage:annuaire"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Ibra")

    def test_inscription_cadet(self):
        response = self.client.post(
            reverse("accounts:inscription"),
            {
                "email": "nouveau@emsp.int",
                "first_name": "Nouveau",
                "last_name": "Cadet",
                "role": User.Role.FILLEUL,
                "classe": "L1",
                "filiere": "FS MENUM",
                "password1": "ComplexPass123!",
                "password2": "ComplexPass123!",
            },
        )
        self.assertEqual(response.status_code, 302)
        self.assertTrue(User.objects.filter(email="nouveau@emsp.int").exists())
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("nouveau@emsp.int", mail.outbox[0].to)
        self.assertIn("Bienvenue", mail.outbox[0].subject)
