"""Permissions transverses — le backend revalide TOUT (doc 19 §5.6)."""

from rest_framework.exceptions import APIException
from rest_framework.permissions import BasePermission


class CompteSuspendu(APIException):
    """RG11 : le front intercepte 423 → purge auth + /compte-suspendu (doc 19 §4.1).

    Levée par la permission (et pas un middleware) : l'auth DRF tourne DANS la
    vue, un process_view ne verrait qu'un AnonymousUser.
    """

    status_code = 423
    default_detail = "Compte suspendu."
    default_code = "compte_suspendu"


class EstActif(BasePermission):
    """Compte authentifié ; s'il est suspendu → 423 {motif, fin}."""

    def has_permission(self, request, view):
        user = request.user
        if user is None or not user.is_authenticated:
            return False
        if user.est_suspendu:
            raise CompteSuspendu({"motif": "suspendu", "fin": user.fin_suspension})
        return True
