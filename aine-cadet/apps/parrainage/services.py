"""
Services métier — règles de gestion Ainé & Cadet.

Centralise la logique CDC §4 pour éviter la duplication dans les vues.
"""
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Count, Q

from apps.accounts.models import ProfilParrain, User

from django.utils import timezone

from .models import (
    Avis,
    Badge,
    BadgeAttribution,
    DemandeParrainage,
    Evenement,
    InscriptionEvenement,
    Message,
    RendezVous,
)


def compter_filleuls_actifs(parrain: User) -> int:
    """Nombre de filleuls actuellement accompagnés par un parrain (CDC R2)."""
    return DemandeParrainage.objects.filter(
        parrain=parrain,
        statut=DemandeParrainage.Statut.ACCEPTE,
    ).count()


def parrain_a_de_la_place(parrain: User) -> bool:
    """True si le parrain peut accepter une nouvelle demande."""
    maximum = settings.PARRAIN_MAX_FILLEULS
    return compter_filleuls_actifs(parrain) < maximum


def filleul_a_deja_un_parrain_actif(filleul: User) -> bool:
    """True si le filleul a déjà un parrainage accepté (CDC R1)."""
    return DemandeParrainage.objects.filter(
        filleul=filleul,
        statut=DemandeParrainage.Statut.ACCEPTE,
    ).exists()


def valider_nouvelle_demande(filleul: User, parrain: User) -> None:
    """
    Lève ValidationError si la demande ne respecte pas les règles R1–R3.
    Appelé avant création d'une DemandeParrainage.
    """
    if filleul.role != User.Role.FILLEUL:
        raise ValidationError("Seul un Cadet peut envoyer une demande.")
    if parrain.role != User.Role.PARRAIN:
        raise ValidationError("La demande doit cibler un Ainé.")
    if filleul_a_deja_un_parrain_actif(filleul):
        raise ValidationError("Ce Cadet a déjà un Ainé actif (règle R1).")
    if not parrain_a_de_la_place(parrain):
        raise ValidationError("Cet Ainé a atteint sa capacité maximale (règle R2).")
    try:
        profil = parrain.profil_parrain
    except ProfilParrain.DoesNotExist:
        raise ValidationError("Cet Ainé n'a pas de profil public.") from None
    if not profil.disponible:
        raise ValidationError("Cet Ainé n'est pas disponible dans l'annuaire (règle R3).")


def mettre_a_jour_disponibilite_parrain(parrain: User) -> None:
    """
    Masque ou réaffiche le parrain dans l'annuaire selon sa capacité (CDC R3).
    À appeler après acceptation ou fin de parrainage.
    """
    try:
        profil = parrain.profil_parrain
    except ProfilParrain.DoesNotExist:
        return
    profil.disponible = parrain_a_de_la_place(parrain)
    profil.save(update_fields=["disponible"])


def parrains_disponibles_queryset(filiere: str | None = None):
    """
    Annuaire des parrains disponibles (CDC §3.2).
    Filtre optionnel par filière ; exclut les parrains saturés.
    """
    qs = (
        User.objects.filter(role=User.Role.PARRAIN, is_active=True, is_suspended=False)
        .filter(profil_parrain__disponible=True)
        .select_related("profil_parrain")
        .annotate(
            filleuls_actifs=Count(
                "demandes_recues",
                filter=Q(demandes_recues__statut=DemandeParrainage.Statut.ACCEPTE),
            )
        )
    )
    if filiere:
        qs = qs.filter(filiere__iexact=filiere)
    return qs.order_by("-profil_parrain__score_fiabilite", "last_name")


def suggerer_parrains(filleul: User, limite: int = 5):
    """
    Suggestion automatique : priorité même filière et centres d'intérêt (CDC §3.2).
    """
    base = parrains_disponibles_queryset()
    if filleul.filiere:
        meme_filiere = list(base.filter(filiere__iexact=filleul.filiere)[:limite])
        if len(meme_filiere) >= limite:
            return meme_filiere
        reste = limite - len(meme_filiere)
        autres = base.exclude(pk__in=[p.pk for p in meme_filiere])[:reste]
        return meme_filiere + list(autres)
    return list(base[:limite])


def est_membre_binome(parrainage: DemandeParrainage, user: User) -> bool:
    """True si l'utilisateur est l'Ainé ou le Cadet du binôme."""
    return user.pk in (parrainage.parrain_id, parrainage.filleul_id)


