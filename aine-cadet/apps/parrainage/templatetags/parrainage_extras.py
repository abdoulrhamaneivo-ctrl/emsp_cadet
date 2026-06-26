"""Filtres template — annuaire et fiches Ainé."""
from django import template

register = template.Library()


@register.filter
def split_csv(value: str) -> list[str]:
    """Découpe une chaîne séparée par virgules en liste de tags."""
    if not value:
        return []
    return [part.strip() for part in str(value).split(",") if part.strip()]


@register.filter
def initiales(user) -> str:
    """Initiales prénom + nom pour avatar placeholder."""
    prenom = (getattr(user, "first_name", "") or "").strip()
    nom = (getattr(user, "last_name", "") or "").strip()
    parts = []
    if prenom:
        parts.append(prenom[0].upper())
    if nom:
        parts.append(nom[0].upper())
    return "".join(parts) or "?"
