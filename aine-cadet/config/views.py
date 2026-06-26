"""Vues transverses — erreurs HTTP."""
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def page_not_found(request: HttpRequest, exception=None) -> HttpResponse:
    """Page 404 Editorial pour l'application Ainé & Cadet."""
    return render(request, "404.html", status=404)
