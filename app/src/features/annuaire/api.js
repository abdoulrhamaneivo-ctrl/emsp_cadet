import { apiClient } from "@shared/api/client";

/**
 * Appels API de la feature annuaire (contrat doc 04 §2).
 * Les clés TanStack Query vivent dans les hooks — ici uniquement le HTTP.
 */

/** GET /api/parrains/?filiere=&classe=&q=&page=&inclureComplets= → { count, results: ProfilAine[] } */
export function fetchParrains(filtres = {}) {
  return apiClient
    .get("/api/parrains/", {
      params: {
        q: filtres.q || undefined,
        filiere: filtres.filiere || undefined,
        classe: filtres.classe || undefined,
        page: filtres.page && filtres.page > 1 ? filtres.page : undefined,
        inclureComplets: filtres.inclureComplets ? "true" : undefined,
      },
    })
    .then((r) => r.data);
}

/** GET /api/parrains/suggestions/ → { results: ProfilAine[] } (max 3, raisonIA doc 04 §9) */
export function fetchSuggestions() {
  return apiClient.get("/api/parrains/suggestions/").then((r) => r.data);
}

/** GET /api/parrains/:id/ → ProfilAine (badges, score, nbAvis) */
export function fetchParrain(id) {
  return apiClient.get(`/api/parrains/${id}/`).then((r) => r.data);
}

/** GET /api/me/parrainage/ → MonParrainage (RG1) */
export function fetchMonParrainage() {
  return apiClient.get("/api/me/parrainage/").then((r) => r.data);
}

/** POST /api/parrains/:id/demande/ → 201 DemandeParrainage | 409 (RG1/RG3) */
export function envoyerDemande(parrainId, message) {
  return apiClient.post(`/api/parrains/${parrainId}/demande/`, { message: message || undefined });
}

/** DELETE /api/demandes/:id/ → 204 (annulation d'une demande en attente) */
export function annulerDemande(demandeId) {
  return apiClient.delete(`/api/demandes/${demandeId}/`);
}
