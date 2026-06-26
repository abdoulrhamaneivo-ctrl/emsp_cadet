"""Commande d'initialisation des badges par défaut (CDC §3.8)."""
from django.core.management.base import BaseCommand

from apps.parrainage.services import assurer_badges_existants


class Command(BaseCommand):
    help = "Crée les badges par défaut Ainé & Cadet s'ils n'existent pas."

    def handle(self, *args, **options):
        assurer_badges_existants()
        self.stdout.write(self.style.SUCCESS("Badges par défaut initialisés."))
