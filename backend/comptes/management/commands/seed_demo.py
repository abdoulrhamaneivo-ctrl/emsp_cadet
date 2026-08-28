"""Seed démo T3b — état verbatim de `store-t3.js` (front T3a), idempotent.

Le RDV confirmé est daté « demain 14h » calculé à l'exécution (leçon T3a :
jamais de date en dur — la bannière J-1 reste vivante quel que soit le jour).
Comptes de démo, mot de passe `demo` — JAMAIS en prod.
"""

from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from comptes.models import Binome, User
from messagerie.models import Conversation, Lecture, Message
from rendezvous.models import RendezVous

DEMO = {
    "ivo": {
        "email": "ivo.abdoul@emsp.int",
        "prenom": "Ivo",
        "nom": "Abdoul",
        "classe": "L2 Digitalisation",
        "filiere": "Digitalisation des services",
    },
    "awa": {
        "email": "awa.kouassi@emsp.int",
        "prenom": "Awa",
        "nom": "Kouassi",
        "classe": "L3 Réseaux",
        "filiere": "Réseaux et télécommunications",
    },
    "yann": {
        "email": "yann.gbagbo@emsp.int",
        "prenom": "Yann",
        "nom": "Gbagbo",
        "classe": "L1 Digitalisation",
        "filiere": "Digitalisation des services",
    },
    "salim": {
        "email": "salim.cisse@emsp.int",
        "prenom": "Salim",
        "nom": "Cissé",
        "classe": "L1 Digitalisation",
        "filiere": "Digitalisation des services",
    },
}

MESSAGES_CONV_PRIVEE = [
    (
        "Bonjour Ivo ! Contente que tu aies accepté — on construit ça ensemble.",
        "awa",
        "2026-08-24T10:02:00",
    ),
    (
        "Merci Awa ! Je débute en réseaux, ton parcours me parle beaucoup.",
        "ivo",
        "2026-08-24T10:05:00",
    ),
    ("On commence par quoi selon toi ?", "ivo", "2026-08-24T10:06:00"),
    (
        "On va poser les bases : le modèle OSI, puis un petit lab Packet Tracer. "
        "Je prépare un plan.",
        "awa",
        "2026-08-24T10:12:00",
    ),
    ("Au top, merci !", "ivo", "2026-08-24T10:13:00"),
    (
        "Petit devoir : regarde la vidéo sur le modèle OSI avant notre séance.",
        "awa",
        "2026-08-25T17:58:00",
    ),
    ("C'est noté, je regarde ça ce soir.", "ivo", "2026-08-25T18:10:00"),
    ("Je peux te proposer un créneau jeudi 14h en salle B12 ?", "awa", "2026-08-26T09:20:00"),
    ("Jeudi 14h ça me va parfaitement.", "ivo", "2026-08-26T12:04:00"),
    ("Parfait, on fait ça demain à 14h !", "awa", "2026-08-26T14:32:00"),
]


def _demain_14h_sur():
    """Demain 14h, fiable même en fin de mois (replace(day=…) déborde sinon)."""
    locale = timezone.localtime()
    return (locale + timedelta(days=1)).replace(hour=14, minute=0, second=0, microsecond=0)


