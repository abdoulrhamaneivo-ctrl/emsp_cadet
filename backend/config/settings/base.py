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
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": __import__("datetime").timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": __import__("datetime").timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# Refresh token : cookie httpOnly uniquement (jamais exposé au JS, doc 19 §5.1).
SIMPLE_JWT_REFRESH_COOKIE = "refresh_token"

CORS_ALLOWED_ORIGINS = [os.environ.get("FRONT_ORIGIN", "http://localhost:5200")]
CORS_ALLOW_CREDENTIALS = True

# ── Channels ──────────────────────────────────────────────────────────────────
# Dev : InMemoryChannelLayer (mono-process). Prod : channels-redis via env.
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}
