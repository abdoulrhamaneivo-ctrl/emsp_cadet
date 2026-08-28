/**
 * Règles de gestion parrainage — traduction front exacte (doc 05 §6 / doc 02 §3).
 * Le backend garantit ; le front les rend visibles et impossibles à contourner en UX.
 */

/** PLACES_MAX (RG2) : capacité de la facette aînée. */
export const PLACES_MAX = 5;

/** RG8 : l'onglet Reçues (et le bloc Mes cadets) n'existe que si la candidature est ouverte. */
export function peutVoirRecues(user) {
  return Boolean(user?.candidatureAineOuverte);
}

/** RG2 + RG8 : accepter exige une place libre ET la candidature ouverte. */
export function peutAccepter(user, nbCadetsActifs) {
  return peutVoirRecues(user) && (nbCadetsActifs ?? 0) < PLACES_MAX;
}

/** Une demande envoyée ne s'annule qu'en attente (doc 05 §6). */
export function peutAnnuler(demande) {
  return demande?.statut === "en_attente";
}

/** RG6 : un binôme clos attend UN avis du cadet — jamais deux. */
export function avisRequis(binome) {
  return Boolean(binome?.avisDonne === false);
}

/**
 * Facette aînée visible ? L1 jamais (RG7) ; sinon selon la candidature.
 * (les quotas RG9 comptent la facette aînée seule — pas de double-compte)
 */
export function statutFacetteAinee(user) {
  if (!user) return "inconnu";
  if (user.niveauEtude === "L1") return "l1";
  return user.candidatureAineOuverte ? "ouvert" : "ferme";
}
