"""Routes comptes — connexion, inscription, profil, mot de passe oublié, RGPD."""
from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("login/", views.ConnexionView.as_view(), name="login"),
    path("logout/", views.DeconnexionView.as_view(), name="logout"),
    path("inscription/", views.inscription, name="inscription"),
    path("profil/", views.profil, name="profil"),
    path("supprimer-compte/", views.supprimer_compte, name="supprimer_compte"),
    # Réinitialisation mot de passe
    path(
        "mot-de-passe-oublie/",
        auth_views.PasswordResetView.as_view(
            template_name="accounts/password_reset.html",
            email_template_name="accounts/password_reset_email.txt",
            subject_template_name="accounts/password_reset_subject.txt",
            success_url="/accounts/mot-de-passe-envoye/",
        ),
        name="password_reset",
    ),
    path(
        "mot-de-passe-envoye/",
        auth_views.PasswordResetDoneView.as_view(template_name="accounts/password_reset_done.html"),
        name="password_reset_done",
    ),
    path(
        "reinitialiser/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="accounts/password_reset_confirm.html",
            success_url="/accounts/mot-de-passe-reinitialise/",
        ),
        name="password_reset_confirm",
    ),
    path(
        "mot-de-passe-reinitialise/",
        auth_views.PasswordResetCompleteView.as_view(template_name="accounts/password_reset_complete.html"),
        name="password_reset_complete",
    ),
]
