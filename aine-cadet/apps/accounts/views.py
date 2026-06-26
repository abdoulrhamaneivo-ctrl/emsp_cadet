"""
Vues comptes — inscription, connexion, profils Ainé / Cadet.

Phase 1 CDC §3.1.
"""
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView, LogoutView
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect, render
from django.urls import reverse_lazy

from .forms import ConnexionForm, InscriptionForm, ProfilAineForm, ProfilCadetForm
from .models import User


class ConnexionView(LoginView):
    """Connexion sécurisée par email institutionnel."""

    template_name = "accounts/login.html"
    authentication_form = ConnexionForm
    redirect_authenticated_user = True


class DeconnexionView(LogoutView):
    """Déconnexion — retour à l'accueil Ainé & Cadet."""

    next_page = reverse_lazy("parrainage:accueil")


def inscription(request: HttpRequest) -> HttpResponse:
    """Inscription avec validation du domaine email (règle R4)."""
    if request.user.is_authenticated:
        return redirect("parrainage:dashboard")

    form = InscriptionForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        from apps.core.email import envoyer_bienvenue_inscription

        envoyer_bienvenue_inscription(user)
        login(request, user)
        from django.conf import settings

        messages.success(request, f"Bienvenue sur {settings.APP_NAME} !")
        messages.info(
            request,
            "Complétez votre profil pour profiter pleinement du parrainage.",
        )
        return redirect("accounts:profil")

    return render(request, "accounts/inscription.html", {"form": form})


@login_required
def profil(request: HttpRequest) -> HttpResponse:
    """Édition du profil selon le rôle (Cadet ou Ainé)."""
    utilisateur = request.user
    if utilisateur.est_parrain:
        form_class = ProfilAineForm
        template = "accounts/profil_aine.html"
    else:
        form_class = ProfilCadetForm
        template = "accounts/profil_cadet.html"

    form = form_class(request.POST or None, request.FILES or None, instance=utilisateur)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Profil mis à jour.")
        return redirect("parrainage:dashboard")

    return render(request, template, {"form": form, "utilisateur": utilisateur})


@login_required
def supprimer_compte(request: HttpRequest) -> HttpResponse:
    """
    Suppression du compte et des données personnelles (RGPD — Phase 4).

    Demande confirmation par mot de passe avant anonymisation/suppression.
    """
    if request.method == "POST":
        mot_de_passe = request.POST.get("password", "")
        if request.user.check_password(mot_de_passe):
            utilisateur = request.user
            from django.contrib.auth import logout

            logout(request)
            utilisateur.delete()
            messages.success(request, "Votre compte et vos données ont été supprimés.")
            return redirect("parrainage:accueil")
        messages.error(request, "Mot de passe incorrect. Suppression annulée.")

    return render(request, "accounts/supprimer_compte.html")
