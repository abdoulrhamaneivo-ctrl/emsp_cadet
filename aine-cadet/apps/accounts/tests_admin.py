from datetime import date, timedelta

from django.contrib import admin
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from apps.accounts.models import ProfilParrain, User
from apps.bibliotheque.models import MediaBibliotheque, RessourceDocument
from apps.concours.models import AnneeConcours, InscriptionConcours
from apps.formations.models import Filiere, Specialite
from apps.parrainage.models import (
    AnneeAcademique,
    Avis,
    Badge,
    BadgeAttribution,
    DemandeParrainage,
    Evenement,
    InscriptionEvenement,
    Message,
    RendezVous,
)


class AdminCrudSmokeTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin_user = User.objects.create_superuser(
            username="admin_smoke",
            email="admin_smoke@emsp.int",
            password="pass12345",
            first_name="Admin",
            last_name="Smoke",
        )
        cls.cadet = User.objects.create_user(
            username="cadet_smoke",
            email="cadet_smoke@emsp.int",
            password="pass12345",
            first_name="Cadet",
            last_name="Smoke",
            role=User.Role.FILLEUL,
        )
        cls.aine = User.objects.create_user(
            username="aine_smoke",
            email="aine_smoke@emsp.int",
            password="pass12345",
            first_name="Aine",
            last_name="Smoke",
            role=User.Role.PARRAIN,
        )
        cls.profil = ProfilParrain.objects.create(utilisateur=cls.aine, disponible=True)
        cls.annee = AnneeAcademique.objects.create(
            libelle="2026-2027",
            date_debut=date(2026, 9, 1),
            date_fin=date(2027, 8, 31),
            est_active=True,
        )
        cls.demande = DemandeParrainage.objects.create(
            filleul=cls.cadet,
            parrain=cls.aine,
            statut=DemandeParrainage.Statut.ACCEPTE,
            annee_academique=cls.annee,
        )
        cls.message = Message.objects.create(
            parrainage=cls.demande,
            expediteur=cls.cadet,
            contenu="Bonjour",
        )
        cls.rdv = RendezVous.objects.create(
            parrainage=cls.demande,
            organisateur=cls.aine,
            titre="RDV smoke",
            date_heure=timezone.now() + timedelta(days=1),
            lieu="Campus",
        )
        cls.avis = Avis.objects.create(
            parrainage=cls.demande,
            auteur=cls.cadet,
            note=4,
            commentaire="OK",
        )
        cls.evenement = Evenement.objects.create(
            titre="Atelier smoke",
            description="Test",
            date_heure=timezone.now() + timedelta(days=5),
            lieu="Salle A",
            organisateur=cls.aine,
            places_max=20,
            annee_academique=cls.annee,
        )
        cls.inscription_evenement = InscriptionEvenement.objects.create(
            evenement=cls.evenement,
            participant=cls.cadet,
        )
        cls.badge = Badge.objects.create(
            code="smoke",
            libelle="Smoke",
            description="Badge test",
        )
        cls.badge_attribution = BadgeAttribution.objects.create(
            parrain=cls.aine,
            badge=cls.badge,
        )
        cls.filiere = Filiere.objects.create(
            slug="smoke-filiere",
            nom="Smoke Filiere",
            code="SMK",
            type_formation=Filiere.TypeFormation.FID,
            duree="1 an",
            resume="Resume smoke",
        )
        cls.specialite = Specialite.objects.create(
            filiere=cls.filiere,
            code="SMKS",
            nom="Smoke specialite",
            ordre=1,
        )
        cls.annee_concours = AnneeConcours.objects.create(
            annee="2026",
            date_limite=date(2026, 12, 31),
            frais_fcfa=25000,
            active=True,
        )
        cls.inscription_concours = InscriptionConcours.objects.create(
            nom="Nom",
            prenom="Prenom",
            moyenne_examen="12.50",
            identite_collante_bac="ABC123",
            filiere_choix_1=InscriptionConcours.SpecialiteFSMenum.LNUM,
            filiere_choix_2=InscriptionConcours.SpecialiteFSMenum.FDIG,
            filiere_choix_3=InscriptionConcours.SpecialiteFSMenum.MDIG,
            email="candidat@example.com",
            annee_academique=cls.annee,
        )
        cls.ressource = RessourceDocument.objects.create(
            titre="Doc smoke",
            categorie=RessourceDocument.Categorie.BROCHURE,
            resume="Resume",
            lien_externe="https://example.com/doc.pdf",
            publie=True,
            reserve_etudiants=False,
            ordre=1,
        )
        cls.media = MediaBibliotheque.objects.create(
            titre="Media smoke",
            type_media=MediaBibliotheque.TypeMedia.VIDEO,
            video_url="https://example.com/video",
            publie=True,
            ordre=1,
        )

    def setUp(self):
        self.client = Client()
        self.client.force_login(self.admin_user)

    def test_all_registered_admin_pages_render(self):
        samples = {
            type(obj): obj
            for obj in (
                self.admin_user,
                self.profil,
                self.annee,
                self.demande,
                self.message,
                self.rdv,
                self.avis,
                self.evenement,
                self.inscription_evenement,
                self.badge,
                self.badge_attribution,
                self.filiere,
                self.specialite,
                self.annee_concours,
                self.inscription_concours,
                self.ressource,
                self.media,
            )
        }

        failures = []
        for model in admin.site._registry.keys():
            opts = model._meta
            if opts.app_label not in {
                "accounts",
                "parrainage",
                "concours",
                "formations",
                "bibliotheque",
                "auth",
            }:
                continue
            base = f"admin:{opts.app_label}_{opts.model_name}"
            urls = [
                ("changelist", reverse(base + "_changelist")),
                ("add", reverse(base + "_add")),
            ]
            sample = samples.get(model)
            if sample and sample.pk:
                urls.extend(
                    [
                        ("change", reverse(base + "_change", args=[sample.pk])),
                        ("delete", reverse(base + "_delete", args=[sample.pk])),
                    ]
                )
            for kind, url in urls:
                response = self.client.get(url)
                if response.status_code >= 400:
                    failures.append(f"{opts.label}.{kind}:{response.status_code}")

        self.assertEqual(failures, [])

    def test_key_admin_add_forms_save(self):
        posts = [
            (
                "admin:formations_filiere_add",
                {
                    "slug": "post-filiere",
                    "nom": "Post Filiere",
                    "code": "POST",
                    "type_formation": "fid",
                    "duree": "1 an",
                    "ordre": "9",
                    "publie": "on",
                    "resume": "Resume post",
                    "description": "Description",
                    "conditions_admission": "Conditions",
                    "debouches": "Debouches",
                    "specialites-TOTAL_FORMS": "0",
                    "specialites-INITIAL_FORMS": "0",
                    "specialites-MIN_NUM_FORMS": "0",
                    "specialites-MAX_NUM_FORMS": "1000",
                    "_save": "Enregistrer",
                },
            ),
            (
                "admin:formations_specialite_add",
                {
                    "filiere": str(self.filiere.pk),
                    "code": "PST",
                    "nom": "Post Specialite",
                    "description": "Desc",
                    "debouches": "Deb",
                    "cours": "Cours",
                    "ordre": "2",
                    "_save": "Enregistrer",
                },
            ),
            (
                "admin:concours_anneeconcours_add",
                {
                    "annee": "2027",
                    "date_limite": "2027-12-31",
                    "frais_fcfa": "30000",
                    "active": "on",
                    "_save": "Enregistrer",
                },
            ),
            (
                "admin:bibliotheque_ressourcedocument_add",
                {
                    "titre": "Post doc",
                    "categorie": "brochure",
                    "resume": "Resume",
                    "ordre": "1",
                    "publie": "on",
                    "lien_externe": "https://example.com/doc.pdf",
                    "_save": "Enregistrer",
                },
            ),
            (
                "admin:bibliotheque_mediabibliotheque_add",
                {
                    "titre": "Post media",
                    "type_media": "video",
                    "video_url": "https://example.com/video",
                    "legende": "Legende",
                    "ordre": "1",
                    "publie": "on",
                    "_save": "Enregistrer",
                },
            ),
            (
                "admin:accounts_user_add",
                {
                    "username": "new_admin_user",
                    "email": "new_admin@emsp.int",
                    "password1": "StrongPass12345",
                    "password2": "StrongPass12345",
                    "_save": "Enregistrer",
                },
            ),
        ]

        for url_name, payload in posts:
            with self.subTest(url_name=url_name):
                response = self.client.post(reverse(url_name), payload, follow=False)
                self.assertIn(response.status_code, (302, 303))
