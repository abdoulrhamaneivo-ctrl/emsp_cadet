"""Vues bibliothèque numérique — accès réservé aux utilisateurs connectés."""
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render

from .models import RessourceDocument, MediaBibliotheque


def _ressources_publiees():
    """Ressources visibles dans l'espace authentifié."""
    return RessourceDocument.objects.filter(publie=True)


@login_required
def liste_ressources(request: HttpRequest) -> HttpResponse:
    """Catalogue complet — Cadet, Ainé et administrateurs."""
    ressources = _ressources_publiees()
    publiques = ressources.filter(reserve_etudiants=False)
    reservees = ressources.filter(reserve_etudiants=True)
    medias = MediaBibliotheque.objects.filter(publie=True)
    return render(
        request,
        "bibliotheque/liste.html",
        {
            "ressources": ressources, 
            "publiques": publiques, 
            "reservees": reservees,
            "medias": medias,
        },
    )



@login_required
def detail_ressource(request: HttpRequest, pk: int) -> HttpResponse:
    """Fiche document avec lien de téléchargement."""
    ressource = get_object_or_404(RessourceDocument, pk=pk, publie=True)
    return render(request, "bibliotheque/detail.html", {"ressource": ressource})


def ressources_publiques_json(request: HttpRequest) -> JsonResponse:
    """API publique pour la vitrine médiathèque (ressources non réservées)."""
    items = [
        {
            "titre": r.titre,
            "categorie": r.get_categorie_display(),
            "resume": r.resume,
            "url": r.url_telechargement,
        }
        for r in RessourceDocument.objects.filter(publie=True, reserve_etudiants=False)
    ]
    return JsonResponse({"ressources": items})
