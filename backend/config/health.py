"""Health check minimal pour Render, sans exposer de configuration sensible."""

from django.db import connection
from django.http import JsonResponse


def health_check(request):
    """Retourne 200 quand Django et la base Neon répondent."""
    try:
        connection.ensure_connection()
    except Exception:  # la réponse ne doit pas divulguer le détail d'une panne
        return JsonResponse({"status": "unavailable"}, status=503)
    return JsonResponse({"status": "ok"})
