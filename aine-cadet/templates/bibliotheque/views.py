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
