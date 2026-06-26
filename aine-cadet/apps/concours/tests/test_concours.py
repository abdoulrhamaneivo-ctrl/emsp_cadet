"""Tests inscription concours FS MENUM et contrôles administration."""
import json
from datetime import date
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core import mail

# Déconnexion du signal store_rendered_templates pour contourner l'incompatibilité Python 3.14 / Django 5.x
from django.test.signals import template_rendered
from django.test.client import store_rendered_templates
template_rendered.disconnect(store_rendered_templates)

from apps.concours.models import AnneeConcours, InscriptionConcours


User = get_user_model()


class InscriptionConcoursTests(TestCase):
    """Tests d'inscription et de contrôle du concours."""

    def setUp(self):
        # Création de la session active
        self.session = AnneeConcours.objects.create(
            annee="2026-2027 — 4e promotion",
            date_limite=date(2026, 12, 31),
            frais_fcfa=25000,
            active=True,
        )
        # Création d'un utilisateur admin pour le tableau de bord
        self.admin_user = User.objects.create_superuser(
            username="admin@emsp.int",
            email="admin@emsp.int",
            password="adminpassword"
        )
        self.client = Client()

    def test_inscription_valide_avec_fichiers(self):
        """Soumission valide avec fichiers joints et spécialités distinctes."""
        url = reverse("concours:inscription")
        
        photo = SimpleUploadedFile("photo.jpg", b"photo_data", content_type="image/jpeg")
        cni = SimpleUploadedFile("cni.pdf", b"cni_data", content_type="application/pdf")
        bac = SimpleUploadedFile("bac.pdf", b"bac_data", content_type="application/pdf")
        
        data = {
            "nom": "Kouassi",
            "prenom": "Aya",
            "moyenne_examen": "14.50",
            "identite_collante_bac": "BAC2026123456",
            "email": "aya@exemple.com",
            "filiere_choix_1": "LNUM",
            "filiere_choix_2": "FDIG",
            "filiere_choix_3": "MDIG",
            "type_piece_cni": "cni",
            "photo_candidat": photo,
            "cni_document": cni,
            "collante_bac": bac,
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(InscriptionConcours.objects.count(), 1)
        
        ins = InscriptionConcours.objects.first()
        self.assertEqual(ins.nom, "Kouassi")
        self.assertEqual(ins.statut, InscriptionConcours.StatutCandidature.EN_ATTENTE)
        self.assertTrue(ins.photo_candidat.name.startswith("concours/photos/photo"))
        self.assertTrue(ins.cni_document.name.startswith("concours/cni/cni"))
        self.assertTrue(ins.collante_bac.name.startswith("concours/bac/bac"))

    def test_inscription_fermee_si_pas_de_session_active(self):
        """Vérifier que l'inscription est refusée si aucune session active n'existe."""
        self.session.active = False
        self.session.save()
        
        url = reverse("concours:inscription")
        photo = SimpleUploadedFile("photo.jpg", b"photo_data", content_type="image/jpeg")
        cni = SimpleUploadedFile("cni.pdf", b"cni_data", content_type="application/pdf")
        bac = SimpleUploadedFile("bac.pdf", b"bac_data", content_type="application/pdf")
        
        data = {
            "nom": "Kouassi",
            "prenom": "Aya",
            "moyenne_examen": "14.50",
            "identite_collante_bac": "BAC2026123456",
            "filiere_choix_1": "LNUM",
            "filiere_choix_2": "FDIG",
            "filiere_choix_3": "MDIG",
            "type_piece_cni": "cni",
            "photo_candidat": photo,
            "cni_document": cni,
            "collante_bac": bac,
        }
        
        response = self.client.post(url, data)
        # Redirection vers la même page et aucune inscription créée
        self.assertEqual(response.status_code, 302)
        self.assertEqual(InscriptionConcours.objects.count(), 0)

    def test_choix_filiere_doublon_refuse(self):
        """Vérifier que les choix de spécialités identiques sont refusés."""
        url = reverse("concours:inscription")
        photo = SimpleUploadedFile("photo.jpg", b"photo_data", content_type="image/jpeg")
        cni = SimpleUploadedFile("cni.pdf", b"cni_data", content_type="application/pdf")
        bac = SimpleUploadedFile("bac.pdf", b"bac_data", content_type="application/pdf")
        
        data = {
            "nom": "Test",
            "prenom": "User",
            "moyenne_examen": "12.00",
            "identite_collante_bac": "123",
            "filiere_choix_1": "LNUM",
            "filiere_choix_2": "LNUM",  # Doublon !
            "filiere_choix_3": "MDIG",
            "type_piece_cni": "cni",
            "photo_candidat": photo,
            "cni_document": cni,
            "collante_bac": bac,
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200) # Erreur de formulaire, réaffiche la page
        self.assertEqual(InscriptionConcours.objects.count(), 0)

    def test_admin_toggle_concours(self):
        """L'administrateur peut ouvrir ou fermer le concours."""
        self.client.login(email="admin@emsp.int", password="adminpassword")
        url = reverse("concours:dashboard_inscriptions")
        
        # Fermer le concours
        response = self.client.post(url, {"action": "toggle_concours"})
        self.assertEqual(response.status_code, 302)
        self.session.refresh_from_db()
        self.assertFalse(self.session.active)
        
        # Réouvrir le concours
        response = self.client.post(url, {"action": "toggle_concours"})
        self.assertEqual(response.status_code, 302)
        self.session.refresh_from_db()
        self.assertTrue(self.session.active)

    def test_admin_valider_rejeter_candidature(self):
        """L'administrateur peut valider ou rejeter un dossier de candidature."""
        # Création d'une inscription initiale en attente
        ins = InscriptionConcours.objects.create(
            nom="Aka",
            prenom="Marc",
            moyenne_examen="15.00",
            identite_collante_bac="BAC456",
            filiere_choix_1="LNUM",
            filiere_choix_2="FDIG",
            filiere_choix_3="MDIG",
            statut=InscriptionConcours.StatutCandidature.EN_ATTENTE
        )
        
        self.client.login(email="admin@emsp.int", password="adminpassword")
        url = reverse("concours:dashboard_inscriptions")
        
        # Validation du dossier
        response = self.client.post(url, {
            "action": "valider_dossier",
            "inscription_id": ins.pk
        })
        self.assertEqual(response.status_code, 302)
        ins.refresh_from_db()
        self.assertEqual(ins.statut, InscriptionConcours.StatutCandidature.VALIDE)
        
        # Rejet du dossier
        response = self.client.post(url, {
            "action": "rejeter_dossier",
            "inscription_id": ins.pk
        })
        self.assertEqual(response.status_code, 302)
        ins.refresh_from_db()
        self.assertEqual(ins.statut, InscriptionConcours.StatutCandidature.REJETE)

    def test_preinscription_json_session_active(self):
        """Pré-inscription vitrine JSON avec session ouverte."""
        url = reverse("concours:preinscription_json")
        payload = {
            "nom": "Diallo",
            "prenom": "Fatou",
            "email": "fatou@exemple.com",
            "parcours": "ingenierie",
            "motivation": "Passionné par le numérique.",
        }
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["ok"])
        self.assertEqual(len(mail.outbox), 2)
        recipients = {addr for msg in mail.outbox for addr in msg.to}
        self.assertIn("fatou@exemple.com", recipients)

    def test_preinscription_json_fermee_sans_session(self):
        """Pré-inscription refusée si concours fermé."""
        self.session.active = False
        self.session.save()
        url = reverse("concours:preinscription_json")
        response = self.client.post(
            url,
            data=json.dumps({"nom": "A", "prenom": "B", "email": "a@b.com", "parcours": "management"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(response.json()["ok"])

