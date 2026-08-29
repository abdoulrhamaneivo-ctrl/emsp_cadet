"""Tests parrainage + transition — règles Ivo en dur :
1. promo devançante UNIQUEMENT (L1→L2 ✓, L1→L3 ✗) ;
2. transition annuelle sans casser les binômes + atomique."""

import pytest

pytestmark = pytest.mark.django_db


def _client(user):
    from rest_framework.test import APIClient

    c = APIClient()
    c.force_authenticate(user=user)
    return c


@pytest.fixture
def promotions(db):
    """Yao L1, Ivo L2, Awa L3, Koffi M1, Maï M2 — un étudiant par niveau.

    Indépendante de la fixture globale `users` (emails @emsp.int uniques)
    pour éviter les collisions d'ids en tests.
    """
    from comptes.models import User

    def cree(email, prenom, niveau):
        return User.objects.create_user(
            email=email,
            password="demo",
            prenom=prenom,
            nom="Test",
            classe=f"{niveau} Filière",
            niveau_etude=niveau,
            # Porte RG8 : la vue de demande exige candidature ouverte (sinon
            # 404 « n'est pas visible ») — ouverte pour tous les L2+.
            candidature_aine_ouverte=niveau != "L1",
        )

    return {
        "l1": cree("yao.test@emsp.int", "Yao", "L1"),
        "l2": cree("ivo.test@emsp.int", "Ivo", "L2"),
        "l3": cree("awa.test@emsp.int", "Awa", "L3"),
        "m1": cree("koffi.test@emsp.int", "Koffi", "M1"),
        "m2": cree("mai.test@emsp.int", "Maï", "M2"),
    }


# ── Règle Ivo n°2 : promo devançante ─────────────────────────────────────────
def test_l1_peut_demander_l2(api, promotions):
    reponse = _client(promotions["l1"]).post(
        "/api/parrains/%d/demande/" % promotions["l2"].pk,
        {"message": "Bonjour, je cherche un Aîné."},
        format="json",
    )
    assert reponse.status_code == 201, reponse.data


@pytest.mark.parametrize("cible", ["l3", "m1", "m2"])
def test_l1_ne_peut_pas_demander_plus_haut_422(api, promotions, cible):
    reponse = _client(promotions["l1"]).post(
        "/api/parrains/%d/demande/" % promotions[cible].pk, format="json"
    )
    assert reponse.status_code == 422
    assert "promo" in str(reponse.data.get("detail", "")).lower()


def test_l2_peut_demander_l3_pas_m1(api, promotions):
    ok = _client(promotions["l2"]).post(
        "/api/parrains/%d/demande/" % promotions["l3"].pk, format="json"
    )
    assert ok.status_code == 201
    # L2 a déjà une demande en attente → la règle promo (422) s'applique
    # AVANT RG1 : « tu ne peux demander qu'à la M1 » — message plus parlant
    # qu'un 409 générique (ordre produit assumé).
    ko = _client(promotions["l2"]).post(
        "/api/parrains/%d/demande/" % promotions["m1"].pk, format="json"
    )
    assert ko.status_code == 422


def test_m2_ne_peut_plus_demander(api, promotions):
    reponse = _client(promotions["m2"]).post(
        "/api/parrains/%d/demande/" % promotions["l2"].pk, format="json"
    )
    assert reponse.status_code == 422


def test_acceptation_cree_binome(api, promotions):
    client_l1 = _client(promotions["l1"])
    reponse = client_l1.post(
        "/api/parrains/%d/demande/" % promotions["l2"].pk, format="json"
    )
    acceptation = _client(promotions["l2"]).post(
        "/api/demandes/%d/repondre/" % reponse.data["id"],
        {"decision": "acceptee"},
        format="json",
    )
    assert acceptation.status_code == 200
    from comptes.models import Binome

    assert Binome.objects.filter(
        aine=promotions["l2"], cadet=promotions["l1"], statut=Binome.Statut.ACTIF
    ).exists()


# ── Règle Ivo n°1 : transition sans casser les binômes ──────────────────────
def test_transition_conserve_les_binomes(api, promotions):
    from comptes.models import Binome

    # Binôme actif Yao(L1) ↔ Ivo(L2), créé inline (sans la fixture globale).
    binome = Binome.objects.create(aine=promotions["l2"], cadet=promotions["l1"])
    admin = promotions["l2"]
    admin.is_staff = True
    admin.save()

    apercu = _client(admin).get("/api/admin/transition-apercu/").data
    decisions = {
        str(u["id"]): u["niveauSuivant"] for u in apercu["promotions"]
    }
    for fin in apercu["finsDeCycle"]:
        decisions[str(fin["id"])] = fin["niveauSuivantPropose"]

    reponse = _client(admin).post(
        "/api/admin/transition-executer/", {"decisionParUser": decisions}, format="json"
    )
    assert reponse.status_code == 200, reponse.data
    assert reponse.data["binomesConserves"] >= 1

    # LE CŒUR DE LA RÈGLE : le binôme existe TOUJOURS après la transition.
    binome.refresh_from_db()
    assert binome.statut == Binome.Statut.ACTIF


def test_transition_atomique_rien_a_moitie(api, promotions):
    admin = promotions["l2"]
    admin.is_staff = True
    admin.save()
    from comptes.models import User

    avant = {u.pk: u.niveau_etude for u in User.objects.all()}
    decisions = {"999999": "L2"}  # id inexistant → tout doit annuler
    reponse = _client(admin).post(
        "/api/admin/transition-executer/", {"decisionParUser": decisions}, format="json"
    )
    assert reponse.status_code == 422
    apres = {u.pk: u.niveau_etude for u in User.objects.all()}
    assert avant == apres  # RIEN n'a bougé


def test_non_admin_422(api, promotions):
    reponse = _client(promotions["l1"]).get("/api/admin/transition-apercu/")
    assert reponse.status_code == 422


def test_apercu_fins_de_cycle_l3_selon_intention(api, promotions):

    awa = promotions["l3"]
    awa.intention_annee_suivante = "master"
    awa.save()
    admin = promotions["l2"]
    admin.is_staff = True
    admin.save()
    apercu = _client(admin).get("/api/admin/transition-apercu/").data
    ligne_awa = next(f for f in apercu["finsDeCycle"] if f["id"] == awa.pk)
    assert ligne_awa["niveauSuivantPropose"] == "M1"
    assert ligne_awa["parDefaut"] is False
