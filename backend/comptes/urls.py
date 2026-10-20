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
    CopilotView,
    MoiView,
    PhotoMoiView,
    PreferencesIAView,
    SupprimerCompteView,
    VisibiliteAnnuaireView,
)
from ia.faq_view import FAQView
from ia.offres_view import GenererOffreView
from ia.silence import detecter_binomes_silencieux  # noqa: F401 - used in admin_views
from .admin_views import BinomesSilencieuxView
from .auth_views import (
    ChangerMotDePasseView,
    DemanderReinitialisationView,
    InscriptionView,
    ReinitialiserMotDePasseView,
    RenvoyerConfirmationView,
    VerifierEmailView,
)
from .views import ConnexionView, DeconnexionView, RafraichirView, SessionView

urlpatterns = [
    path("auth/connexion/", ConnexionView.as_view()),
    path("auth/refresh/", RafraichirView.as_view()),
    path("auth/deconnexion/", DeconnexionView.as_view()),
    path("auth/session/", SessionView.as_view()),
    path("auth/inscription/", InscriptionView.as_view()),
    path("auth/verifier-email/", VerifierEmailView.as_view()),
    path("auth/renvoyer-confirmation/", RenvoyerConfirmationView.as_view()),
    path("auth/mot-de-passe-oublie/", DemanderReinitialisationView.as_view()),
    path("auth/reinitialiser-mot-de-passe/", ReinitialiserMotDePasseView.as_view()),
    path("auth/changer-mot-de-passe/", ChangerMotDePasseView.as_view()),
    path("me/", MoiView.as_view()),
    path("me/visibilite-annuaire/", VisibiliteAnnuaireView.as_view()),
    path("me/preferences-ia/", PreferencesIAView.as_view()),
    path("me/copilot/", CopilotView.as_view()),
    path("me/photo/", PhotoMoiView.as_view()),
    path("me/compte/", SupprimerCompteView.as_view()),
    path("me/groups-resume/", GroupsResumeView.as_view()),
    path("me/rendez-vous/", MesRendezVousView.as_view()),
    path("faq/", FAQView.as_view()),  # IA-4 public (AllowAny)
    path("admin/binomes-silencieux/", BinomesSilencieuxView.as_view()),  # IA-5 admin
    path("offres/generer/", GenererOffreView.as_view()),  # IA-6 alumni
    path("parrains/", ParrainsView.as_view()),
    path("parrains/suggestions/", SuggestionsView.as_view()),
    path("parrains/<int:parrain_id>/", ParrainDetailView.as_view()),
]
