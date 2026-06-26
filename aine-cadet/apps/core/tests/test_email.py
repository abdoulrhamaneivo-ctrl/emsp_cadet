"""Tests module e-mails transactionnels."""
from django.core import mail
from django.test import TestCase, override_settings

from apps.core.email import (
    envoyer_bienvenue_inscription,
    envoyer_contact_accuse_reception,
    envoyer_contact_admin,
    valider_adresse_email,
)
from apps.accounts.models import User


class EmailUtilTests(TestCase):
    def test_valider_adresse_email(self):
        self.assertTrue(valider_adresse_email("test@emsp.int"))
        self.assertFalse(valider_adresse_email("invalide"))
        self.assertFalse(valider_adresse_email(""))

    @override_settings(CONTACT_API_EMAIL="admin@emsp.int")
    def test_contact_admin_et_accuse(self):
        envoyer_contact_admin(
            nom="Dupont",
            email="dupont@exemple.com",
            objet="Info",
            message="Bonjour EMSP",
        )
        envoyer_contact_accuse_reception(
            nom="Dupont",
            email="dupont@exemple.com",
            objet="Info",
        )
        self.assertEqual(len(mail.outbox), 2)
        admin_msg = next(m for m in mail.outbox if m.to == ["admin@emsp.int"])
        self.assertIn("Dupont", admin_msg.body)

    def test_bienvenue_inscription(self):
        user = User.objects.create_user(
            username="cadet1",
            email="cadet1@emsp.int",
            password="testpass123",
            first_name="Awa",
        )
        envoyer_bienvenue_inscription(user)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["cadet1@emsp.int"])
