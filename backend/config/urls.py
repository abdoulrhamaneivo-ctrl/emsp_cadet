"""Racine des URLs — tout l'API vit sous /api/ (contrat doc 21 §3)."""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("comptes.urls")),
    path("api/", include("messagerie.urls")),
    path("api/", include("rendezvous.urls")),
    path("api/", include("fil.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]
