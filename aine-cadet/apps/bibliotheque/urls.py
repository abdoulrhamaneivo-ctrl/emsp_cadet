"""Routes bibliothèque numérique EMSP."""
from django.urls import path

from . import views

app_name = "bibliotheque"

urlpatterns = [
    path("", views.liste_ressources, name="liste"),
    path("<int:pk>/", views.detail_ressource, name="detail"),
    path("api/publiques.json", views.ressources_publiques_json, name="api_publiques"),
]
