"""
Configuration Django — projet Ainé & Cadet.

Référence : docs/CAHIER_DES_CHARGES.md
"""
import os
from pathlib import Path

from dotenv import load_dotenv

# Racine du projet Django (dossier aine-cadet/)
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# --- Identité application ---
APP_NAME = "Ainé & Cadet"
APP_SLUG = "aine-cadet"

SECRET_KEY = os.getenv("SECRET_KEY", "dev-insecure-change-in-production")
DEBUG = os.getenv("DEBUG", "True").lower() in ("1", "true", "yes")
ALLOWED_HOSTS = [h.strip() for h in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,testserver").split(",") if h.strip()]

# --- Règles métier (CDC §4) ---
PARRAIN_MAX_FILLEULS = int(os.getenv("PARRAIN_MAX_FILLEULS", "5"))
SCHOOL_EMAIL_DOMAIN = os.getenv("SCHOOL_EMAIL_DOMAIN", "emsp.int")
EMSP_VITRINE_URL = os.getenv("EMSP_VITRINE_URL", "http://localhost:8080")
AINE_CADET_PUBLIC_URL = os.getenv("AINE_CADET_PUBLIC_URL", "http://127.0.0.1:8000")

# Assets Editorial (template HTML5 UP partagé avec la vitrine)
EDITORIAL_ASSETS = BASE_DIR.parent / "html5up-editorial" / "assets"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    # Applications métier Ainé & Cadet
    "apps.accounts",
    "apps.parrainage.apps.ParrainageConfig",
    "apps.concours.apps.ConcoursConfig",
    "apps.formations.apps.FormationsConfig",
    "apps.bibliotheque.apps.BibliothequeConfig",
]

# Brevo (ex-Sendinblue) — e-mails transactionnels via API
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "").strip()
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "EMSP / Ainé & Cadet")
if BREVO_API_KEY:
    INSTALLED_APPS.append("anymail")

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
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
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "config.context_processors.app_branding",
                "config.context_processors.notifications",
                "config.context_processors.concours_session",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# SQLite en dev ; MySQL ou PostgreSQL via variables d'environnement
_database_url = os.getenv("DATABASE_URL", "")
if _database_url.startswith("postgres"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "aine_cadet"),
            "USER": os.getenv("DB_USER", "postgres"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }
elif _database_url.startswith("mysql://"):
    import urllib.parse
    urllib.parse.uses_netloc.append("mysql")
    url = urllib.parse.urlparse(_database_url)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": url.path[1:],
            "USER": url.username,
            "PASSWORD": url.password,
            "HOST": url.hostname or "localhost",
            "PORT": url.port or "3306",
            "OPTIONS": {
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
                "charset": "utf8mb4",
            }
        }
    }
elif os.getenv("DB_ENGINE") == "mysql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": os.getenv("DB_NAME", "emspconnect"),
            "USER": os.getenv("DB_USER", "root"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "127.0.0.1"),
            "PORT": os.getenv("DB_PORT", "3306"),
            "OPTIONS": {
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
                "charset": "utf8mb4",
            }
        }
    }
    # XAMPP / MariaDB 10.4 : Django 5 exige 10.5+ — contournement dev local uniquement
    if os.getenv("MYSQL_ALLOW_LEGACY", "").lower() in ("1", "true", "yes"):
        from django.db.backends.mysql.base import DatabaseWrapper
        from django.db.backends.mysql.features import DatabaseFeatures

        DatabaseWrapper.check_database_version_supported = lambda self: None
        # MariaDB 10.4 ne supporte pas INSERT ... RETURNING
        DatabaseFeatures.can_return_columns_from_insert = property(lambda self: False)
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Modèle utilisateur custom (rôles Cadet / Ainé / admin)
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Abidjan"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [
    BASE_DIR / "static",
    EDITORIAL_ASSETS,
]
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Email / notifications Phase 2 ---
_default_from_raw = os.getenv("DEFAULT_FROM_EMAIL", "noreply@emsp.int").strip()
if "<" not in _default_from_raw and "@" in _default_from_raw:
    DEFAULT_FROM_EMAIL = f"{BREVO_SENDER_NAME} <{_default_from_raw}>"
else:
    DEFAULT_FROM_EMAIL = _default_from_raw

CONTACT_API_EMAIL = os.getenv("CONTACT_API_EMAIL", "contact@emsp.int")
CONCOURS_PREINSCRIPTION_EMAIL = os.getenv("CONCOURS_PREINSCRIPTION_EMAIL", "admissions@emsp.int")
NOTIFY_EMAIL_ON_MESSAGE = os.getenv("NOTIFY_EMAIL_ON_MESSAGE", "True").lower() in ("1", "true", "yes")
NOTIFY_EMAIL_ON_DEMANDE = os.getenv("NOTIFY_EMAIL_ON_DEMANDE", "True").lower() in ("1", "true", "yes")
CONTACT_API_RATE_LIMIT = int(os.getenv("CONTACT_API_RATE_LIMIT", "10"))
CONTACT_API_RATE_WINDOW = int(os.getenv("CONTACT_API_RATE_WINDOW", "3600"))

_email_backend_override = os.getenv("EMAIL_BACKEND", "").strip()
if _email_backend_override:
    EMAIL_BACKEND = _email_backend_override
elif BREVO_API_KEY:
    EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"
    ANYMAIL = {
        "BREVO_API_KEY": BREVO_API_KEY,
    }
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

LOGIN_URL = "accounts:login"
LOGIN_REDIRECT_URL = "parrainage:dashboard"
LOGOUT_REDIRECT_URL = "parrainage:accueil"

# SMTP alternatif (si EMAIL_BACKEND=smtp — hors Brevo API)
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() in ("1", "true", "yes")

# Pages d'erreur personnalisées
handler404 = "config.views.page_not_found"

# CORS — vitrine statique (localhost:8080) → API Django
_vitrine_origins = [
    EMSP_VITRINE_URL.rstrip("/"),
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://www.emsp.int",
    "https://emsp.int",
]
CORS_ALLOWED_ORIGINS = list(dict.fromkeys(o for o in _vitrine_origins if o))
CORS_ALLOW_METHODS = ["GET", "POST", "OPTIONS"]
CORS_ALLOW_HEADERS = ["content-type", "accept"]

# Monkey-patch store_rendered_templates pour contourner le bug de copie de contexte sous Python 3.14 / Django 5.x
import sys
if 'test' in sys.argv:
    try:
        from django.test import client
        client.store_rendered_templates = lambda *args, **kwargs: None
    except Exception:
        pass

