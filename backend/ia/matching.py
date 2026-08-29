"""IA-2 — Matching enrichi suggestions (doc 17 §2).

Similarité sémantique : attentes cadet ↔ vitrine aînés (ambitions, projets).
Heuristique locale (pas de fournisseur externe — RG12.2/7 trivialement satisfaits).
"""

import re
from collections import Counter


# Mots vides français (stop words) — termes trop génériques pour le matching.
_STOP = frozenset(
    {
        "le", "la", "les", "un", "une", "des", "du", "de", "d", "l",
        "et", "ou", "mais", "donc", "or", "ni", "car",
        "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
        "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
        "notre", "votre", "leur", "leurs",
        "ce", "cet", "cette", "ces", "ceux", "celles",
        "qui", "que", "quoi", "dont", "ou", "où", "comment", "pourquoi",
        "au", "aux", "sur", "dans", "avec", "sans", "sous", "par", "pour",
        "est", "sont", "étais", "étaient", "ai", "as", "a", "avons", "avez", "ont",
        "veut", "veux", "veulent", "aimerai", "aimerais", "aimerait",
        "faire", "fais", "fait", "faisons", "faites", "font",
        "avoir", "ai", "as", "a", "avons", "avez", "ont",
        "être", "suis", "es", "est", "sommes", "êtes", "sont",
        "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
    }
)


def _tokenize(texte):
    """Extrait des mots significatifs (minuscules, >2 chars, pas stop words)."""
    if not texte:
        return []
    mots = re.findall(r"[a-zéèêàâôùûîïç]+", texte.lower())
    return [m for m in mots if len(m) > 2 and m not in _STOP]


def _vector(texte):
    """Sac de mots (Counter) pour similarité cosinus."""
    return Counter(_tokenize(texte))


def _cosinus(vec1, vec2):
    """Similarité cosinus entre deux Counters (0..1)."""
    if not vec1 or not vec2:
        return 0.0
    inter = sum(min(vec1[m], vec2[m]) for m in vec1 if m in vec2)
    norm1 = sum(v * v for v in vec1.values()) ** 0.5
    norm2 = sum(v * v for v in vec2.values()) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return inter / (norm1 * norm2)


def calculer_score_matching(attentes_cadet, vitrine_aine):
    """Score de matching 0..100 entre attentes cadet et vitrine aîné.

    - attentes_cadet : str (texte libre)
    - vitrine_aine : dict {ambitions, projets, pointsForts, pointsFaibles} (listes de str)

    Pondération : ambitions 40%, projets 35%, pointsForts 15%, pointsFaibles 10%.
    """
    vec_attentes = _vector(attentes_cadet)

    scores = {}
    poids = {
        "ambitions": 0.40,
        "projets": 0.35,
        "pointsForts": 0.15,
        "pointsFaibles": 0.10,
    }

    for cle, pds in poids.items():
        corpus = " ".join(vitrine_aine.get(cle, []))
        vec_vitrine = _vector(corpus)
        sim = _cosinus(vec_attentes, vec_vitrine)
        scores[cle] = sim * 100 * pds

    total = sum(scores.values())
    return round(total * 100)  # 0..100 (facteur 100 pour affichage)


def generer_raison_ia(attentes_cadet, vitrine_aine):
    """Génère une raison humaine pour l'affichage (ex: « Proche de tes attentes : bases de données et réseaux »).

    Cherche les termes communs les plus significatifs.
    """
    vec_att = _vector(attentes_cadet)
    termes_communs = []

    for cle in ["ambitions", "projets", "pointsForts"]:
        for terme in vitrine_aine.get(cle, []):
            tok = _tokenize(terme)
            for t in tok:
                if t in vec_att and t not in termes_communs:
                    termes_communs.append(t)

    if not termes_communs:
        return "Profil complet compatible avec ta filière."

    # On prend les 3 termes les plus fréquents dans les attentes
    termes_communs.sort(key=lambda t: vec_att[t], reverse=True)
    selection = termes_communs[:3]
    return "Proche de tes attentes : " + ", ".join(selection) + "."