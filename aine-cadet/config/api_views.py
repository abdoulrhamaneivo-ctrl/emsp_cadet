"""API publiques vitrine — contact et messages transverses."""
import json

from django.conf import settings
from django.core.cache import cache
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.core.email import (
    envoyer_contact_accuse_reception,
    envoyer_contact_admin,
    valider_adresse_email,
)


def _parse_json_body(request: HttpRequest) -> dict | None:
    try:
        data = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError, AttributeError):
        return None
    return data if isinstance(data, dict) else None


def _json_error(message: str, status: int = 400) -> JsonResponse:
    return JsonResponse({"ok": False, "error": message}, status=status)


def _contact_rate_limited(request: HttpRequest) -> bool:
    """Limite basique par IP — anti-spam formulaire contact public."""
    ip = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
    if not ip:
        ip = request.META.get("REMOTE_ADDR", "unknown")
    key = f"emsp:contact_rate:{ip}"
    limit = getattr(settings, "CONTACT_API_RATE_LIMIT", 10)
    window = getattr(settings, "CONTACT_API_RATE_WINDOW", 3600)
    count = cache.get(key, 0)
    if count >= limit:
        return True
    cache.set(key, count + 1, window)
    return False


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def contact_api(request: HttpRequest) -> JsonResponse:
    """Réception JSON du formulaire contact vitrine (CORS géré par django-cors-headers)."""
    if request.method == "OPTIONS":
        return JsonResponse({})

    if _contact_rate_limited(request):
        return _json_error(
            "Trop de messages envoyés récemment. Réessayez plus tard.",
            status=429,
        )

    data = _parse_json_body(request)
    if data is None:
        return _json_error("Corps JSON invalide.")

    # Honeypot anti-spam — réponse neutre pour ne pas aider les bots
    if data.get("_gotcha"):
        return JsonResponse({"ok": True, "message": "Votre message a bien été envoyé."})

    nom = (data.get("nom") or "").strip()
    email = (data.get("email") or "").strip()
    objet = (data.get("objet") or "").strip()
    message = (data.get("message") or "").strip()

    if not nom or not email or not message:
        return _json_error("Nom, e-mail et message sont obligatoires.")

    if not valider_adresse_email(email):
        return _json_error("Adresse e-mail invalide.")

    envoyer_contact_admin(nom=nom, email=email, objet=objet, message=message)
    envoyer_contact_accuse_reception(nom=nom, email=email, objet=objet)

    return JsonResponse(
        {
            "ok": True,
            "message": "Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.",
        }
    )
