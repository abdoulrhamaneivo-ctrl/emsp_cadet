"""Routes parrainage — Phases 1–3 Ainé & Cadet."""
from django.urls import path

from . import views

app_name = "parrainage"

urlpatterns = [
    path("", views.accueil, name="accueil"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("annuaire/", views.annuaire, name="annuaire"),
    path("aines/<int:pk>/", views.detail_aine, name="detail_aine"),
    path("demande/<int:parrain_id>/", views.demande_creer, name="demande_creer"),
    path("demande/<int:pk>/<str:action>/", views.demande_repondre, name="demande_repondre"),
    # Phase 2 — Communication
    path("parrainage/<int:pk>/messages/", views.messages_fil, name="messages"),
    path(
        "parrainage/<int:pk>/messages/marquer-lu/",
        views.messages_marquer_lu,
        name="messages_marquer_lu",
    ),
    path("parrainage/<int:pk>/rdv/proposer/", views.rdv_proposer, name="rdv_proposer"),
    path(
        "parrainage/<int:pk>/rdv/<int:rdv_id>/<str:action>/",
        views.rdv_repondre,
        name="rdv_repondre",
    ),
    # Phase 3 — Communauté et qualité
    path("parrainage/<int:pk>/terminer/", views.parrainage_terminer, name="parrainage_terminer"),
    path("parrainage/<int:pk>/avis/", views.avis_creer, name="avis_creer"),
    path("evenements/", views.evenements_liste, name="evenements_liste"),
    path("evenements/creer/", views.evenement_creer, name="evenement_creer"),
    path("evenements/<int:pk>/", views.evenement_detail, name="evenement_detail"),
    path("evenements/<int:pk>/inscrire/", views.evenement_inscrire, name="evenement_inscrire"),
    path("archives/", views.archives, name="archives"),
]
