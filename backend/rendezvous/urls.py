"""Routage RDV — `prochain/` AVANT `<int:pk>/` (premier match gagne, piège T3a)."""

from django.urls import path

from .views import (
    AnnulerView,
    ContrePropositionView,
    ProchainView,
    RappelVuView,
    RendezVousDetailView,
    RendezVousListView,
    RepondreView,
)

urlpatterns = [
    path("rendez-vous/", RendezVousListView.as_view()),
    path("rendez-vous/prochain/", ProchainView.as_view()),
    path("rendez-vous/<int:pk>/", RendezVousDetailView.as_view()),
    path("rendez-vous/<int:pk>/repondre/", RepondreView.as_view()),
    path("rendez-vous/<int:pk>/contre-proposition/", ContrePropositionView.as_view()),
    path("rendez-vous/<int:pk>/annuler/", AnnulerView.as_view()),
    path("rendez-vous/<int:pk>/rappel-vu/", RappelVuView.as_view()),
]
