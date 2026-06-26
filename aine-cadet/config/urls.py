"""Routage URL racine — Ainé & Cadet."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from config import api_views

admin.site.site_header = "Ainé & Cadet — Administration EMSP"
admin.site.site_title = "Ainé & Cadet"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/contact/", api_views.contact_api, name="api_contact"),
    path("accounts/", include("apps.accounts.urls")),
    path("concours/", include("apps.concours.urls")),
    path("formations/", include("apps.formations.urls")),
    path("bibliotheque/", include("apps.bibliotheque.urls")),
    path("", include("apps.parrainage.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
