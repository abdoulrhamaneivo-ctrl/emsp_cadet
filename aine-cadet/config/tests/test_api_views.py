"""Tests API publiques vitrine."""
import json

from django.core import mail
from django.test import Client, TestCase
from django.urls import reverse


class ContactApiTests(TestCase):
    """Formulaire contact vitrine → /api/contact/."""

    def setUp(self):
        self.client = Client()
        self.url = reverse("api_contact")

    def test_contact_valide_envoie_email(self):
        payload = {
            "nom": "Kouadio",
            "email": "kouadio@exemple.com",
            "objet": "Information",
            "message": "Bonjour, j'aimerais des renseignements.",
        }
        response = self.client.post(
            self.url,
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["ok"])
        self.assertEqual(len(mail.outbox), 2)
        bodies = " ".join(m.body for m in mail.outbox)
        self.assertIn("Kouadio", bodies)
        subjects = [m.subject for m in mail.outbox]
        self.assertTrue(any("Contact" in s or "reçu" in s for s in subjects))

    def test_contact_champs_obligatoires(self):
        response = self.client.post(
            self.url,
            data=json.dumps({"nom": "Test"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()["ok"])

    def test_contact_honeypot_reponse_neutre(self):
        response = self.client.post(
            self.url,
            data=json.dumps({"nom": "Bot", "_gotcha": "spam"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        self.assertEqual(len(mail.outbox), 0)
