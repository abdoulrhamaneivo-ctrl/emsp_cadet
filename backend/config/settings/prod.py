"""Configuration de production : Render, Neon et Cloudinary."""

import os
from urllib.parse import unquote, urlparse

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403

DEBUG = False
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp-relay.brevo.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "true").lower() in {"1", "true", "yes"}
EMAIL_TIMEOUT = int(os.environ.get("EMAIL_TIMEOUT", "10"))
BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "")
BREVO_TRANSPORT = os.environ.get("BREVO_TRANSPORT", "api")
EMAIL_HOST_USER = os.environ.get("BREVO_SMTP_LOGIN", "")
EMAIL_HOST_PASSWORD = os.environ.get("BREVO_SMTP_KEY", "")
DEFAULT_FROM_EMAIL = os.environ.get("BREVO_FROM_EMAIL", "")

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "")
if not SECRET_KEY:
    raise ImproperlyConfigured("DJANGO_SECRET_KEY doit être défini en production.")

FRONT_ORIGIN = os.environ.get("FRONT_ORIGIN", "").strip().rstrip("/")
if not FRONT_ORIGIN:
    raise ImproperlyConfigured("FRONT_ORIGIN doit être l'URL HTTPS du front Vercel.")

RENDER_HOST = os.environ.get("RENDER_EXTERNAL_HOSTNAME", "emsp-connect-api.onrender.com")
FRONT_HOST = urlparse(FRONT_ORIGIN).hostname
ALLOWED_HOSTS = list(dict.fromkeys(filter(None, [RENDER_HOST, FRONT_HOST])))

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    raise ImproperlyConfigured("DATABASE_URL doit pointer vers PostgreSQL Neon.")
DATABASES = {"default": dj_database_url.parse(DATABASE_URL, conn_max_age=600, ssl_require=True)}

cloudinary_cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME", "").strip()
cloudinary_api_key = os.environ.get("CLOUDINARY_API_KEY", "").strip()
cloudinary_api_secret = os.environ.get("CLOUDINARY_API_SECRET", "").strip()
cloudinary_url = os.environ.get("CLOUDINARY_URL", "").strip()

if all((cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret)):
    cloudinary_credentials = (
        cloudinary_cloud_name,
        cloudinary_api_key,
        cloudinary_api_secret,
    )
elif cloudinary_url:
    parsed_cloudinary_url = urlparse(cloudinary_url)
    cloudinary_credentials = (
        parsed_cloudinary_url.hostname,
        unquote(parsed_cloudinary_url.username or ""),
        unquote(parsed_cloudinary_url.password or ""),
    )
    if (
        parsed_cloudinary_url.scheme != "cloudinary"
        or not all(cloudinary_credentials)
    ):
        raise ImproperlyConfigured(
            "CLOUDINARY_URL doit contenir un nom de cloud, une clé et un secret valides."
        )
else:
    raise ImproperlyConfigured(
        "CLOUDINARY_URL (ou CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET) doit être configuré."
    )

# Cloudinary Python donne la priorité à CLOUDINARY_CLOUD_NAME sur
# CLOUDINARY_URL. Si Render contient des variables individuelles incomplètes,
# cela masque alors le secret présent dans l'URL. En résolvant les identifiants
# ici puis en les fournissant explicitement aux deux intégrations Django, on
# évite cette configuration partielle tout en gardant les secrets hors du code.
CLOUDINARY = {
    "cloud_name": cloudinary_credentials[0],
    "api_key": cloudinary_credentials[1],
    "api_secret": cloudinary_credentials[2],
    "secure": True,
}
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": cloudinary_credentials[0],
    "API_KEY": cloudinary_credentials[1],
    "API_SECRET": cloudinary_credentials[2],
    "SECURE": True,
    "PREFIX": "emsp-connect",
}

INSTALLED_APPS = [
    *INSTALLED_APPS,
    "cloudinary_storage",
    "cloudinary",
]

MIDDLEWARE = [
    "whitenoise.middleware.WhiteNoiseMiddleware",
    *MIDDLEWARE,
]

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    # Pour les futurs FileField de documents (PDF, etc.), définir explicitement
    # storage=storages["raw_media"] dans le modèle concerné.
    "raw_media": {
        "BACKEND": "cloudinary_storage.storage.RawMediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

CORS_ALLOWED_ORIGINS = [FRONT_ORIGIN]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [FRONT_ORIGIN]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Le proxy Vercel et le navigateur gardent la même origine pour /api, donc le
# cookie refresh reste host-only, httpOnly, Secure et SameSite=Lax.
SIMPLE_JWT["REFRESH_TOKEN_COOKIE_PATH"] = "/"
SIMPLE_JWT["REFRESH_TOKEN_COOKIE_SAMESITE"] = "Lax"

# Une instance Render Free : le channel layer mémoire convient au lancement.
# Il faudra passer à Redis avant de lancer plusieurs instances backend.
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}
