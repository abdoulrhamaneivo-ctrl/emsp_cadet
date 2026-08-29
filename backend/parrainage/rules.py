"""Parrainage — règles métier (docs 02/05/15 + décisions Ivo 29/08).

DEUX RÈGLES PRODUIT DURES (user, verbatim) :
1. « en fin d'année on ne perd pas ses aînés et filleuls » → la transition
   annuelle monte les niveaux mais ne touche JAMAIS comptes.Binome.
2. « on peut avoir un aîné que de la promo qui nous devance » → l'aîné doit
   être du niveau IMMÉDIATEMENT SUPÉRIEUR au cadet (L1→L2, L2→L3, L3→M1,
   M1→M2 ; M2/alumni : pas de supérieur → aucune demande possible).
"""


# Chaîne des promos : la clé garde le niveau, la valeur = niveau devançant.
DEVANCANT = {
    "L1": "L2",
    "L2": "L3",
    "L3": "M1",
    "M1": "M2",
    "M2": None,  # dernier niveau étudiant
    "alumni": None,  # hors parcours : ne « devance » personne
}


def niveau_de(user):
    """Niveau réel du compte (champ v2, repli préfixe classe — t5)."""
    return user.niveau_etude or _niveau_de_classe(user.classe)


def _niveau_de_classe(classe):
    prefixe = (classe or "").strip().lower()
    for niveau in ("l2", "l3", "m1", "m2", "alumni"):
        if prefixe.startswith(niveau):
            return niveau.upper() if niveau != "alumni" else "alumni"
    return "L1"


def promotion_devancante(niveau_cadet):
    """Le niveau qui peut parrainer ce cadet (ou None)."""
    return DEVANCANT.get(niveau_cadet, None)


def peut_parrainer(cadet, aine):
    """Règle « promo devançante » : l'aîné doit être du niveau EXACT
    immédiatement supérieur. L1→L2 ✓ ; L1→L3 ✗ (trop loin)."""
    return promotion_devancante(niveau_de(cadet)) == niveau_de(aine)


def quotas(cadet, aine):
    """RG9 — quotas séparés par casquette (doc 02)."""
    return {"maxCadets": 5}


def verifie_engagements(cadet):
    """RG1 — un seul aîné actif OU demande en attente à la fois."""
    from .models import Demande

    if BinomeActif(cadet).exists():
        raise ErreurParrainage("RG1 : tu as déjà un Aîné actif.")
    if (
        Demande.objects.filter(cadet=cadet, statut=Demande.Statut.EN_ATTENTE)
        .exists()
    ):
        raise ErreurParrainage("RG1 : une demande est déjà en attente.")


def BinomeActif(cadet):
    from comptes.models import Binome

    return Binome.objects.filter(cadet=cadet, statut=Binome.Statut.ACTIF)


def verifie_quota(aine):
    """RG3 — l'aîné a-t-il une place (quota RG9) ?"""
    from comptes.models import Binome

    if Binome.objects.filter(aine=aine, statut=Binome.Statut.ACTIF).count() >= 5:
        raise ErreurParrainage("RG3 : cet Aîné accompagne déjà 5 cadets.")


class ErreurParrainage(Exception):
    """Règle métier violée — la vue la traduit en ErreurValidation 422."""
