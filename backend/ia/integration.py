"""IA-1 — branchement à la soumission (doc 17 §2 + RG12).

Intégré dans les vues du Fil : publication/commentaire créés → analyse →
si score ≥ seuil : un Signalement (source IA, signalant = compte système)
est déposé et la publication est mise en file « en vérification » VISIBLE
par son auteur — JAMAIS masquée automatiquement (RG12.1 : l'admin tranche).
Chaque appel est journalisé (RG12.6).
"""

from django.conf import settings
from django.contrib.contenttypes.models import ContentType

from fil.models import Publication, Signalement

from .models import AppelIA
from .service import SEUIL_SIGNALEMENT, analyser_contenu


def _compte_systeme():
    """Signalant des signalements IA — compte staff dédié (créé au premier usage)."""
    from comptes.models import User

    user, _ = User.objects.get_or_create(
        email="moderation.ia@emsp.int",
        defaults={
            "prenom": "Modération",
            "nom": "IA",
            "is_staff": True,
            "is_active": True,
        },
    )
    return user


def analyser_apres_creation(instance, feature=AppelIA.Feature.MODERATION):
    """Analyse un contenu fraîchement créé ; dépose un signalement IA si score.

    Ne lève JAMAIS : une panne IA ne doit pas bloquer la soumission (doc 17
    §4 n°3 — dégradation silencieuse).
    """
    if kill_switch_actif():
        return None
    try:
        resultat = analyser_contenu(instance.contenu)
        AppelIA.objects.create(
            feature=feature,
            score=resultat["score"],
            raison=resultat["raison"] or "",
            signalant_ia=resultat["score"] >= SEUIL_SIGNALEMENT,
            cible=instance,
        )
        if resultat["score"] < SEUIL_SIGNALEMENT:
            return None

        # RG12.1 — le contenu reste VISIBLE : on dépose un signalement IA que
        # l'admin traitera (masquer/restaurer/sanctionner, doc 16).
        champ = (
            "publication" if isinstance(instance, Publication) else "commentaire"
        )
        Signalement.objects.create(
            **{champ: instance},
            signalant=_compte_systeme(),
            raison=Signalement.Raison.SPAM
            if "spam" in (resultat["raison"] or "").lower()
            else Signalement.Raison.INFO,
        )
        return resultat
    except Exception:  # noqa: BLE001 — l'IA ne bloque JAMAIS le parcours
        return None


def kill_switch_actif():
    """RG12.5 — kill-switch global : FeatureFlag côté settings (env)."""
    return getattr(settings, "IA_DESACTIVEE", False)
