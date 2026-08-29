/**
 * Règles de gestion annuaire — traduction front exacte (doc 04 / doc 02 §3).
 * Le backend garantit ; le front les rend visibles et impossibles à contourner en UX.
 */
import { niveauDe, peutDemander, raisonCTADesactive } from "@features/parrainage/rules";

/** RG2/RG3 : un Aîné à 5/5 est complet. */
export function estComplet(aine) {
  return (aine?.nbCadetsActifs ?? 0) >= 5;
}

/**
 * RG1 + RG3 + RÈGLE IVO n°2 (promo devançante) : peut-on envoyer une demande
 * à cet Aîné ?
 * @param {import("@shared/types/models").ProfilAine|null} aine
 * @param {import("@shared/types/models").MonParrainage|null} monParrainage
 * @param {{niveauEtude?: string, classe?: string}|null} cadet — l'utilisateur connecté
 * @returns {{ok: boolean, code: "ok"|"deja_engage"|"attente"|"plein"|"mauvaise_promo"|"introuvable", raison: string|null}}
 */
export function canRequest(aine, monParrainage, cadet = null) {
  if (!aine) {
    return { ok: false, code: "introuvable", raison: "Cet Aîné est introuvable." };
  }
  if (estComplet(aine)) {
    return {
      ok: false,
      code: "plein",
      raison: `${aine.prenom} accompagne déjà 5 cadets. Reviens dès qu'une place se libère.`,
    };
  }
  if (monParrainage?.binomeActif) {
    return {
      ok: false,
      code: "deja_engage",
      raison: "Tu es déjà accompagné(e) — un seul Aîné actif à la fois (RG1).",
    };
  }
  if (monParrainage?.demandeEnAttente) {
    return {
      ok: false,
      code: "attente",
      raison: "Tu as déjà une demande en attente de réponse. Annule-la avant d'en envoyer une autre.",
    };
  }
  // RÈGLE IVO n°2 — promo devançante uniquement (serveur revalide en 422).
  if (cadet && !peutDemander(niveauDe(cadet), aine.niveauEtude)) {
    return { ok: false, code: "mauvaise_promo", raison: raisonCTADesactive(niveauDe(cadet)) };
  }
  return { ok: true, code: "ok", raison: null };
}

/** RG2 : à 4/5, avertissement visuel subtil « dernière place ». */
export function estDernierePlace(aine) {
  return aine?.nbCadetsActifs === 4;
}

/** RG10 : chip signature alumni. */
export function estAlumni(aine) {
  return aine?.niveauEtude === "alumni";
}
