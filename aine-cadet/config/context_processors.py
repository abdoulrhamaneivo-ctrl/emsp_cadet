"""Variables globales injectées dans tous les templates."""
from django.conf import settings


def app_branding(request):
    """Nom et slug de l'application Ainé & Cadet."""
    return {
        "APP_NAME": settings.APP_NAME,
        "APP_SLUG": settings.APP_SLUG,
        "EMSP_VITRINE_URL": settings.EMSP_VITRINE_URL,
        "SCHOOL_EMAIL_DOMAIN": settings.SCHOOL_EMAIL_DOMAIN,
    }


def notifications(request):
    """Compteur messages non lus pour la sidebar (Phase 2)."""
    if not request.user.is_authenticated:
        return {"messages_non_lus": 0}
    from apps.parrainage.services import compter_non_lus

    return {"messages_non_lus": compter_non_lus(request.user)}


def concours_session(request):
    """Session concours active — affichage formulaire et en-têtes."""
    from apps.concours.models import AnneeConcours

    session = AnneeConcours.objects.filter(active=True).first()
    return {"concours_session": session}
