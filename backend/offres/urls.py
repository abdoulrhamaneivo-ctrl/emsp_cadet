from django.urls import path

from .views import CandidaterView, CandidaturesOffreView, OffreDetailView, OffresView

urlpatterns = [
    path("offres/", OffresView.as_view(), name="offres"),
    path("offres/<int:pk>/", OffreDetailView.as_view(), name="offre-detail"),
    path(
        "offres/<int:pk>/candidatures/", CandidaturesOffreView.as_view(), name="offre-candidatures"
    ),
    path("offres/<int:pk>/candidater/", CandidaterView.as_view(), name="offre-candidater"),
]
