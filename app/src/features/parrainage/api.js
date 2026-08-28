import { apiClient } from "@shared/api/client";

/**
 * Appels API de la feature parrainage (contrat doc 05 §2).
 * Les clés TanStack Query vivent dans les hooks — ici uniquement le HTTP.
 */

/** GET /api/demandes/?sens=envoyees|recues&statut= → { count, results: DemandeParrainage[] } */
export function fetchDemandes(sens = "envoyees") {
  return apiClient.get("/api/demandes/", { params: { sens } }).then((r) => r.data);
}

/** POST /api/demandes/:id/repondre/ — body {decision, motifRefus?, partagerMotif?} */
export function repondreDemande(demandeId, decision, { motifRefus, partagerMotif } = {}) {
  return apiClient
    .post(`/api/demandes/${demandeId}/repondre/`, {
      decision,
      motifRefus: decision === "refusee" && partagerMotif ? motifRefus : undefined,
      partagerMotif: decision === "refusee" ? Boolean(partagerMotif) : undefined,
    })
    .then((r) => r.data);
}

/** PATCH /api/demandes/:id/annuler/ — demandeur, seulement statut=en_attente */
export function annulerDemande(demandeId) {
  return apiClient.patch(`/api/demandes/${demandeId}/annuler/`).then((r) => r.data);
}

/** GET /api/me/groups-resume/ → [{conversationId, type, titre, nbMembres}] (doc 13) */
export function fetchGroupsResume() {
  return apiClient.get("/api/me/groups-resume/").then((r) => r.data);
}

/** GET /api/me/rendez-vous/ → { results: RendezVous[] } — aperçu du binôme */
export function fetchMesRendezVous() {
  return apiClient.get("/api/me/rendez-vous/").then((r) => r.data);
}

/** POST /api/parrainages/:id/cloture/ — body {raison} → {avisRequis} (RG6) */
export function cloturerParrainage(parrainageId, raison = "fin_annee") {
  return apiClient.post(`/api/parrainages/${parrainageId}/cloture/`, { raison }).then((r) => r.data);
}

/** POST /api/parrainages/:id/avis/ — body {note, commentaire} → 201 | 409 (doc 07) */
export function donnerAvis(parrainageId, note, commentaire) {
  return apiClient.post(`/api/parrainages/${parrainageId}/avis/`, { note, commentaire }).then((r) => r.data);
}
