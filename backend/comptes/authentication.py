"""JWT qui révoque immédiatement les accès après un changement de mot de passe."""

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


class IgnorerBearerOptionnelAuthentication(BaseAuthentication):
    """Ignore l'ancien bearer sur les routes publiques et garde le statut 401.

    Ces endpoints authentifient leur requête avec un cookie httpOnly, un lien
    signé ou les identifiants du formulaire. Un header Bearer expiré ou d'un
    autre type ne doit pas bloquer leur traitement.
    """

    def authenticate(self, request):
        return None

    def authenticate_header(self, request):
        return "Bearer"


class PasswordChangeJWTAuthentication(JWTAuthentication):
    """Les anciens jetons restent compatibles jusqu'au prochain changement."""

    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        version_jeton = validated_token.get("password_version", 0)
        if version_jeton != user.password_version:
            raise AuthenticationFailed(
                "Cette session a expiré après le changement du mot de passe.",
                code="password_changed",
            )
        return user
