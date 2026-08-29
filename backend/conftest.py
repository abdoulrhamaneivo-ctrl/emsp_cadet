"""Fixtures partagées — utilisateurs, binôme, conversation privée (dates dynamiques)."""

from types import SimpleNamespace

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from comptes.models import Binome, User
from messagerie.models import Conversation


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def users(db):
    # classe = niveau en préfixe (convention plateforme) — c'est sur elle que
    # repose la garde aîné des événements (t4b). niveau_etude = champ réel v2
    # (doc 11, t5) — RG7 s'appuie DÉSORMAIS sur lui, pas sur le préfixe.
    ivo = User.objects.create_user(
        email="ivo@emsp.int",
        password="demo",
        prenom="Ivo",
        nom="Abdoul",
        classe="L2 Digitalisation",
        niveau_etude="L2",
    )
    awa = User.objects.create_user(
        email="awa@emsp.int",
        password="demo",
        prenom="Awa",
        nom="Kouassi",
        classe="L3 Réseaux",
        niveau_etude="L3",
    )
    salim = User.objects.create_user(
        email="salim@emsp.int",
        password="demo",
        prenom="Salim",
        nom="Cissé",
        classe="L1 Digitalisation",
        niveau_etude="L1",
    )
    return SimpleNamespace(ivo=ivo, awa=awa, salim=salim)


@pytest.fixture
def binome(users, db):
    return Binome.objects.create(aine=users.awa, cadet=users.ivo)


@pytest.fixture
def conv_privee(users, db):
    conversation = Conversation.objects.create(type=Conversation.Type.PRIVE)
    conversation.participants.set([users.ivo, users.awa])
    return conversation


@pytest.fixture
def demain_14h(db):
    return (timezone.localtime() + timezone.timedelta(days=1)).replace(
        hour=14, minute=0, second=0, microsecond=0
    )