def peut_acceder_messagerie(parrainage: DemandeParrainage, user: User) -> bool:
    """
    Messagerie accessible uniquement aux membres du binôme
    et si le parrainage est accepté (CDC §3.4).
    """
    if not est_membre_binome(parrainage, user):
        return False
    return parrainage.statut == DemandeParrainage.Statut.ACCEPTE


def peut_acceder_rdv(parrainage: DemandeParrainage, user: User) -> bool:
    """Rendez-vous accessibles sous les mêmes conditions que la messagerie (CDC §3.5)."""
    return peut_acceder_messagerie(parrainage, user)


def compter_non_lus(user: User) -> int:
    """Nombre total de messages non lus reçus par l'utilisateur."""
    return (
        Message.objects.filter(
            Q(parrainage__parrain=user) | Q(parrainage__filleul=user),
            parrainage__statut=DemandeParrainage.Statut.ACCEPTE,
            lu=False,
        )
        .exclude(expediteur=user)
        .count()
    )


def marquer_messages_lus(parrainage: DemandeParrainage, user: User) -> int:
    """Marque comme lus les messages reçus (envoyés par l'autre membre)."""
    return (
        parrainage.messages.filter(lu=False)
        .exclude(expediteur=user)
        .update(lu=True)
    )


def binome_partenaire(parrainage: DemandeParrainage, user: User) -> User | None:
    """Retourne l'autre membre du binôme (Ainé ou Cadet)."""
    if user.pk == parrainage.parrain_id:
        return parrainage.filleul
    if user.pk == parrainage.filleul_id:
        return parrainage.parrain
    return None


def rdv_a_venir(user: User, limite: int = 10):
    """Liste des rendez-vous acceptés à venir pour l'utilisateur."""
    now = timezone.now()
    return (
        RendezVous.objects.filter(
            Q(parrainage__parrain=user) | Q(parrainage__filleul=user),
            parrainage__statut=DemandeParrainage.Statut.ACCEPTE,
            statut=RendezVous.Statut.ACCEPTE,
            date_heure__gte=now,
        )
        .select_related("parrainage", "parrainage__parrain", "parrainage__filleul", "organisateur")
        .order_by("date_heure")[:limite]
    )


def rdv_en_attente(user: User):
    """RDV proposés en attente de réponse par l'utilisateur (non organisateur)."""
    return (
        RendezVous.objects.filter(
            Q(parrainage__parrain=user) | Q(parrainage__filleul=user),
            parrainage__statut=DemandeParrainage.Statut.ACCEPTE,
            statut=RendezVous.Statut.PROPOSE,
        )
        .exclude(organisateur=user)
        .select_related("parrainage", "organisateur")
        .order_by("date_heure")
    )


def peut_repondre_rdv(rdv: RendezVous, user: User) -> bool:
    """Seul le membre qui n'a pas proposé le RDV peut accepter/refuser/contre-proposer."""
    if not peut_acceder_rdv(rdv.parrainage, user):
        return False
    if rdv.statut != RendezVous.Statut.PROPOSE:
        return False
    return rdv.organisateur_id != user.pk


# --- Phase 3 — Communauté et qualité (CDC §3.6–§3.8) ---

BADGES_DEFAUT = {
    "premier-parrainage": {
        "libelle": "Premier parrainage",
        "description": "A accompagné son premier Cadet jusqu'à la fin du parcours.",
    },
    "cinq-cadets": {
        "libelle": "5 Cadets accompagnés",
        "description": "A mené à terme l'accompagnement de cinq Cadets.",
    },
    "evenement-organise": {
        "libelle": "Événement organisé",
        "description": "A organisé un événement collectif pour la communauté.",
    },
}


def assurer_badges_existants() -> None:
    """Crée les badges par défaut s'ils n'existent pas encore (CDC §3.8)."""
    for code, meta in BADGES_DEFAUT.items():
        Badge.objects.get_or_create(
            code=code,
            defaults={"libelle": meta["libelle"], "description": meta["description"]},
        )


def peut_terminer_parrainage(parrainage: DemandeParrainage, user: User) -> bool:
    """Seuls les membres du binôme actif ou un admin peuvent clore le parcours (CDC R6)."""
    if parrainage.statut != DemandeParrainage.Statut.ACCEPTE:
        return False
    if user.role == User.Role.ADMIN or user.is_staff:
        return True
    return est_membre_binome(parrainage, user)


