from datetime import date, timedelta
from html.parser import HTMLParser

from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone

from apps.accounts.models import ProfilParrain, User
from apps.bibliotheque.models import MediaBibliotheque, RessourceDocument
from apps.concours.models import AnneeConcours
from apps.formations.models import Filiere, Specialite
from apps.parrainage.models import AnneeAcademique, DemandeParrainage, Evenement


class InternalLinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.forms = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag == "form":
            self.forms.append((attrs.get("method", "get").lower(), attrs.get("action", "")))


class NavigationFlowTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin_user = User.objects.create_superuser(
            username="flow_admin",
            email="flow_admin@emsp.int",
            password="pass12345",
            first_name="Admin",
            last_name="Flow",
        )
        cls.cadet = User.objects.create_user(
            username="flow_cadet",
            email="flow_cadet@emsp.int",
            password="pass12345",
            first_name="Cadet",
            last_name="Flow",
            role=User.Role.FILLEUL,
        )
        cls.aine = User.objects.create_user(
            username="flow_aine",
            email="flow_aine@emsp.int",
            password="pass12345",
            first_name="Aine",
            last_name="Flow",
            role=User.Role.PARRAIN,
        )
        ProfilParrain.objects.create(utilisateur=cls.aine, disponible=True)
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
        cls.evenement = Evenement.objects.create(
            titre="Atelier flow",
            description="Test",
            date_heure=timezone.now() + timedelta(days=5),
            lieu="Salle A",
            organisateur=cls.aine,
            places_max=20,
            annee_academique=cls.annee,
        )
        cls.filiere = Filiere.objects.create(
            slug="flow-filiere",
            nom="Flow Filiere",
            code="FLOW",
            type_formation=Filiere.TypeFormation.FID,
            duree="1 an",
            resume="Resume flow",
            publie=True,
        )
        Specialite.objects.create(
            filiere=cls.filiere,
            code="FLOW",
            nom="Flow specialite",
            ordre=1,
        )
        AnneeConcours.objects.create(
            annee="2026",
            date_limite=date(2026, 12, 31),
            frais_fcfa=25000,
            active=True,
        )
        RessourceDocument.objects.create(
            titre="Doc flow",
            categorie=RessourceDocument.Categorie.BROCHURE,
            resume="Resume",
            lien_externe="https://example.com/doc.pdf",
            publie=True,
            reserve_etudiants=False,
            ordre=1,
        )
        MediaBibliotheque.objects.create(
            titre="Media flow",
            type_media=MediaBibliotheque.TypeMedia.VIDEO,
            video_url="https://example.com/video",
            publie=True,
            ordre=1,
        )

    def assert_page_ok(self, client, url):
        response = client.get(url)
        self.assertLess(response.status_code, 400, f"{url} -> {response.status_code}")
        return response

    def test_sidebar_logout_uses_post_and_logs_out(self):
        client = Client()
        client.force_login(self.cadet)
        response = self.assert_page_ok(client, reverse("parrainage:dashboard"))
        parser = InternalLinkParser()
        parser.feed(response.content.decode("utf-8", errors="ignore"))

        logout_url = reverse("accounts:logout")
        self.assertNotIn(logout_url, parser.links)
        self.assertIn(("post", logout_url), parser.forms)

        response = client.post(logout_url)
        self.assertEqual(response.status_code, 302)
        response = client.get(reverse("parrainage:dashboard"))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse("accounts:login"), response["Location"])

    def test_authenticated_internal_links_do_not_error(self):
        client = Client()
        client.force_login(self.cadet)
        start_urls = [
            reverse("parrainage:accueil"),
            reverse("parrainage:dashboard"),
            reverse("parrainage:annuaire"),
            reverse("parrainage:evenements_liste"),
            reverse("accounts:profil"),
            reverse("formations:liste"),
            reverse("bibliotheque:liste"),
            reverse("concours:inscription"),
        ]

        failures = []
        seen = set()
        for start_url in start_urls:
            response = self.assert_page_ok(client, start_url)
            parser = InternalLinkParser()
            parser.feed(response.content.decode("utf-8", errors="ignore"))
            for href in parser.links:
                if not href.startswith("/"):
                    continue
                if href.startswith("/admin/") or href.startswith("/media/") or href in seen:
                    continue
                seen.add(href)
                link_response = client.get(href)
                if link_response.status_code >= 400:
                    failures.append(f"{href} -> {link_response.status_code}")

        self.assertEqual(failures, [])

    def test_admin_shortcuts_and_core_pages_do_not_error(self):
        client = Client()
        client.force_login(self.admin_user)
        urls = [
            "/admin/",
            "/admin/accounts/user/",
            "/admin/formations/filiere/",
            "/admin/formations/specialite/",
            "/admin/bibliotheque/ressourcedocument/",
            "/admin/bibliotheque/mediabibliotheque/",
            "/admin/concours/inscriptionconcours/",
        ]
        failures = []
        for url in urls:
            response = client.get(url)
            if response.status_code >= 400:
                failures.append(f"{url} -> {response.status_code}")
        self.assertEqual(failures, [])
