"""Settings de développement local (doc 21) : SQLite, InMemory channel layer."""

import os

from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "dev-uniquement-ne-pas-utiliser-ailleurs",
)

# Le refresh cookie httpOnly en SameSite=Strict suppose même origine (proxy Vite).
# Path=/ : le cookie accompagne aussi la poignée de main WS (/ws/chat/), qui
# s'en sert comme identité de repli (le front ne pose pas de JWT en sessionStorage).
SIMPLE_JWT["REFRESH_TOKEN_COOKIE_SAMESITE"] = "Lax"  # noqa: F405
SIMPLE_JWT["REFRESH_TOKEN_COOKIE_PATH"] = "/"  # noqa: F405
