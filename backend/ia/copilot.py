"""IA-3 — Copilot de profil (doc 17 §2).

Aide à la rédaction : à partir de 2-3 mots-clés saisis par l'utilisateur,
génère 3 propositions de phrases complètes pour attentes/ambitions/projets.
Heuristique locale (pas de fournisseur externe).
"""

import re

# Gabarits par section — structure : {mots_clés} → propositions
GABARITS = {
    "attentes": [
        "En tant que cadet, je recherche un aîné qui puisse m'accompagner sur {kw1}, {kw2} et {kw3} pour progresser dans mon parcours.",
        "Mon objectif est de développer mes compétences en {kw1} grâce au parrainage, en échangeant sur {kw2} et {kw3}.",
        "J'attends de mon aîné qu'il me guide sur {kw1}, me conseille pour {kw2} et m'ouvre son réseau sur {kw3}.",
    ],
    "ambitions": [
        "Je souhaite devenir un expert en {kw1}, en menant des projets innovants sur {kw2} et {kw3}.",
        "Mon ambition : maîtriser {kw1}, contribuer à {kw2} et partager mon savoir sur {kw3}.",
        "À terme, je veux piloter des projets autour de {kw1}, {kw2} et {kw3} pour l'école.",
    ],
    "projets": [
        "Projet en cours : {kw1} — application concrète de {kw2} avec {kw3} comme levier.",
        "Je mène un projet sur {kw1} en collaboration avec {kw2}, en explorant {kw3}.",
        "Mon projet personnel porte sur {kw1}, enrichi par {kw2} et validé par {kw3}.",
    ],
    "pointsForts": [
        "Ma force : {kw1}, que j'ai développée grâce à {kw2} et {kw3}.",
        "Je suis à l'aise avec {kw1}, {kw2} et {kw3} — compétences techniques solides.",
        "Atout majeur : {kw1}, complété par {kw2} et {kw3} pour une vision globale.",
    ],
    "pointsFaibles": [
        "Je souhaite m'améliorer sur {kw1}, en m'appuyant sur {kw2} et {kw3}.",
        "Point d'attention : {kw1} — je travaille dessus via {kw2} et {kw3}.",
        "Axes de progression : {kw1}, {kw2}, {kw3} — je suis en auto-formation.",
    ],
}

# Mots de liaison à ignorer pour l'extraction
_STOP = frozenset({
    "et", "ou", "mais", "donc", "car", "ni", "or",
    "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
    "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
    "notre", "votre", "leur", "leurs",
    "ce", "cet", "cette", "ces", "ceux", "celles",
    "qui", "que", "quoi", "dont", "où", "comment", "pourquoi",
    "au", "aux", "sur", "dans", "avec", "sans", "sous", "par", "pour",
    "est", "sont", "étais", "étaient", "ai", "as", "a", "avons", "avez", "ont",
    "veut", "veux", "veulent", "aimerai", "aimerais", "aimerait",
    "faire", "fais", "fait", "faisons", "faites", "font",
    "avoir", "être", "suis", "es", "sommes", "êtes", "sont",
    "un", "une", "des", "le", "la", "les", "du", "de", "d", "l",
})


def _extraire_mots_cles(texte, max_k=3):
    """Extrait jusqu'à 3 mots-clés significatifs (>2 chars, pas stop words)."""
    if not texte:
        return []
    mots = re.findall(r"[a-zéèêàâôùûîïç]+", texte.lower())
    # Filtre : longueur > 2, pas stop word, pas déjà vu
    vus = set()
    cles = []
    for m in mots:
        if len(m) > 2 and m not in _STOP and m not in vus:
            cles.append(m)
            vus.add(m)
            if len(cles) >= max_k:
                break
    return cles


def generer_propositions(section, mots_cles_utilisateur):
    """Retourne 3 propositions de phrases pour la section donnée.

    Args:
        section: "attentes" | "ambitions" | "projets" | "pointsForts" | "pointsFaibles"
        mots_cles_utilisateur: str (texte libre saisi par l'utilisateur, 2-3 mots)

    Returns:
        list[str] — 3 propositions prêtes à insérer
    """
    cles = _extraire_mots_cles(mots_cles_utilisateur, max_k=3)
    # Complétion si < 3 mots-clés
    while len(cles) < 3:
        cles.append("...")

    gabarits = GABARITS.get(section, GABARITS["attentes"])
    propositions = []
    for g in gabarits:
        prop = g.format(kw1=cles[0], kw2=cles[1], kw3=cles[2])
        propositions.append(prop)
    return propositions
