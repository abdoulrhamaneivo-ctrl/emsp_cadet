"""IA-4 — FAQ L1 (doc 17 §2).

Base de connaissances validée par l'admin — recherche par similarité simple.
Retourne réponse + sources, sinon redirige vers le Fil (bouton "Poser à la communauté").
"""

import re
from collections import Counter


_STOP = frozenset({
    "le", "la", "les", "un", "une", "des", "du", "de", "d", "l",
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
    "un", "une", "des", "au", "aux", "sur", "dans", "avec", "sans", "sous",
})


def _tokenize(texte):
    if not texte:
        return []
    mots = re.findall(r"[a-zéèêàâôùûîïç]+", texte.lower())
    return [m for m in mots if len(m) > 2 and m not in _STOP]


def _vector(texte):
    return Counter(_tokenize(texte))


def _cosinus(vec1, vec2):
    if not vec1 or not vec2:
        return 0.0
    inter = sum(min(vec1[m], vec2[m]) for m in vec1 if m in vec2)
    norm1 = sum(v * v for v in vec1.values()) ** 0.5
    norm2 = sum(v * v for v in vec2.values()) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return inter / (norm1 * norm2)


# Base de connaissances statique (V1) — remplacée par modèle admin en V2
BASE_CONNAISSANCES = [
    {
        "id": "inscription",
        "question": "Comment m'inscrire sur EMSP Connect ?",
        "reponse": "Utilise ton email @emsp.int sur la page de connexion. Le compte est créé automatiquement par l'administration. Si tu n'as pas accès, contacte le secrétariat.",
        "mots_cles": ["inscrire", "inscription", "compte", "email", "emsp", "acces", "creer", "acceder"],
        "categorie": "inscription",
    },
    {
        "id": "parrainage",
        "question": "Comment fonctionne le parrainage ?",
        "reponse": "En L1, tu peux demander un aîné de L2 via l'annuaire (onglet Suggestions). L'aîné valide ta demande → binôme actif. Tu garde ton aîné toute l'année, même en changeant de niveau.",
        "mots_cles": ["parrainage", "aine", "cadet", "annuaire", "demande", "binome", "L1", "L2"],
        "categorie": "parrainage",
    },
    {
        "id": "fil",
        "question": "C'est quoi le Fil d'actualité ?",
        "reponse": "Le Fil est l'espace d'échange public : questions, annonces, succès. Tu peux réagir (Bravo/Merci/Utile), commenter, signaler. 1 question/jour max. Les réponses sont aplaties (niveau 1).",
        "mots_cles": ["fil", "actualite", "question", "reaction", "commentaire", "signaler"],
        "categorie": "fil",
    },
    {
        "id": "evenements",
        "question": "Comment m'inscrire à un événement ?",
        "reponse": "Va dans l'onglet Événements, clique sur une carte pour voir le détail, puis 'S'inscrire'. Capacité limitée (premier arrivé). Désinscription possible jusqu'à H-2h. Discussion dédiée par événement.",
        "mots_cles": ["evenement", "inscription", "capacite", "desinscription", "discussion", "H-2h"],
        "categorie": "evenements",
    },
    {
        "id": "profil",
        "question": "Comment compléter mon profil ?",
        "reponse": "Va dans Mon profil : Identité (prénom/nom/photo), Académique (classe/filière/niveau), Attentes (visibles par les aînés), Vitrine Aîné (ambitions/projets/forces/faibles), Candidature Aîné (toggle L2+). Sauvegarde explicite via bouton Enregistrer.",
        "mots_cles": ["profil", "identite", "academique", "attentes", "vitrine", "aine", "candidature", "photo"],
        "categorie": "profil",
    },
    {
        "id": "messagerie",
        "question": "Comment fonctionne la messagerie ?",
        "reponse": "Messagerie privée réservée à ton binôme (aîné/cadet). Groupes auto : Famille (aîné + cadets) et Cercles (libres parmi tes relations). Temps réel : indicateur de frappe, double coche or (lu), bannière reconnexion.",
        "mots_cles": ["messagerie", "privee", "binome", "famille", "cercles", "temps reel", "frappe", "lu"],
        "categorie": "messagerie",
    },
    {
        "id": "rdv",
        "question": "Comment prendre un RDV avec mon aîné ?",
        "reponse": "Dans Mon parrainage ou l'onglet RDV, clique 'Proposer un créneau'. Ton aîné reçoit la notification et valide. Rappel J-1 automatique. Marquer lu = double coche or.",
        "mots_cles": ["rdv", "rendezvous", "creer", "proposer", "valider", "rappel", "lu", "coche"],
        "categorie": "rdv",
    },
    {
        "id": "admin",
        "question": "Qui sont les admins ?",
        "reponse": "L'équipe administrative de l'EMSP gère la modération, la transition annuelle, les sanctions. Contact via le Fil (tag admin) ou email direction@emsp.int.",
        "mots_cles": ["admin", "administration", "moderation", "transition", "sanction", "direction"],
        "categorie": "admin",
    },
]


def _vector_base():
    """Précalcule les vecteurs de la base."""
    for item in BASE_CONNAISSANCES:
        item["_vector"] = Counter(item["mots_cles"])
    return BASE_CONNAISSANCES


def rechercher_reponse(question, seuil=0.15):
    """Recherche la meilleure réponse dans la base (score cosinus).
    Retourne {trouve: bool, reponse: str, sources: [...], score: float} ou None.
    """
    vec_q = Counter(_tokenize(question))
    base = _vector_base()

    meilleurs = []
    for item in base:
        score = _cosinus(vec_q, item["_vector"])
        if score >= seuil:
            meilleurs.append((score, item))

    if not meilleurs:
        return {"trouve": False, "reponse": None, "sources": [], "score": 0}

    meilleurs.sort(key=lambda x: x[0], reverse=True)
    top = meilleurs[0]
    return {
        "trouve": True,
        "reponse": top[1]["reponse"],
        "sources": [top[1]["question"]],
        "score": round(top[0] * 100),
    }
