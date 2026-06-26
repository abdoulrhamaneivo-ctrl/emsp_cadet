"""Routes publiques filières (pages dynamiques Editorial)."""
from django.urls import path

from . import views

app_name = "formations"

urlpatterns = [
    path("", views.liste_filieres, name="liste"),
    path("<slug:slug>/", views.detail_filiere, name="detail"),
]
