"""
Envoi d'e-mails transactionnels EMSP — templates HTML + texte.

Utilise le backend Django configuré (Brevo via django-anymail, SMTP ou console).
"""
import logging

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email
from django.template.loader import render_to_string
from django.urls import reverse

logger = logging.getLogger(__name__)


def _email_context(extra: dict | None = None) -> dict:
    ctx = {
        "app_name": settings.APP_NAME,
        "site_url": getattr(settings, "AINE_CADET_PUBLIC_URL", "").rstrip("/"),
        "vitrine_url": getattr(settings, "EMSP_VITRINE_URL", "").rstrip("/"),
    }
    if extra:
        ctx.update(extra)
    return ctx


def valider_adresse_email(email: str) -> bool:
    """Validation serveur d'une adresse e-mail."""
    if not email or len(email) > 254:
        return False
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False


def envoyer_email_transactionnel(
    *,
    destinataires: list[str],
    sujet: str,
    template_texte: str,
    template_html: str,
    contexte: dict | None = None,
    fail_silently: bool = False,
) -> int:
    """
    Envoie un e-mail multipart (texte + HTML) via le backend Django.

    Retourne le nombre d'e-mails effectivement envoyés (0 si échec ou aucun destinataire valide).
    """
    recipients = [e.strip() for e in destinataires if e and valider_adresse_email(e.strip())]
    if not recipients:
        logger.warning("Aucun destinataire valide pour l'e-mail « %s ».", sujet)
        return 0

    ctx = _email_context(contexte)
    try:
        body_text = render_to_string(template_texte, ctx).strip()
        body_html = render_to_string(template_html, ctx).strip()
        message = EmailMultiAlternatives(
            subject=sujet,
            body=body_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients,
        )
        message.attach_alternative(body_html, "text/html")
        return message.send(fail_silently=fail_silently)
    except Exception:
        logger.warning("Échec envoi e-mail « %s » vers %s", sujet, recipients, exc_info=True)
        if not fail_silently:
            raise
        return 0


def envoyer_bienvenue_inscription(utilisateur) -> int:
    """E-mail de bienvenue après création de compte."""
    login_url = reverse("accounts:login")
    return envoyer_email_transactionnel(
        destinataires=[utilisateur.email],
        sujet=f"Bienvenue sur {settings.APP_NAME}",
        template_texte="emails/welcome.txt",
        template_html="emails/welcome.html",
        contexte={
            "prenom": utilisateur.first_name or utilisateur.get_username(),
            "login_url": login_url,
        },
        fail_silently=True,
    )


def envoyer_contact_admin(*, nom: str, email: str, objet: str, message: str) -> int:
    """Notification admin — message reçu depuis la vitrine."""
    admin_email = getattr(settings, "CONTACT_API_EMAIL", "contact@emsp.int")
    return envoyer_email_transactionnel(
        destinataires=[admin_email],
        sujet=f"[EMSP Contact] {objet or nom}",
        template_texte="emails/contact_admin.txt",
        template_html="emails/contact_admin.html",
        contexte={
            "nom": nom,
            "email_expediteur": email,
            "objet": objet or "(sans objet)",
            "message": message,
        },
        fail_silently=True,
    )


def envoyer_contact_accuse_reception(*, nom: str, email: str, objet: str) -> int:
    """Accusé de réception au visiteur ayant contacté la vitrine."""
    return envoyer_email_transactionnel(
        destinataires=[email],
        sujet="Votre message a bien été reçu — EMSP",
        template_texte="emails/contact_ack.txt",
        template_html="emails/contact_ack.html",
        contexte={"nom": nom, "objet": objet or "(sans objet)"},
        fail_silently=True,
    )


def envoyer_concours_preinscription_candidat(
    *,
    prenom: str,
    nom: str,
    email: str,
    session_annee: str,
    parcours_libelle: str,
) -> int:
    """Confirmation de pré-inscription concours au candidat."""
    return envoyer_email_transactionnel(
        destinataires=[email],
        sujet="Pré-inscription concours FS MENUM — confirmation EMSP",
        template_texte="emails/concours_preinscription_user.txt",
        template_html="emails/concours_preinscription_user.html",
        contexte={
            "prenom": prenom,
            "nom": nom,
            "session_annee": session_annee,
            "parcours_libelle": parcours_libelle,
        },
        fail_silently=True,
    )


def envoyer_concours_preinscription_admin(
    *,
    prenom: str,
    nom: str,
    email: str,
    session_annee: str,
    parcours_libelle: str,
    motivation: str,
) -> int:
    """Notification admissions — nouvelle pré-inscription concours."""
    admin_email = getattr(settings, "CONCOURS_PREINSCRIPTION_EMAIL", "admissions@emsp.int")
    return envoyer_email_transactionnel(
        destinataires=[admin_email],
        sujet=f"[EMSP Concours] Pré-inscription — {prenom} {nom}",
        template_texte="emails/concours_preinscription_admin.txt",
        template_html="emails/concours_preinscription_admin.html",
        contexte={
            "prenom": prenom,
            "nom": nom,
            "email_candidat": email,
            "session_annee": session_annee,
            "parcours_libelle": parcours_libelle,
            "motivation": motivation or "(non renseignée)",
        },
        fail_silently=True,
    )
