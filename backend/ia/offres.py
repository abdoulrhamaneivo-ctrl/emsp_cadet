"""IA-6 — Aide rédaction offres alumni (doc 17 §2).

Structure suggérée à partir du type d'offre : mission, profil recherché, modalités.
Gabarits par type d'offre : stage, alternance, CDI, CDD, freelance, bénévolat.
"""

GABARITS_OFFRES = {
    "stage": {
        "mission": [
            "Accompagner l'équipe {equipe} sur {projet} : {taches_principales}.",
            "Participer à {projet} en {domaine} : analyse, conception, tests.",
            "Contribuer à {projet} sous la supervision de {tuteur} : {taches}.",
        ],
        "profil": [
            "Étudiant(e) en {formation} (L3/M1/M2) — {competences_requises} appréciées.",
            "Curieux(se), rigoureux(se), envie d'apprendre — {competences} un plus.",
            "Bac+3/4/5 en {formation} — autonomie, esprit d'équipe, {competences}.",
        ],
        "modalites": [
            "Durée : {duree} mois — début {mois} — indemnité {montant}€/mois + tickets resto.",
            "{duree} mois à temps plein — {montant}€/mois — télétravail partiel possible.",
            "Stage {duree} mois — {montant}€/mois — encadrement par {tuteur}.",
        ],
    },
    "alternance": {
        "mission": [
            "En alternance sur {projet} : {taches_principales} — rythme école/entreprise.",
            "Participer à {projet} en {domaine} — montée en compétences progressive.",
            "Intégrer l'équipe {equipe} sur {projet} — missions réelles, responsabilité.",
        ],
        "profil": [
            "Étudiant(e) en {formation} (Bac+3 à Bac+5) — contrat d'apprentissage ou pro.",
            "{competences_requises} — motivation, rigueur, esprit d'équipe.",
            "Bac+3/4/5 en {formation} — {competences} — éligible contrat alternance.",
        ],
        "modalites": [
            "Contrat {duree} ans — salaire % SMIC selon âge/niveau — rythme {rythme}.",
            "Alternance {duree} ans — {rythme} — salaire selon grille + avantages.",
            "Contrat apprentissage/pro {duree} ans — {rythme} — rémunération légale.",
        ],
    },
    "cdi": {
        "mission": [
            "Rejoindre l'équipe {equipe} comme {poste} : {taches_principales}.",
            "Piloter {projet} en {domaine} : {taches} — autonomie et responsabilité.",
            "Renforcer l'équipe {equipe} sur {domaine} : {taches} — impact direct.",
        ],
        "profil": [
            "Expérience {annees} ans en {domaine} — {competences_requises} — autonomie.",
            "Expertise {domaine} — {competences} — leadership technique apprécié.",
            "{annees}+ ans d'expérience — {competences} — vision produit, rigueur.",
        ],
        "modalites": [
            "CDI temps plein — {salaire}k€ brut/an — télétravail {telework} — avantages.",
            "CDI — {salaire}k€ — {telework} — mutuelle, tickets, formation, RTT.",
            "CDI temps plein — package {salaire}k€ — flexibilité — évolution possible.",
        ],
    },
    "cdd": {
        "mission": [
            "Remplacement / surcroît sur {projet} : {taches_principales} — durée {duree} mois.",
            "Mission {duree} mois sur {projet} : {taches} — livrables définis.",
            "Renfort équipe {equipe} — {taches} — {duree} mois renouvelable.",
        ],
        "profil": [
            "Expérience {annees} ans en {domaine} — {competences_requises} — dispo rapide.",
            "{competences} — adaptabilité, autonomie — {annees} ans expé.",
            "Profil senior/junior accepté — {competences} — mobilisable sous {delai}.",
        ],
        "modalites": [
            "CDD {duree} mois — {salaire}k€ brut/an prorata — {telework} possible.",
            "CDD {duree} mois — {salaire}k€ — renouvelable — tickets, mutuelle.",
            "CDD {duree} mois — {salaire}k€ — fin de mission claire — avantages.",
        ],
    },
    "freelance": {
        "mission": [
            "Mission {duree} mois — {projet} : {taches_principales} — livrables définis.",
            "Intervention {duree} mois sur {projet} : {taches} — expertise {domaine}.",
            "Renfort ponctuel {duree} mois — {taches} — démarrage rapide.",
        ],
        "profil": [
            "Expert {domaine} — {competences} — {annees}+ ans expé — portfolio solide.",
            "Freelance confirmé — {competences} — autonomie totale — réactivité.",
            "Indépendant — {competences} — facturation {tj}€/jour — dispo {dispo}.",
        ],
        "modalites": [
            "Mission {duree} mois — {tj}€/jour — facturation mensuelle — démarrage {dispo}.",
            "Freelance {duree} mois — {tj}€/jour — CESU/portage — télétravail total.",
            "Contrat {duree} mois — {tj}€/HT/jour — règlement 30j — outils fournis.",
        ],
    },
    "benevolat": {
        "mission": [
            "Soutenir {association} sur {projet} : {taches_principales} — impact social.",
            "Contribuer à {projet} : {taches} — valeurs partagées, engagement.",
            "Rejoindre l'équipe bénévole sur {projet} : {taches} — convivialité.",
        ],
        "profil": [
            "Motivé(e), disponible {dispo} — {competences} bienvenues — esprit équipe.",
            "Sensible à {cause} — {competences} utiles — bienveillance, fiabilité.",
            "Envie d'agir — {competences} — {dispo} — pas d'expérience requise.",
        ],
        "modalites": [
            "Bénévolat — {dispo} — pas de rémunération — frais remboursés — assurance.",
            "Bénévolat flexible — {dispo} — remboursement frais — équipe accueillante.",
            "Engagement {duree} — {dispo} — pas de salaire — indemnités frais — convivialité.",
        ],
    },
}


def generer_propositions_offre(type_offre, variables):
    """Génère 3 propositions par section (mission, profil, modalités) pour une offre.

    Args:
        type_offre: "stage" | "alternance" | "cdi" | "cdd" | "freelance" | "benevolat"
        variables: dict avec clés selon le type (equipe, projet, taches_principales,
                   domaine, formation, competences_requises, competences, duree, mois,
                   montant, tuteur, annees, salaire, telework, rythme, tj, dispo, etc.)

    Returns:
        dict {mission: [...], profil: [...], modalites: [...]} — 3 propositions par section
    """
    gabarits = GABARITS_OFFRES.get(type_offre, GABARITS_OFFRES["cdi"])

    def formater_liste(liste_gabarits):
        propositions = []
        for g in liste_gabarits:
            try:
                prop = g.format(**variables)
            except KeyError:
                # Remplacer les manquants par "..."
                prop = g
                for cle in ["equipe", "projet", "taches_principales", "domaine", "formation",
                            "competences_requises", "competences", "duree", "mois", "montant",
                            "tuteur", "annees", "salaire", "telework", "rythme", "tj", "dispo",
                            "association", "cause", "poste", "taches", "competences_requises",
                            "competences", "competences", "annees", "telework", "tj", "dispo",
                            "association", "cause", "valeurs"]:
                    prop = prop.replace("{" + cle + "}", "...")
            propositions.append(prop)
        return propositions

    return {
        "mission": formater_liste(gabarits["mission"]),
        "profil": formater_liste(gabarits["profil"]),
        "modalites": formater_liste(gabarits["modalites"]),
    }