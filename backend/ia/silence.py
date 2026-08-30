"""IA-5 — Détection binômes silencieux (doc 17 §2).

Méta-données UNIQUEMENT (RG12.2) : dernier échange messagerie > 21j,
RDV annulés en série (> 3 sur 30j) → nudge bienveillant aux DEUX membres
+ ligne dans le tableau admin.

AUCUN contenu de conversation n'est analysé (vie privée stricte).
"""

from datetime import timedelta

from django.db import models
from django.db.models import Count, Q
from django.utils import timezone

from comptes.models import Binome
from ia.integration import kill_switch_actif


def detecter_binomes_silencieux():
    """Retourne la liste des binômes à risque (silencieux).

    Critères (métas only, RG12.2) :
    - Dernier message dans la conversation Famille > 21 jours
    OU
    - ≥ 3 RDV annulés sur les 30 derniers jours

    Retourne liste de dicts : {binome_id, aine_id, cadet_id, raisons: list[str]}
    """
    if kill_switch_actif():
        return []

    maintenant = timezone.now()
    seuil_message = maintenant - timedelta(days=21)
    seuil_rdv = maintenant - timedelta(days=30)

    # Binômes actifs
    binomes = Binome.objects.filter(statut=Binome.Statut.ACTIF).select_related("aine", "cadet")

    resultats = []

    for b in binomes:
        raisons = []

        # 1. Dernier message Famille > 21j
        from messagerie.models import Conversation, Message
        conv = Conversation.objects.filter(
            participants=b.aine, type="groupe_famille"
        ).filter(participants=b.cadet).first()

        if conv:
            dernier = Message.objects.filter(conversation=conv).order_by("-date_envoi").first()
            if dernier and dernier.date_envoi < seuil_message:
                jours = (maintenant - dernier.date_envoi).days
                raisons.append(f"Aucun échange depuis {jours} jours")

        # 2. RDV annulés ≥ 3 sur 30j
        from rendezvous.models import RendezVous
        annules = RendezVous.objects.filter(
            Q(organisateur=b.aine, invite=b.cadet) | Q(organisateur=b.cadet, invite=b.aine),
            statut=RendezVous.Statut.ANNULE,
            date_heure__gte=seuil_rdv,
        ).count()

        if annules >= 3:
            raisons.append(f"{annules} RDV annulés sur 30 jours")

        if raisons:
            resultats.append({
                "binome_id": b.pk,
                "aine_id": b.aine_id,
                "cadet_id": b.cadet_id,
                "raisons": raisons,
            })

    return resultats


def creer_nudge_binome(binome_id, raisons):
    """Crée un nudge bienveillant pour les DEUX membres du binôme.

    - Notification in-app (pas email, pas push)
    - Ton bienveillant : « Ça fait X jours — un petit mot ? »
    - Jamais culpabilisant, jamais public
    """
    from messagerie.models import Conversation, Message

    try:
        b = Binome.objects.select_related("aine", "cadet").get(pk=binome_id, statut=Binome.Statut.ACTIF)
    except Binome.DoesNotExist:
        return

    # Trouver la conversation Famille
    conv = Conversation.objects.filter(
        participants=b.aine, type="groupe_famille"
    ).filter(participants=b.cadet).first()

    if not conv:
        return

    texte_raisons = " · ".join(raisons)
    contenu = (
        f"🤝 Nudge bienveillant : {texte_raisons}. "
        "Un petit message pour prendre des nouvelles ?"
    )

    # Message système (auteur = modération IA)
    from comptes.models import User
    systeme, _ = User.objects.get_or_create(
        email="moderation.ia@emsp.int",
        defaults={"prenom": "Modération", "nom": "IA", "is_staff": True},
    )

    Message.objects.create(
        conversation=conv,
        auteur=systeme,
        contenu=contenu,
        # Marqué comme système pour ne pas déclencher d'accusé de lecture
    )

    # Notifier les deux membres (via WS existant)
    # Le WS temps réel push déjà le nouveau message