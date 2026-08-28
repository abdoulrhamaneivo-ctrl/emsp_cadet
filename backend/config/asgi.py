"""
Configuration ASGI — HTTP (Django) + WebSocket (Channels).

Dév : `uv run manage.py runserver` sert l'ASGI via channels (runserver est
remplacé). En prod : daphne/uvicorn pointe sur cette application.
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

django_asgi_app = get_asgi_application()

from messagerie import routing  # noqa: E402  (après get_asgi_application)

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(routing.websocket_urlpatterns))
        ),
    }
)