class Command(BaseCommand):
    help = "Seed démo T3 (messagerie + RDV) — cohérent avec store-t3.js du front."

    def handle(self, *args, **options):
        utilisateurs = {
            cle: User.objects.get_or_create(
                email=infos["email"],
                defaults={
                    "username": infos["email"],
                    "password": "demo",
                    **{k: v for k, v in infos.items() if k != "email"},
                },
            )[0]
            for cle, infos in DEMO.items()
        }
        for u in utilisateurs.values():
            u.set_password("demo")
            u.save()

        ivo, awa, yann, salim = (
            utilisateurs["ivo"],
            utilisateurs["awa"],
            utilisateurs["yann"],
            utilisateurs["salim"],
        )

        binome, cree = Binome.objects.get_or_create(aine=awa, cadet=ivo)
        if not cree and not Binome.binome_actif_existe(ivo, awa):
            binome.statut = Binome.Statut.ACTIF
            binome.save()

        if Conversation.objects.filter(participants=ivo).exists():
            self.stdout.write("Déjà seedé — rien à faire.")
            return

        # Conversation privée du binôme + 10 messages (ids 1..10 à l'insertion).
        conv_privee = Conversation.objects.create(type=Conversation.Type.PRIVE)
        conv_privee.participants.set([ivo, awa])
        derniers = {}
        messages_crees = []
        for contenu, auteur, date_iso in MESSAGES_CONV_PRIVEE:
            m = Message(
                conversation=conv_privee,
                auteur=utilisateurs[auteur],
                contenu=contenu,
                idempotency_key=f"seed-{len(messages_crees) + 1}",
            )
            m.save()
            # auto_now_add écrase la date à l'INSERT : on la réécrit via update()
            # (qui ne touche jamais les champs automatiques).
            Message.objects.filter(pk=m.pk).update(
                date_envoi=timezone.make_aware(datetime.fromisoformat(date_iso))
            )
            derniers[auteur] = m
            messages_crees.append(m)
        # Ivo a « lu » jusqu'au message 5 (index 4) → 3 non-lus (6, 8, 10),
        # même badge que le store MSW validé en capture. Awa est à jour.
        Lecture.objects.create(
            conversation=conv_privee,
            utilisateur=ivo,
            dernier_message_lu=messages_crees[4],
        )
        Lecture.objects.create(
            conversation=conv_privee, utilisateur=awa, dernier_message_lu=derniers["awa"]
        )

        # Conversation famille : Ivo propriétaire, Yann + Salim membres.
        famille = Conversation.objects.create(
            type=Conversation.Type.GROUPE_FAMILLE,
            titre_groupe="Ta famille — toi & tes cadets",
            icone_code="users",
            proprietaire=ivo,
        )
        famille.participants.set([ivo, yann, salim])
        bienvenue = Message(
            conversation=famille,
            auteur=yann,
            contenu="Bienvenue dans la famille, Salim !",
            idempotency_key="seed-famille-1",
        )
        bienvenue.save()
        Message.objects.filter(pk=bienvenue.pk).update(
            date_envoi=timezone.make_aware(datetime.fromisoformat("2026-08-25T18:06:00"))
        )
        Lecture.objects.create(
            conversation=famille, utilisateur=ivo, dernier_message_lu=bienvenue
        )

        # RDV — 401 « demain 14h » (dynamique), 402 passé, 403 proposé par Awa.
        RendezVous.objects.create(
            organisateur=awa,
            invite=ivo,
            titre="Première séance — modèle OSI",
            description="Intro réseaux + petit lab Packet Tracer. Apporte ton PC.",
            date_heure=_demain_14h_sur(),
            lieu="Salle B12",
            mode=RendezVous.Mode.PRESENTIEL,
            statut=RendezVous.Statut.CONFIRME,
        )
        RendezVous.objects.create(
            organisateur=ivo,
            invite=awa,
            titre="Point sur le lab Packet Tracer",
            description=None,
            date_heure=timezone.make_aware(datetime.fromisoformat("2026-08-20T15:00:00")),
            lieu="Bibliothèque",
            mode=RendezVous.Mode.PRESENTIEL,
            statut=RendezVous.Statut.PASSE,
            rappel_vu=True,
        )
        RendezVous.objects.create(
            organisateur=awa,
            invite=ivo,
            titre="Séance sous-réseaux",
            description="Exercices de subnetting.",
            date_heure=timezone.make_aware(datetime.fromisoformat("2026-09-02T10:00:00")),
            lieu="Visio",
            mode=RendezVous.Mode.VISIO,
            statut=RendezVous.Statut.PROPOSE,
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Seed démo posé : 4 comptes (mdp `demo`), 2 conversations, 3 RDV."
            )
        )
