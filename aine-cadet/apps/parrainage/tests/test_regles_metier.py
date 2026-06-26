"""
Tests des règles métier Ainé & Cadet (CDC §4, R1–R6).

R1 : un Cadet = un seul parrain actif
R2 : un Ainé max 5 Cadets actifs
R3 : Ainé saturé masqué de l'annuaire
R4 : email domaine école
R5 : rôle modifiable admin seul (modèle)
R6 : fin parrainage libère place (service disponibilité)
"""
from django.core.exceptions import ValidationError
from django.test import TestCase, override_settings

from apps.accounts.models import ProfilParrain, User
from apps.accounts.validators import validate_school_email
from apps.parrainage.models import DemandeParrainage
from apps.parrainage.services import (
    filleul_a_deja_un_parrain_actif,
    mettre_a_jour_disponibilite_parrain,
    parrain_a_de_la_place,
    valider_nouvelle_demande,
)


class ReglesMetierTests(TestCase):
    """Tests R1–R4 et R6 via services.py."""

    def setUp(self):
        self.cadet = User.objects.create_user(
            username="cadet1",
            email="cadet1@emsp.int",
            password="testpass123",
            first_name="Awa",
            last_name="Kone",
            role=User.Role.FILLEUL,
            filiere="FS MENUM",
        )
        self.aine = User.objects.create_user(
            username="aine1",
            email="aine1@emsp.int",
            password="testpass123",
            first_name="Moussa",
            last_name="Diallo",
            role=User.Role.PARRAIN,
            filiere="FS MENUM",
        )
        ProfilParrain.objects.create(utilisateur=self.aine, disponible=True)

    def test_r4_email_domaine_ecole(self):
        """R4 — refus hors domaine configuré."""
        with self.assertRaises(ValidationError):
            validate_school_email("externe@gmail.com")

    def test_r1_un_seul_parrain_actif(self):
        """R1 — un Cadet ne peut avoir qu'un parrainage accepté."""
        DemandeParrainage.objects.create(
            filleul=self.cadet,
            parrain=self.aine,
            statut=DemandeParrainage.Statut.ACCEPTE,
        )
        self.assertTrue(filleul_a_deja_un_parrain_actif(self.cadet))

        aine2 = User.objects.create_user(
            username="aine2",
            email="aine2@emsp.int",
            password="x",
            role=User.Role.PARRAIN,
        )
        ProfilParrain.objects.create(utilisateur=aine2, disponible=True)

        with self.assertRaises(ValidationError):
            valider_nouvelle_demande(self.cadet, aine2)

    @override_settings(PARRAIN_MAX_FILLEULS=2)
    def test_r2_capacite_max_aine(self):
        """R2 — un Ainé ne dépasse pas la capacité max."""
        for i in range(2):
            cadet = User.objects.create_user(
                username=f"c{i}",
                email=f"c{i}@emsp.int",
                password="x",
                role=User.Role.FILLEUL,
            )
            DemandeParrainage.objects.create(
                filleul=cadet,
                parrain=self.aine,
                statut=DemandeParrainage.Statut.ACCEPTE,
            )
        self.assertFalse(parrain_a_de_la_place(self.aine))

        cadet_extra = User.objects.create_user(
            username="extra",
            email="extra@emsp.int",
            password="x",
            role=User.Role.FILLEUL,
        )
        with self.assertRaises(ValidationError):
            valider_nouvelle_demande(cadet_extra, self.aine)

    @override_settings(PARRAIN_MAX_FILLEULS=1)
    def test_r3_aine_sature_masque_annuaire(self):
        """R3 — Ainé saturé n'est plus disponible dans l'annuaire."""
        cadet = User.objects.create_user(
            username="c_sat",
            email="c_sat@emsp.int",
            password="x",
            role=User.Role.FILLEUL,
        )
        DemandeParrainage.objects.create(
            filleul=cadet,
            parrain=self.aine,
            statut=DemandeParrainage.Statut.ACCEPTE,
        )
        mettre_a_jour_disponibilite_parrain(self.aine)
        self.aine.profil_parrain.refresh_from_db()
        self.assertFalse(self.aine.profil_parrain.disponible)

    @override_settings(PARRAIN_MAX_FILLEULS=2)
    def test_r6_fin_parrainage_libere_place(self):
        """R6 — fin de parrainage réaffiche l'Ainé dans l'annuaire."""
        cadet = User.objects.create_user(
            username="c_fin",
            email="c_fin@emsp.int",
            password="x",
            role=User.Role.FILLEUL,
        )
        demande = DemandeParrainage.objects.create(
            filleul=cadet,
            parrain=self.aine,
            statut=DemandeParrainage.Statut.ACCEPTE,
        )
        mettre_a_jour_disponibilite_parrain(self.aine)

        demande.statut = DemandeParrainage.Statut.TERMINE
        demande.save()
        mettre_a_jour_disponibilite_parrain(self.aine)
        self.aine.profil_parrain.refresh_from_db()
        self.assertTrue(self.aine.profil_parrain.disponible)
