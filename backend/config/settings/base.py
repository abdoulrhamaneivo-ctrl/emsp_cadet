"""Settings communs dev/produit — EMSP Connect backend (doc 21 §2, §6)."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

# Confidentialité : les valeurs par défaut ne servent qu'au dev local (doc 21 §6).
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-uniquement-pas-secret")
DEBUG = False
ALLOWED_HOSTS: list[str] = []

DJANGO_APPS = [
    "daphne",  # runserver ASGI (Channels) — doit précéder staticfiles
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "channels",
    "drf_spectacular",
]

LOCAL_APPS = [
    "comptes",
    "messagerie",
    "rendezvous",
    "fil",
    "evenements",
    "parrainage",
    "ia",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ASGI_APPLICATION = "config.asgi.application"
WSGI_APPLICATION = "config.wsgi.application"

# SQLite en dev (doc 21 §2) ; Postgres au déploiement via env DATABASE_URL.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_USER_MODEL = "comptes.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

TIME_ZONE = "Africa/Abidjan"
USE_I18N = True
USE_TZ = True

LANGUAGE_CODE = "fr"
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── DRF / JWT (doc 21 §6) ─────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "comptes.permissions.EstActif",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "TOKEN_OBTAIN_SERIALIZER": "comptes.serializers.JetonConnexionSerializer",
    "DEFAULT_THROTTLE_RATES": {"auth_email": "8/hour", "auth_password": "12/hour"},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": __import__("datetime").timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": __import__("datetime").timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    # Clés lues par comptes.views._parametres_cookie() — le cookie doit
    # couvrir TOUT le site (le front le renvoie same-origin via le proxy).
    "REFRESH_TOKEN_COOKIE_PATH": "/",
    "REFRESH_TOKEN_COOKIE_SAMESITE": "Lax",
}

# Refresh token : cookie httpOnly uniquement (jamais exposé au JS, doc 19 §5.1).
SIMPLE_JWT_REFRESH_COOKIE = "refresh_token"

CORS_ALLOWED_ORIGINS = [os.environ.get("FRONT_ORIGIN", "http://localhost:5200")]
CORS_ALLOW_CREDENTIALS = True
FRONT_ORIGIN = os.environ.get("FRONT_ORIGIN", "http://localhost:5200").rstrip("/")

# Les messages partent par la console en développement et via le relais SMTP
# Brevo en production. Aucun identifiant n'est enregistré dans le dépôt.
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend"
)
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp-relay.brevo.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "true").lower() in {"1", "true", "yes"}
EMAIL_TIMEOUT = int(os.environ.get("EMAIL_TIMEOUT", "10"))
BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "")
BREVO_TRANSPORT = os.environ.get("BREVO_TRANSPORT", "smtp")
EMAIL_HOST_USER = os.environ.get("BREVO_SMTP_LOGIN", "")
EMAIL_HOST_PASSWORD = os.environ.get("BREVO_SMTP_KEY", "")
DEFAULT_FROM_EMAIL = os.environ.get("BREVO_FROM_EMAIL", "")
PASSWORD_RESET_TIMEOUT = 60 * 60

# ── Channels ──────────────────────────────────────────────────────────────────
# Dev : InMemoryChannelLayer (mono-process). Prod : channels-redis via env.
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}
