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

/* ── RÈGLE IVO n°2 : promo devançante (t5b) ──────────────────────────────── */

const DEVANCANT = {
  L1: "L2",
  L2: "L3",
  L3: "M1",
  M1: "M2",
  M2: null,
  alumni: null,
};

/** Niveau réel du compte (champ v2, repli préfixe classe). */
export function niveauDe(utilisateur) {
  if (!utilisateur) return "L1";
  if (utilisateur.niveauEtude) return utilisateur.niveauEtude;
  const prefixe = (utilisateur.classe || "").trim().toLowerCase();
  for (const niveau of ["l2", "l3", "m1", "m2", "alumni"]) {
    if (prefixe.startsWith(niveau)) {
      return niveau === "alumni" ? "alumni" : niveau.toUpperCase();
    }
  }
  return "L1";
}

/** La promo qui peut parrainer ce niveau (ou null). */
export function promoDevancante(niveau) {
  return DEVANCANT[niveau] ?? null;
}

/** Le cadet peut-il demander CET aîné ? (garde CTA, le serveur revalide) */
export function peutDemander(niveauCadet, niveauAine) {
  return promoDevancante(niveauCadet) === niveauAine;
}

/** Message d'aide pour un CTA désactivé (doc 04 §5). */
export function raisonCTADesactive(niveauCadet) {
  const devancant = promoDevancante(niveauCadet);
  if (!devancant) {
    return "Ton niveau est le dernier du parcours — plus d'Aîné à demander.";
  }
  return `Tu ne peux demander qu'un Aîné de la promo ${devancant} — celle qui devance directement la tienne.`;
}
