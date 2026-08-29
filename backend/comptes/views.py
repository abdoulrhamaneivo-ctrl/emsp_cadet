"""Auth JWT — access en réponse, refresh en cookie httpOnly (doc 21 §6.2, doc 19 §5.1)."""

from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from .serializers import JetonConnexionSerializer


def _parametres_cookie():
    cookie = settings.SIMPLE_JWT_REFRESH_COOKIE
    return {
        "key": cookie,
        "httponly": True,
        "secure": not settings.DEBUG,
        "samesite": settings.SIMPLE_JWT.get("REFRESH_TOKEN_COOKIE_SAMESITE", "Strict"),
        "path": settings.SIMPLE_JWT.get("REFRESH_TOKEN_COOKIE_PATH", "/api/auth/"),
    }


class ConnexionView(APIView):
    """POST /api/auth/connexion/ {email, password} → {access} + cookie httpOnly.

    Le refresh ne traverse JAMAIS le JS (doc 19 §5.1) — seul `access` est renvoyé.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        # JetonConnexionSerializer : message d'échec 401 francisé (doc 02 §5).
        serializer = JetonConnexionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response = Response({"access": serializer.validated_data["access"]})
        response.set_cookie(
            value=serializer.validated_data["refresh"],
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
            **_parametres_cookie(),
        )
        return response


class RafraichirView(APIView):
    """POST /api/auth/refresh/ — lit le cookie (pas de corps), renvoie un access.

    Rotation activée : l'ancien refresh est blacklisté, le nouveau repose en cookie.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        token = request.COOKIES.get(settings.SIMPLE_JWT_REFRESH_COOKIE)
        if not token:
            return Response({"detail": "Refresh absent."}, status=401)
        try:
            serializer = TokenRefreshSerializer(data={"refresh": token})
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response({"detail": "Refresh invalide ou révoqué."}, status=401)
        response = Response({"access": serializer.validated_data["access"]})
        nouveau_refresh = serializer.validated_data.get("refresh")
        if nouveau_refresh:
            response.set_cookie(
                value=nouveau_refresh,
                max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                **_parametres_cookie(),
            )
        return response


class DeconnexionView(APIView):
    """POST /api/auth/deconnexion/ — révoque le refresh (blacklist) + purge le cookie."""

    permission_classes = [AllowAny]

    def post(self, request):
        token = request.COOKIES.get(settings.SIMPLE_JWT_REFRESH_COOKIE)
        if token:
            try:
                from rest_framework_simplejwt.tokens import RefreshToken

                RefreshToken(token).blacklist()
            except TokenError:
                pass  # déjà révoqué/expiré — la déconnexion reste un succès
        response = Response({"ok": True})
        response.delete_cookie(settings.SIMPLE_JWT_REFRESH_COOKIE, path="/api/auth/")
        return response


class SessionView(APIView):
    """GET /api/auth/session/ — contrat front T0 : {estAuthentifie, utilisateur}.

    AllowAny : un invité reçoit {estAuthentifie: false} (200) plutôt qu'un 401,
    c'est le hook de résolution de session de AuthProvider (shared/api/auth.js).
    """

    permission_classes = [AllowAny]

    def get(self, request):
        from comptes.serializers import UtilisateurLegereSerializer

        if not request.user.is_authenticated:
            return Response({"estAuthentifie": False, "utilisateur": None})
        return Response(
            {
                "estAuthentifie": True,
                "utilisateur": UtilisateurLegereSerializer(request.user).data,
            }
        )
