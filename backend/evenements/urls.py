"""Routage Événements — routes littérales AVANT `<int:pk>/` (piège T3a)."""

from django.urls import path

from .views import (
    EvenementDetailView,
    EvenementMessagesView,
    EvenementParticipantsView,
    EvenementPatchView,
    EvenementsView,
    InscriptionView,
)

urlpatterns = [
    path("evenements/", EvenementsView.as_view()),
    path("evenements/<int:pk>/", EvenementDetailView.as_view()),
    path("evenements/<int:pk>/inscription/", InscriptionView.as_view()),
    path("evenements/<int:pk>/messages/", EvenementMessagesView.as_view()),
    path("evenements/<int:pk>/participants/", EvenementParticipantsView.as_view()),
    path("evenements/<int:pk>/modifier/", EvenementPatchView.as_view()),
]
