"""Routage comptes (auth + profil)."""

from django.urls import path

from .annuaire_views import (
    GroupsResumeView,
    MesRendezVousView,
    ParrainDetailView,
    ParrainsView,
    SuggestionsView,
)
from .profil_views import (
    MoiView,
    PhotoMoiView,
    SupprimerCompteView,
    VisibiliteAnnuaireView,
)
from .views import ConnexionView, DeconnexionView, RafraichirView, SessionView

urlpatterns = [
    path("auth/connexion/", ConnexionView.as_view()),
    path("auth/refresh/", RafraichirView.as_view()),
    path("auth/deconnexion/", DeconnexionView.as_view()),
    path("auth/session/", SessionView.as_view()),
    path("me/", MoiView.as_view()),
    path("me/visibilite-annuaire/", VisibiliteAnnuaireView.as_view()),
    path("me/photo/", PhotoMoiView.as_view()),
    path("me/compte/", SupprimerCompteView.as_view()),
    path("me/groups-resume/", GroupsResumeView.as_view()),
    path("me/rendez-vous/", MesRendezVousView.as_view()),
    path("parrains/", ParrainsView.as_view()),
    path("parrains/suggestions/", SuggestionsView.as_view()),
    path("parrains/<int:parrain_id>/", ParrainDetailView.as_view()),
]
