"""Routage parrainage — contrat front docs 04/05 verbatim."""

from django.urls import path

from comptes.admin_views import (
    CarteEtudiantAdminView,
    StatsAdminView,
    TransitionApercuView,
    TransitionExecuterView,
    VerificationsEtudiantsView,
)

from .views import (
    AnnulerDemandeView,
    AvisParrainageView,
    ClotureParrainageView,
    DemandeParrainView,
    DemandesView,
    MonParrainageView,
    RepondreDemandeView,
)

urlpatterns = [
    path("me/parrainage/", MonParrainageView.as_view()),
    path("parrains/<int:parrain_id>/demande/", DemandeParrainView.as_view()),
    path("demandes/", DemandesView.as_view()),
    path("demandes/<int:demande_id>/repondre/", RepondreDemandeView.as_view()),
    path("demandes/<int:demande_id>/annuler/", AnnulerDemandeView.as_view()),
    path("parrainages/<int:parrainage_id>/cloture/", ClotureParrainageView.as_view()),
    path("parrainages/<int:parrainage_id>/avis/", AvisParrainageView.as_view()),
    path("admin/stats/", StatsAdminView.as_view()),
    path("admin/verifications-etudiants/", VerificationsEtudiantsView.as_view()),
    path(
        "admin/verifications-etudiants/<int:verification_id>/carte/",
        CarteEtudiantAdminView.as_view(),
    ),
    path("admin/transition-apercu/", TransitionApercuView.as_view()),
    path("admin/transition-executer/", TransitionExecuterView.as_view()),
]
