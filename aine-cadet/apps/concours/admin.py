"""Administration inscriptions concours."""
from django.contrib import admin

from .models import AnneeConcours, InscriptionConcours


@admin.register(AnneeConcours)
class AnneeConcoursAdmin(admin.ModelAdmin):
    list_display = ("annee", "date_limite", "frais_fcfa", "active")
    list_filter = ("active",)
    fieldsets = (
        (None, {"fields": ("annee", "date_limite", "frais_fcfa", "active")}),
        (
            "Note",
            {
                "description": (
                    "Vérifier le calendrier officiel sur www.emsp.int à chaque rentrée "
                    "avant d'activer une nouvelle session."
                ),
                "fields": (),
            },
        ),
    )


@admin.register(InscriptionConcours)
class InscriptionConcoursAdmin(admin.ModelAdmin):
    list_display = (
        "nom",
        "prenom",
        "moyenne_examen",
        "filiere_choix_1",
        "date_inscription",
        "annee_academique",
    )
    list_filter = ("filiere_choix_1", "annee_academique")
    search_fields = ("nom", "prenom", "identite_collante_bac", "email")