def terminer_parrainage(parrainage: DemandeParrainage, user: User) -> None:
    """
    Clôture un parrainage actif : libère une place Ainé et déclenche les avis (CDC R6).
    """
    if not peut_terminer_parrainage(parrainage, user):
        raise ValidationError("Ce parrainage ne peut pas être terminé.")
    parrainage.statut = DemandeParrainage.Statut.TERMINE
    parrainage.date_fin = timezone.now()
    parrainage.save(update_fields=["statut", "date_fin"])
    mettre_a_jour_disponibilite_parrain(parrainage.parrain)
    attribuer_badges_parrain(parrainage.parrain)


def peut_laissser_avis(parrainage: DemandeParrainage, user: User) -> bool:
    """Avis autorisé une fois le parrainage terminé, une seule fois par participant (CDC §3.6)."""
    if parrainage.statut != DemandeParrainage.Statut.TERMINE:
        return False
    if not est_membre_binome(parrainage, user):
        return False
    return not parrainage.avis.filter(auteur=user).exists()


def valider_note_avis(note: int) -> None:
    """Note sur échelle 1 à 5."""
    if note < 1 or note > 5:
        raise ValidationError("La note doit être comprise entre 1 et 5.")


def recalculer_score_fiabilite(parrain: User) -> None:
    """
    Moyenne des notes laissées par les Cadets sur les parcours terminés (CDC §3.6).
    """
    try:
        profil = parrain.profil_parrain
    except ProfilParrain.DoesNotExist:
        return

    notes = Avis.objects.filter(
        parrainage__parrain=parrain,
        parrainage__statut=DemandeParrainage.Statut.TERMINE,
        auteur__role=User.Role.FILLEUL,
    ).values_list("note", flat=True)

    if notes:
        profil.score_fiabilite = round(sum(notes) / len(notes), 2)
    else:
        profil.score_fiabilite = 0
    profil.save(update_fields=["score_fiabilite"])


def soumettre_avis(parrainage: DemandeParrainage, user: User, note: int, commentaire: str = "") -> Avis:
    """Enregistre un avis et met à jour le score de fiabilité de l'Ainé si le Cadet note."""
    if not peut_laissser_avis(parrainage, user):
        raise ValidationError("Vous ne pouvez pas laisser d'avis pour ce parrainage.")
    valider_note_avis(note)
    avis = Avis.objects.create(
        parrainage=parrainage,
        auteur=user,
        note=note,
        commentaire=commentaire,
    )
    if user.role == User.Role.FILLEUL:
        recalculer_score_fiabilite(parrainage.parrain)
    return avis


def parrainages_termines_sans_avis(user: User):
    """Parrainages clos où l'utilisateur n'a pas encore laissé d'avis."""
    return (
        DemandeParrainage.objects.filter(
            Q(parrain=user) | Q(filleul=user),
            statut=DemandeParrainage.Statut.TERMINE,
        )
        .exclude(avis__auteur=user)
        .select_related("parrain", "filleul")
        .order_by("-date_fin")
    )


def badges_parrain(parrain: User):
    """Badges obtenus par un Ainé, triés par date d'attribution."""
    return (
        BadgeAttribution.objects.filter(parrain=parrain)
        .select_related("badge")
        .order_by("date_attribution")
    )


def _attribuer_badge_si_eligible(parrain: User, code: str) -> bool:
    """Attribue un badge s'il n'est pas déjà obtenu. Retourne True si nouvelle attribution."""
    assurer_badges_existants()
    badge = Badge.objects.get(code=code)
    _, created = BadgeAttribution.objects.get_or_create(parrain=parrain, badge=badge)
    return created


def attribuer_badges_parrain(parrain: User) -> list[str]:
    """
    Vérifie et attribue les badges automatiques (CDC §3.8).
    Retourne la liste des codes nouvellement attribués.
    """
    nouveaux = []

    parrainages_termines = DemandeParrainage.objects.filter(
        parrain=parrain,
        statut=DemandeParrainage.Statut.TERMINE,
    ).count()
    if parrainages_termines >= 1 and _attribuer_badge_si_eligible(parrain, "premier-parrainage"):
        nouveaux.append("premier-parrainage")
    if parrainages_termines >= 5 and _attribuer_badge_si_eligible(parrain, "cinq-cadets"):
        nouveaux.append("cinq-cadets")

    if Evenement.objects.filter(organisateur=parrain).exists():
        if _attribuer_badge_si_eligible(parrain, "evenement-organise"):
            nouveaux.append("evenement-organise")

    return nouveaux


