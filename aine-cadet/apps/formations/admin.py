"""Administration filières — CRUD images et présentations."""
from django.contrib import admin

from .models import Filiere, Specialite


class SpecialiteInline(admin.TabularInline):
    model = Specialite
    extra = 0
    fields = ("code", "nom", "ordre", "description", "debouches")


@admin.register(Filiere)
class FiliereAdmin(admin.ModelAdmin):
    list_display = ("nom", "code", "type_formation", "ordre", "publie", "date_mise_a_jour")
    list_filter = ("type_formation", "publie")
    search_fields = ("nom", "code", "slug", "resume")
    prepopulated_fields = {"slug": ("nom",)}
    inlines = [SpecialiteInline]
    fieldsets = (
        (None, {"fields": ("slug", "nom", "code", "type_formation", "duree", "ordre", "publie")}),
        ("Contenu", {"fields": ("resume", "description", "conditions_admission", "debouches")}),
        ("Visuels", {"fields": ("image", "image_hero")}),
    )


@admin.register(Specialite)
class SpecialiteAdmin(admin.ModelAdmin):
    list_display = ("code", "nom", "filiere", "ordre")
    list_filter = ("filiere",)
