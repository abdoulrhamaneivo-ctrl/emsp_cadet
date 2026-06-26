"""
Commande de clôture d'année académique — archivage parrainages et Ainés.

Usage :
    python manage.py archiver_annee
    python manage.py archiver_annee --annee-id 2
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import ProfilParrain, User
from apps.parrainage.models import AnneeAcademique, DemandeParrainage


class Command(BaseCommand):
    help = "Clôture l'année académique active : parrainages, disponibilité Ainés, bascule année."

    def add_arguments(self, parser):
        parser.add_argument(
            "--annee-id",
            type=int,
            help="ID de l'année à clôturer (par défaut : année active).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        annee_id = options.get("annee_id")
        if annee_id:
            annee = AnneeAcademique.objects.filter(pk=annee_id).first()
        else:
            annee = AnneeAcademique.objects.filter(est_active=True).first()

        if not annee:
            self.stderr.write(self.style.ERROR("Aucune année académique à clôturer."))
            return

        self.stdout.write(f"Clôture de l'année {annee.libelle}…")

        # Parrainages acceptés → terminés
        parrainages = DemandeParrainage.objects.filter(
            statut=DemandeParrainage.Statut.ACCEPTE,
            annee_academique=annee,
        )
        nb_termines = 0
        for demande in parrainages:
            demande.statut = DemandeParrainage.Statut.TERMINE
            demande.date_fin = timezone.now()
            demande.save(update_fields=["statut", "date_fin"])
            nb_termines += 1

        self.stdout.write(f"  -> {nb_termines} parrainage(s) cloture(s).")

        # Ainés sans reconduction → indisponibles dans l'annuaire
        profils = ProfilParrain.objects.filter(
            reconduction_confirmee=False,
            utilisateur__role=User.Role.PARRAIN,
        )
        nb_masques = profils.update(disponible=False)
        self.stdout.write(f"  -> {nb_masques} profil(s) Aine masque(s) (sans reconduction).")

        # Réinitialiser reconduction pour la prochaine campagne
        ProfilParrain.objects.filter(reconduction_confirmee=True).update(
            reconduction_confirmee=False
        )

        annee.est_active = False
        annee.save(update_fields=["est_active"])

        suivante = (
            AnneeAcademique.objects.filter(date_debut__gt=annee.date_debut)
            .order_by("date_debut")
            .first()
        )
        if suivante:
            suivante.est_active = True
            suivante.save(update_fields=["est_active"])
            self.stdout.write(self.style.SUCCESS(
                f"Année {annee.libelle} archivée. {suivante.libelle} est maintenant active."
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f"Année {annee.libelle} archivée. Aucune année suivante trouvée."
            ))