def peut_creer_evenement(user: User) -> bool:
    """Seuls les Ainés et administrateurs peuvent créer un événement (CDC §3.7)."""
    return user.role in (User.Role.PARRAIN, User.Role.ADMIN) or user.is_staff


def evenements_a_venir(limite: int = 20):
    """Événements collectifs à venir, triés par date."""
    return (
        Evenement.objects.filter(date_heure__gte=timezone.now())
        .select_related("organisateur")
        .annotate(nb_inscrits=Count("inscriptions"))
        .order_by("date_heure")[:limite]
    )


def places_restantes_evenement(evenement: Evenement) -> int | None:
    """Places restantes ou None si capacité illimitée."""
    if evenement.places_max is None:
        return None
    inscrits = evenement.inscriptions.count()
    return max(0, evenement.places_max - inscrits)


def peut_sinscrire_evenement(evenement: Evenement, user: User) -> bool:
    """Inscription réservée aux Cadets, événement futur, places disponibles."""
    if user.role != User.Role.FILLEUL:
        return False
    if evenement.date_heure < timezone.now():
        return False
    if evenement.inscriptions.filter(participant=user).exists():
        return False
    restantes = places_restantes_evenement(evenement)
    return restantes is None or restantes > 0


def inscrire_evenement(evenement: Evenement, user: User) -> InscriptionEvenement:
    """Inscrit un Cadet à un événement collectif."""
    if not peut_sinscrire_evenement(evenement, user):
        raise ValidationError("Inscription impossible pour cet événement.")
    return InscriptionEvenement.objects.create(evenement=evenement, participant=user)


def statistiques_administration() -> dict:
    """Indicateurs pour le dashboard administrateur (CDC Phase 3)."""
    from django.db.models.functions import TruncMonth

    cadets_sans_aine = User.objects.filter(
        role=User.Role.FILLEUL,
        is_active=True,
    ).exclude(
        demandes_envoyees__statut=DemandeParrainage.Statut.ACCEPTE,
    ).count()

    parrainages_actifs = DemandeParrainage.objects.filter(
        statut=DemandeParrainage.Statut.ACCEPTE,
    )

    # Parrainages actifs par filière (Ainé)
    par_filiere = (
        parrainages_actifs.values("parrain__filiere")
        .annotate(total=Count("id"))
        .order_by("-total")
    )
    chart_parrainages_filiere = {
        "labels": [r["parrain__filiere"] or "Non renseigné" for r in par_filiere],
        "values": [r["total"] for r in par_filiere],
    }

    # Évolution mensuelle des demandes acceptées (12 derniers mois)
    evolution = (
        DemandeParrainage.objects.filter(statut=DemandeParrainage.Statut.ACCEPTE)
        .annotate(mois=TruncMonth("date_creation"))
        .values("mois")
        .annotate(total=Count("id"))
        .order_by("mois")[:12]
    )
    chart_evolution_mois = {
        "labels": [e["mois"].strftime("%m/%Y") if e["mois"] else "—" for e in evolution],
        "values": [e["total"] for e in evolution],
    }

    return {
        "parrainages_actifs": parrainages_actifs.count(),
        "demandes_en_attente": DemandeParrainage.objects.filter(
            statut=DemandeParrainage.Statut.EN_ATTENTE,
        ).count(),
        "cadets_en_attente": cadets_sans_aine,
        "aines_disponibles": User.objects.filter(
            role=User.Role.PARRAIN,
            is_active=True,
            profil_parrain__disponible=True,
        ).count(),
        "evenements_a_venir": Evenement.objects.filter(
            date_heure__gte=timezone.now(),
        ).count(),
        "avis_recents_faibles": Avis.objects.filter(note__lte=2).select_related(
            "parrainage", "auteur", "parrainage__parrain",
        ).order_by("-date_creation")[:5],
        "chart_parrainages_filiere": chart_parrainages_filiere,
        "chart_evolution_mois": chart_evolution_mois,
    }
