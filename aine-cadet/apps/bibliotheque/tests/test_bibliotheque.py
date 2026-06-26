"""Tests bibliothèque numérique."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from apps.bibliotheque.models import RessourceDocument

User = get_user_model()


class BibliothequeTests(TestCase):
    """Accès authentifié et API publique."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="cadet1",
            email="cadet@emsp.int",
            password="TestPass123!",
            first_name="Aya",
            last_name="Kouassi",
            role=User.Role.FILLEUL,
        )
        self.ressource_publique = RessourceDocument.objects.create(
            titre="Brochure EMSP",
            categorie=RessourceDocument.Categorie.BROCHURE,
            resume="Présentation institutionnelle.",
            lien_externe="https://www.emsp.int/brochure.pdf",
            publie=True,
            reserve_etudiants=False,
        )
        self.ressource_reservee = RessourceDocument.objects.create(
            titre="Cours LNUM S1",
            categorie=RessourceDocument.Categorie.COURS,
            resume="Support de cours L1.",
            lien_externe="https://www.emsp.int/cours.pdf",
            publie=True,
            reserve_etudiants=True,
        )

    def test_liste_redirige_anonyme(self):
        url = reverse("bibliotheque:liste")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)
        self.assertIn("/accounts/login/", response.url)

    def test_liste_connecte_ok(self):
        self.client.login(username="cadet@emsp.int", password="TestPass123!")
        response = self.client.get(reverse("bibliotheque:liste"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Brochure EMSP")
        self.assertContains(response, "Cours LNUM S1")

    def test_detail_connecte_ok(self):
        self.client.login(username="cadet@emsp.int", password="TestPass123!")
        url = reverse("bibliotheque:detail", kwargs={"pk": self.ressource_reservee.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Cours LNUM S1")

    def test_api_publiques_uniquement(self):
        response = self.client.get(reverse("bibliotheque:api_publiques"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        titres = [r["titre"] for r in data["ressources"]]
        self.assertIn("Brochure EMSP", titres)
        self.assertNotIn("Cours LNUM S1", titres)
