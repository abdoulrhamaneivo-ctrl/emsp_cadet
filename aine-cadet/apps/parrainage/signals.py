"""
Signaux Django — notifications email Phase 2.

Structure extensible : polling en Phase 2, WebSocket possible en Phase 3+.
"""
from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import DemandeParrainage, Message


def _envoyer_email(destinataire, sujet: str, message: str) -> None:
    """Envoie un email si le destinataire a une adresse valide."""
    if not destinataire.email:
        return
    send_mail(
        sujet,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [destinataire.email],
        fail_silently=True,
    )


@receiver(post_save, sender=Message)
def notifier_nouveau_message(sender, instance: Message, created: bool, **kwargs):
    """Email optionnel à la réception d'un message privé."""
    if not created or not getattr(settings, "NOTIFY_EMAIL_ON_MESSAGE", True):
        return

    parrainage = instance.parrainage
    if parrainage.statut != DemandeParrainage.Statut.ACCEPTE:
        return

    expediteur = instance.expediteur
    if expediteur.pk == parrainage.parrain_id:
        destinataire = parrainage.filleul
        role_exp = "Ainé"
    else:
        destinataire = parrainage.parrain
        role_exp = "Cadet"

    sujet = f"[{settings.APP_NAME}] Nouveau message de votre {role_exp.lower()}"
    corps = (
        f"Bonjour {destinataire.first_name},\n\n"
        f"{expediteur.get_full_name()} ({role_exp}) vous a envoyé un message "
        f"dans votre espace Ainé & Cadet.\n\n"
        f"Connectez-vous pour lire et répondre.\n\n"
        f"— {settings.APP_NAME}"
    )
    _envoyer_email(destinataire, sujet, corps)


@receiver(post_save, sender=DemandeParrainage)
def notifier_nouvelle_demande(sender, instance: DemandeParrainage, created: bool, **kwargs):
    """Email à l'Ainé lors d'une nouvelle demande de parrainage."""
    if not created or not getattr(settings, "NOTIFY_EMAIL_ON_DEMANDE", True):
        return

    if instance.statut != DemandeParrainage.Statut.EN_ATTENTE:
        return

    aine = instance.parrain
    cadet = instance.filleul
    sujet = f"[{settings.APP_NAME}] Nouvelle demande de parrainage"
    corps = (
        f"Bonjour {aine.first_name},\n\n"
        f"{cadet.get_full_name()} (Cadet) souhaite vous être mis en relation.\n\n"
    )
    if instance.message_introduction:
        corps += f"Message : « {instance.message_introduction[:200]} »\n\n"
    corps += (
        "Connectez-vous à votre espace Ainé pour accepter ou refuser la demande.\n\n"
        f"— {settings.APP_NAME}"
    )
    _envoyer_email(aine, sujet, corps)
