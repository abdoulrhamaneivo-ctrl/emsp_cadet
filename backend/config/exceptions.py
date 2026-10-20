"""Exceptions partagées — codes HTTP du contrat doc 21 §3 (422 / 409)."""

from rest_framework.exceptions import APIException


class ErreurValidation(APIException):
    """Payload invalide au sens métier — le contrat attend 422 (pas 400)."""

    status_code = 422
    default_detail = "Requête invalide."
    default_code = "validation"


class ErreurConflit(APIException):
    """Règle déjà satisfaite (avis en double, binôme existant…) — 409."""

    status_code = 409
    default_detail = "Conflit."
    default_code = "conflit"


class ErreurIndisponible(APIException):
    """Dépendance externe temporairement indisponible (Cloudinary, e-mail…)."""

    status_code = 503
    default_detail = "Service temporairement indisponible."
    default_code = "indisponible"
