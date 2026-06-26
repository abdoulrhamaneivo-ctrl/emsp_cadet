"""
Validateurs métier — comptes utilisateurs.

CDC §3.1 : seuls les emails du domaine de l'école sont acceptés (règle R4).
"""
from django.conf import settings
from django.core.exceptions import ValidationError


def validate_school_email(value: str) -> None:
    """Refuse toute adresse dont le domaine ne correspond pas à l'école."""
    domain = settings.SCHOOL_EMAIL_DOMAIN.lower()
    email = value.lower().strip()
    if not email.endswith(f"@{domain}"):
        raise ValidationError(
            f"L'inscription est réservée aux adresses @{domain}."
        )
