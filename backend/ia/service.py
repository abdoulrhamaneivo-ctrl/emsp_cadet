"""IA-1 — analyse de contenu à la soumission (doc 17 §2).

HEURISTIQUE LOCALE (doc 17 §7 : le front reste agnostique ; aucun fournisseur
externe branché en V1 — RG12.2/12.7 trivialement satisfaits : rien ne quitte
le serveur, seules Publication/Commentaire sont analysées, JAMAIS une
conversation privée).

RG12.1 : le service NE DÉCIDE RIEN — il renvoie (score, raison). C'est la
vue appelante qui dépose au mieux un fil.Signalement source IA (visible
admin), jamais un masquage automatique.
"""

import re

SEUIL_SIGNALEMENT = 55  # score ≥ 55 → signalement IA déposé (admin tranche)

# Mots à objectif commercial manifeste (spam).
_SPAM = re.compile(
    r"(gagne[sz]? de l'argent|crypto|bitcoin|trading|gratuit ici|lien sponsoris|"
    r"abonne[- ]toi|vends? (?:cours|passe|diplome)|promo exclusive|cash)",
    re.IGNORECASE,
)
# Insultes / attaque personnelle (harcèlement) — liste volontairement courte,
# l'admin tranche toujours.
_HARCELEMENT = re.compile(
    r"(idiot|imb[cé]cile|nul(le)? comme|ferme[- ]la|ta gueule|esp[èe]ce de|"
    r"harc[èe]le|menace)",
    re.IGNORECASE,
)
# Données personnelles manifestes (vie privée) — encouragement à la prudence.
_PII = re.compile(
    r"(\+225[ \d]{8,}|\b\d{10}\b|[a-z.\-]+@(?!\w*emsp\.int)[a-z.\-]+\.\w{2,})",
    re.IGNORECASE,
)


def analyser_contenu(texte):
    """Retourne {score: 0..100, raison: str|None} — l'IA propose, rien de plus.

    Plusieurs signaux se cumulent (spam 60, harcèlement 55, PII 40), plafonnés
    à 95 : jamais 100, il faut TOUJOURS une vérification humaine.
    """
    score = 0
    raisons = []
    if _SPAM.search(texte):
        score += 60
        raisons.append("Ton commercial manifeste (spam probable)")
    if _HARCELEMENT.search(texte):
        score += 55
        raisons.append("Attaque personnelle ou vocabulaire agressif")
    if _PII.search(texte):
        score += 55
        raisons.append("Données personnelles visibles (prudence)")
    if not raisons:
        return {"score": 0, "raison": None}
    return {"score": min(score, 95), "raison": " · ".join(raisons)}
