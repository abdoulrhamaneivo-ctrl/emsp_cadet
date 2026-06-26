"""Vues publiques des filières EMSP."""
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, render

from .models import Filiere


def liste_filieres(request: HttpRequest) -> HttpResponse:
    """Catalogue des filières publiées."""
    filieres = Filiere.objects.filter(publie=True).prefetch_related("specialites")
    return render(request, "formations/liste.html", {"filieres": filieres})


def detail_filiere(request: HttpRequest, slug: str) -> HttpResponse:
    """Page détail d'une filière avec spécialités."""
    filiere = get_object_or_404(Filiere, slug=slug, publie=True)
    return render(
        request,
        "formations/detail.html",
        {"filiere": filiere, "specialites": filiere.specialites.all()},
    )
