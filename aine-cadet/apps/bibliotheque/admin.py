"""Administration bibliothèque numérique — CRUD ressources."""
from django.contrib import admin

from .models import RessourceDocument


@admin.register(RessourceDocument)
class RessourceDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "titre",
        "categorie",
        "publie",
        "reserve_etudiants",
        "ordre",
        "date_publication",
    )
    list_filter = ("categorie", "publie", "reserve_etudiants")
    search_fields = ("titre", "resume")
    list_editable = ("ordre", "publie", "reserve_etudiants")
    fieldsets = (
        (None, {"fields": ("titre", "categorie", "resume", "ordre", "publie", "reserve_etudiants")}),
        ("Fichier", {"fields": ("fichier", "lien_externe")}),
    )


from .models import MediaBibliotheque

@admin.register(MediaBibliotheque)
class MediaBibliothequeAdmin(admin.ModelAdmin):
    list_display = ("titre", "type_media", "ordre", "publie", "date_creation")
    list_filter = ("type_media", "publie")
    search_fields = ("titre", "legende")
    list_editable = ("ordre", "publie")

