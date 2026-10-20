"""Configuration de production : Render, Neon et Cloudinary."""

import os
from urllib.parse import urlparse

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

if not (
    os.environ.get("CLOUDINARY_URL")
    or all(
        os.environ.get(cle)
        for cle in (
            "CLOUDINARY_CLOUD_NAME",
            "CLOUDINARY_API_KEY",
            "CLOUDINARY_API_SECRET",
        )
    )
):
    raise ImproperlyConfigured(
        "CLOUDINARY_URL (ou CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET) doit être configuré."
    )

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

CLOUDINARY_STORAGE = {"SECURE": True, "PREFIX": "emsp-connect"}

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
