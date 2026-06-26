"""Interface d'administration — parrainage Ainé & Cadet."""
from django.contrib import admin

from .models import (
    AnneeAcademique,
    Avis,
    Badge,
    BadgeAttribution,
    DemandeParrainage,
    Evenement,
    InscriptionEvenement,
    Message,
    RendezVous,
)


@admin.register(DemandeParrainage)
class DemandeParrainageAdmin(admin.ModelAdmin):
    list_display = ("filleul", "parrain", "statut", "date_creation", "date_reponse")
    list_filter = ("statut",)
    search_fields = ("filleul__email", "parrain__email")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("parrainage", "expediteur", "date_envoi", "lu")
    list_filter = ("lu",)


@admin.register(RendezVous)
class RendezVousAdmin(admin.ModelAdmin):
    list_display = ("titre", "parrainage", "date_heure", "statut", "rappel_envoye")


@admin.register(Avis)
class AvisAdmin(admin.ModelAdmin):
    list_display = ("parrainage", "auteur", "note", "date_creation")


@admin.register(Evenement)
class EvenementAdmin(admin.ModelAdmin):
    list_display = ("titre", "organisateur", "date_heure", "lieu")


admin.site.register(InscriptionEvenement)
admin.site.register(Badge)
admin.site.register(BadgeAttribution)


@admin.register(AnneeAcademique)
class AnneeAcademiqueAdmin(admin.ModelAdmin):
    list_display = ("libelle", "date_debut", "date_fin", "est_active")
    list_filter = ("est_active",)
