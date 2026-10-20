"""JWT qui révoque immédiatement les accès après un changement de mot de passe."""

from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


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
