"""Inscription et courriels de compte : confirmation, reset et changement."""

import json
import logging
from email.utils import parseaddr
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core import signing
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.utils.crypto import constant_time_compare
from django.utils.encoding import force_str
from django.utils.html import escape
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import User
from .permissions import EstActif
from .serializers import InscriptionSerializer

logger = logging.getLogger(__name__)
EMAIL_VERIFICATION_SALT = "comptes.email-verification.v1"
EMAIL_VERIFICATION_TTL = 60 * 60 * 48


class CourrielIndisponible(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "L'envoi des e-mails n'est pas encore configuré. Réessaie plus tard."
    default_code = "email_indisponible"


def _exiger_configuration_courriel():
    if settings.EMAIL_BACKEND.endswith("console.EmailBackend"):
        return
    if settings.BREVO_TRANSPORT == "api":
        api_configure = bool(settings.BREVO_API_KEY and settings.DEFAULT_FROM_EMAIL)
        if not api_configure:
            raise CourrielIndisponible()
        return
    smtp_configure = bool(
        settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD and settings.DEFAULT_FROM_EMAIL
    )
    if settings.BREVO_TRANSPORT != "smtp" or not smtp_configure:
        raise CourrielIndisponible()


def _envoyer(destinataire, sujet, texte, html):
    _exiger_configuration_courriel()
    if (
        settings.BREVO_TRANSPORT == "api"
        and not settings.EMAIL_BACKEND.endswith("console.EmailBackend")
    ):
        api_key = settings.BREVO_API_KEY
        nom_expediteur, adresse_expediteur = parseaddr(settings.DEFAULT_FROM_EMAIL)
        if not adresse_expediteur:
            adresse_expediteur = settings.DEFAULT_FROM_EMAIL
        payload = json.dumps(
            {
                "sender": {
                    "email": adresse_expediteur,
                    "name": nom_expediteur or "EMSP Connect",
                },
                "to": [{"email": destinataire}],
                "subject": sujet,
                "htmlContent": html,
            }
        ).encode("utf-8")
        request = Request(
            "https://api.brevo.com/v3/smtp/email",
            data=payload,
            headers={
                "accept": "application/json",
                "api-key": api_key,
                "content-type": "application/json",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=10) as response:
                if not 200 <= response.status < 300:
                    raise CourrielIndisponible()
            return
        except CourrielIndisponible:
            raise
        except HTTPError as exc:
            logger.error("Brevo API a refusé un courriel de compte (HTTP %s)", exc.code)
            raise CourrielIndisponible() from exc
        except Exception as exc:
            logger.exception("Échec de livraison d'un courriel de compte via l'API Brevo")
            raise CourrielIndisponible() from exc

    message = EmailMultiAlternatives(
        subject=sujet,
        body=texte,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[destinataire],
    )
    message.attach_alternative(html, "text/html")
    try:
        if message.send(fail_silently=False) != 1:
            raise CourrielIndisponible()
    except CourrielIndisponible:
        raise
    except Exception as exc:
        logger.exception("Échec de livraison d'un courriel de compte via Brevo")
        raise CourrielIndisponible() from exc


def _url_front(chemin):
    return f"{settings.FRONT_ORIGIN.rstrip('/')}/{chemin.lstrip('/')}"


def _envoyer_verification(user):
    jeton = signing.dumps(
        {"id": user.pk, "email": user.email},
        salt=EMAIL_VERIFICATION_SALT,
        compress=True,
    )
    url = _url_front(f"verifier-email/{user.pk}/{jeton}")
    sujet = "Confirme ton adresse e-mail — EMSP Connect"
    texte = (
        f"Bonjour {user.prenom},\n\n"
        "Nous avons reçu une demande de création de compte EMSP Connect. "
        f"Confirme ton adresse e-mail en ouvrant ce lien :\n{url}\n\n"
        "Ce lien expire dans 48 heures. Si tu n'es pas à l'origine de cette demande, "
        "tu peux ignorer ce message."
    )
    prenom_html = escape(user.prenom)
    html = (
        "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#17301f'>"
        f"<h2>Bienvenue sur EMSP Connect, {prenom_html} !</h2>"
        "<p>Confirme ton adresse e-mail pour activer ton compte.</p>"
        f"<p><a href='{url}' style='display:inline-block;padding:12px 18px;"
        "background:#0b7a3b;color:#fff;text-decoration:none;border-radius:8px'>"
        "Confirmer mon adresse</a></p>"
        "<p>Ce lien expire dans 48 heures. Si tu n'as pas demandé de compte, "
        "ignore ce message.</p></div>"
    )
    _envoyer(user.email, sujet, texte, html)


def _envoyer_reinitialisation(user):
    uid = urlsafe_base64_encode(str(user.pk).encode())
    jeton = default_token_generator.make_token(user)
    url = _url_front(f"reinitialiser-mot-de-passe/{uid}/{jeton}")
    sujet = "Réinitialisation de ton mot de passe — EMSP Connect"
    texte = (
        "Une demande de réinitialisation de mot de passe a été reçue pour ton compte.\n\n"
        f"Choisis un nouveau mot de passe avec ce lien valable une heure :\n{url}\n\n"
        "Si tu n'es pas à l'origine de cette demande, ignore ce message."
    )
    html = (
        "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#17301f'>"
        "<h2>Réinitialise ton mot de passe</h2>"
        "<p>Choisis un nouveau mot de passe en suivant le lien ci-dessous. "
        "Il expire dans une heure.</p>"
        f"<p><a href='{url}' style='display:inline-block;padding:12px 18px;"
        "background:#0b7a3b;color:#fff;text-decoration:none;border-radius:8px'>"
        "Choisir un nouveau mot de passe</a></p>"
        "<p>Si tu n'as pas demandé cette modification, ignore ce message.</p></div>"
    )
    _envoyer(user.email, sujet, texte, html)


def _envoyer_confirmation_changement(user):
    sujet = "Ton mot de passe a été modifié — EMSP Connect"
    texte = (
        "Le mot de passe de ton compte EMSP Connect vient d'être modifié.\n\n"
        "Si tu n'es pas à l'origine de ce changement, contacte immédiatement "
        "l'équipe EMSP Connect."
    )
    html = (
        "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#17301f'>"
        "<h2>Mot de passe modifié</h2>"
        "<p>Le mot de passe de ton compte EMSP Connect vient d'être modifié.</p>"
        "<p>Si tu n'es pas à l'origine de ce changement, contacte immédiatement "
        "l'équipe EMSP Connect.</p></div>"
    )
    _envoyer(user.email, sujet, texte, html)


class InscriptionView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_email"

    def post(self, request):
        serializer = InscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        _exiger_configuration_courriel()
        try:
            with transaction.atomic():
                user = serializer.save()
                _envoyer_verification(user)
        except CourrielIndisponible:
            raise
        return Response(
            {"detail": "Compte créé. Consulte ta boîte e-mail pour le confirmer."},
            status=status.HTTP_201_CREATED,
        )


class VerifierEmailView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_email"

    class Entree(serializers.Serializer):
        uid = serializers.CharField()
        token = serializers.CharField()

    def post(self, request):
        entree = self.Entree(data=request.data)
        entree.is_valid(raise_exception=True)
        try:
            user = User.objects.get(pk=entree.validated_data["uid"])
            payload = signing.loads(
                entree.validated_data["token"],
                salt=EMAIL_VERIFICATION_SALT,
                max_age=EMAIL_VERIFICATION_TTL,
            )
        except (User.DoesNotExist, signing.BadSignature, ValueError):
            return Response({"detail": "Ce lien est invalide ou a expiré."}, status=400)
        if payload.get("id") != user.pk or not constant_time_compare(
            str(payload.get("email", "")), user.email
        ):
            return Response({"detail": "Ce lien est invalide ou a expiré."}, status=400)
        if not user.email_verifie:
            user.email_verifie = True
            user.save(update_fields=["email_verifie"])
        return Response({"detail": "Adresse e-mail confirmée."})


class RenvoyerConfirmationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_email"

    class Entree(serializers.Serializer):
        email = serializers.EmailField()

    def post(self, request):
        entree = self.Entree(data=request.data)
        entree.is_valid(raise_exception=True)
        _exiger_configuration_courriel()
        user = User.objects.filter(email__iexact=entree.validated_data["email"]).first()
        if user and user.is_active and not user.email_verifie:
            _envoyer_verification(user)
        return Response(
            {"detail": "Si un compte attend cette confirmation, un e-mail a été envoyé."}
        )


class DemanderReinitialisationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_email"

    class Entree(serializers.Serializer):
        email = serializers.EmailField()

    def post(self, request):
        entree = self.Entree(data=request.data)
        entree.is_valid(raise_exception=True)
        _exiger_configuration_courriel()
        user = User.objects.filter(
            email__iexact=entree.validated_data["email"], is_active=True
        ).first()
        if user:
            _envoyer_reinitialisation(user)
        return Response(
            {"detail": "Si un compte existe, un lien de réinitialisation a été envoyé."}
        )


class ReinitialiserMotDePasseView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_password"

    class Entree(serializers.Serializer):
        uid = serializers.CharField()
        token = serializers.CharField()
        password = serializers.CharField(write_only=True, min_length=8)

    def post(self, request):
        entree = self.Entree(data=request.data)
        entree.is_valid(raise_exception=True)
        _exiger_configuration_courriel()
        try:
            user_id = force_str(urlsafe_base64_decode(entree.validated_data["uid"]))
            user = User.objects.get(pk=user_id, is_active=True)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Ce lien est invalide ou a expiré."}, status=400)
        if not default_token_generator.check_token(user, entree.validated_data["token"]):
            return Response({"detail": "Ce lien est invalide ou a expiré."}, status=400)
        try:
            validate_password(entree.validated_data["password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": exc.messages}) from exc
        with transaction.atomic():
            user.set_password(entree.validated_data["password"])
            user.save(update_fields=["password"])
            _envoyer_confirmation_changement(user)
        return Response({"detail": "Mot de passe modifié."})


class ChangerMotDePasseView(APIView):
    permission_classes = [EstActif]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_password"

    class Entree(serializers.Serializer):
        currentPassword = serializers.CharField(write_only=True)
        newPassword = serializers.CharField(write_only=True, min_length=8)

    def post(self, request):
        entree = self.Entree(data=request.data)
        entree.is_valid(raise_exception=True)
        _exiger_configuration_courriel()
        if not request.user.check_password(entree.validated_data["currentPassword"]):
            raise serializers.ValidationError({"currentPassword": "Mot de passe actuel incorrect."})
        try:
            validate_password(entree.validated_data["newPassword"], user=request.user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"newPassword": exc.messages}) from exc
        with transaction.atomic():
            request.user.set_password(entree.validated_data["newPassword"])
            request.user.save(update_fields=["password"])
            _envoyer_confirmation_changement(request.user)
        return Response({"detail": "Mot de passe modifié."})
