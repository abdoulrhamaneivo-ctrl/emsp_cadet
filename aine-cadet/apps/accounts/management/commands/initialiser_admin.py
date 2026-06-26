"""Commande idempotente pour creer ou reparer le compte administrateur."""
import getpass
import os

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.accounts.models import User


class Command(BaseCommand):
    help = "Cree ou met a jour le compte administrateur EMSP."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            default=os.getenv("EMSP_ADMIN_EMAIL", "admin@emsp.int"),
            help="Adresse e-mail du compte admin.",
        )
        parser.add_argument(
            "--password",
            default=os.getenv("EMSP_ADMIN_PASSWORD", ""),
            help="Mot de passe admin. Peut aussi venir de EMSP_ADMIN_PASSWORD.",
        )
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="Ne pas demander le mot de passe interactivement.",
        )

    def handle(self, *args, **options):
        email = (options["email"] or "").strip().lower()
        password = options["password"] or ""

        if not email:
            raise CommandError("Email admin obligatoire.")

        if not password and not options["no_input"]:
            password = getpass.getpass("Mot de passe admin: ")

        if not password:
            raise CommandError(
                "Mot de passe admin absent. Utilisez --password ou EMSP_ADMIN_PASSWORD."
            )

        base_username = email.split("@", 1)[0]

        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": self._available_username(base_username),
                    "first_name": "Admin",
                    "last_name": "EMSP",
                    "role": User.Role.ADMIN,
                    "is_staff": True,
                    "is_superuser": True,
                    "is_active": True,
                },
            )

            changed = []
            required_values = {
                "username": user.username or self._available_username(base_username, user.pk),
                "first_name": user.first_name or "Admin",
                "last_name": user.last_name or "EMSP",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "is_suspended": False,
            }

            for field, value in required_values.items():
                if getattr(user, field) != value:
                    setattr(user, field, value)
                    changed.append(field)

            user.set_password(password)
            changed.append("password")
            user.full_clean(exclude=["password"])
            user.save()

        action = "cree" if created else "mis a jour"
        self.stdout.write(self.style.SUCCESS(f"Compte admin {action} : {email}"))
        if changed:
            self.stdout.write("Champs verifies : " + ", ".join(sorted(set(changed))))

    def _available_username(self, base_username, user_pk=None):
        username = base_username or "admin"
        suffix = 1
        qs = User.objects.filter(username=username)
        if user_pk:
            qs = qs.exclude(pk=user_pk)
        while qs.exists():
            username = f"{base_username}{suffix}"
            suffix += 1
            qs = User.objects.filter(username=username)
            if user_pk:
                qs = qs.exclude(pk=user_pk)
        return username
