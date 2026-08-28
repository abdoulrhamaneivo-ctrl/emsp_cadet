"""Routage Fil — routes littérales AVANT `<int:pk>/` (piège T3a : premier match)."""

from django.urls import path

from .views import (
    CommentaireDetailView,
    CommentairesView,
    PublicationDetailView,
    PublicationsView,
    QuestionsRestantesView,
    ReactionsView,
    SignalementsView,
)

urlpatterns = [
    path("publications/", PublicationsView.as_view()),
    path("publications/questions-restantes/", QuestionsRestantesView.as_view()),
    path("publications/<int:pk>/", PublicationDetailView.as_view()),
    path("publications/<int:pk>/reactions/", ReactionsView.as_view()),
    path("publications/<int:pk>/commentaires/", CommentairesView.as_view()),
    path("commentaires/<int:pk>/", CommentaireDetailView.as_view()),
    path("signalements/", SignalementsView.as_view()),
]
