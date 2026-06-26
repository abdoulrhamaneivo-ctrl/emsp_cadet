"""Interface d'administration — comptes Ainé & Cadet."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import ProfilParrain, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Gestion des utilisateurs et suspension de comptes (CDC §2 admin)."""

    list_display = ("email", "first_name", "last_name", "role", "filiere", "is_suspended", "is_active")
    list_filter = ("role", "filiere", "is_suspended", "is_active")
    search_fields = ("email", "first_name", "last_name", "filiere")
    ordering = ("email",)

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Profil Ainé & Cadet",
            {"fields": ("role", "classe", "filiere", "photo", "attentes", "is_suspended")},
        ),
    )


@admin.register(ProfilParrain)
class ProfilParrainAdmin(admin.ModelAdmin):
    list_display = ("utilisateur", "disponible", "score_fiabilite", "date_mise_a_jour")
    list_filter = ("disponible",)
    search_fields = ("utilisateur__email", "utilisateur__first_name", "centres_interet")
