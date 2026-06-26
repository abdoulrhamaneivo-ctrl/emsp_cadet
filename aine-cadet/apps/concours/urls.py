"""Routes concours d'entrée EMSP."""
from django.urls import path

from . import views

app_name = "concours"

urlpatterns = [
    path("inscription/", views.inscription, name="inscription"),
    path("preinscription.json", views.preinscription_json, name="preinscription_json"),
    path("session-active.json", views.session_active_json, name="session_active"),
    path("admin/inscriptions/", views.dashboard_inscriptions, name="dashboard_inscriptions"),
]
