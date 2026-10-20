from django.contrib import admin

from .models import Candidature, Offre


@admin.register(Offre)
class OffreAdmin(admin.ModelAdmin):
    list_display = ("titre", "entreprise", "type_offre", "auteur", "publiee", "date_publication")
    list_filter = ("type_offre", "publiee")
    search_fields = ("titre", "entreprise", "localisation", "auteur__email")
    readonly_fields = ("date_publication",)


@admin.register(Candidature)
class CandidatureAdmin(admin.ModelAdmin):
    list_display = ("offre", "candidat", "date_candidature")
    search_fields = ("offre__titre", "candidat__email", "candidat__prenom", "candidat__nom")
    readonly_fields = ("offre", "candidat", "message", "date_candidature")
