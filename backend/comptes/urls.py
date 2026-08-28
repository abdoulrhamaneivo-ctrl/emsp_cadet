"""Routage comptes (auth + profil)."""

from django.urls import path

from .views import ConnexionView, DeconnexionView, MoiView, RafraichirView, SessionView

urlpatterns = [
    path("auth/connexion/", ConnexionView.as_view()),
    path("auth/refresh/", RafraichirView.as_view()),
    path("auth/deconnexion/", DeconnexionView.as_view()),
    path("auth/session/", SessionView.as_view()),
    path("auth/me/", MoiView.as_view()),
]
