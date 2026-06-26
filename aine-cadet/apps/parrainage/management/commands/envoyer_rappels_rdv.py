"""
Commande cron — rappels email pour les RDV acceptés dans les 24 h.

Usage local :
    python manage.py envoyer_rappels_rdv

Cron production (exemple, docs/ROADMAP.md) :
    0 8 * * * cd /chemin/aine-cadet && .venv/bin/python manage.py envoyer_rappels_rdv
"""
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.parrainage.models import RendezVous


class Command(BaseCommand):
    help = "Envoie un email de rappel pour les rendez-vous acceptés dans les prochaines 24 h."

    def handle(self, *args, **options):
        now = timezone.now()
        limite = now + timedelta(hours=24)

        rdv_liste = RendezVous.objects.filter(
            statut=RendezVous.Statut.ACCEPTE,
            rappel_envoye=False,
            date_heure__gte=now,
            date_heure__lte=limite,
        ).select_related(
            "parrainage",
            "parrainage__parrain",
            "parrainage__filleul",
            "organisateur",
        )

        envois = 0
        for rdv in rdv_liste:
            parrainage = rdv.parrainage
            destinataires = [parrainage.parrain, parrainage.filleul]
            sujet = f"[{settings.APP_NAME}] Rappel : {rdv.titre}"
            for user in destinataires:
                if not user.email:
                    continue
                corps = (
                    f"Bonjour {user.first_name},\n\n"
                    f"Rappel : rendez-vous « {rdv.titre} » prévu le "
                    f"{rdv.date_heure.strftime('%d/%m/%Y à %H:%M')} à {rdv.lieu}.\n\n"
                    f"— {settings.APP_NAME}"
                )
                send_mail(
                    sujet,
                    corps,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                envois += 1

            rdv.rappel_envoye = True
            rdv.save(update_fields=["rappel_envoye"])

        self.stdout.write(
            self.style.SUCCESS(f"{envois} email(s) de rappel envoyé(s) pour {rdv_liste.count()} RDV.")
        )
