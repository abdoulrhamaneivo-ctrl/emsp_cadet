import { apiClient } from "@shared/api/client";

/** Appels REST du Fil (contrat doc 09 §2) — backend réel, pas de mocks. */

export const filApi = {
  async publications({ type, page } = {}) {
    const { data } = await apiClient.get("/api/publications/", {
      params: { ...(type ? { type } : {}), ...(page > 1 ? { page } : {}) },
    });
    return data; // { count, results }
  },
  async publier(type, contenu) {
    const { data } = await apiClient.post("/api/publications/", { type, contenu });
    return data;
  },
  async modifier(publicationId, contenu) {
    const { data } = await apiClient.patch(`/api/publications/${publicationId}/`, { contenu });
    return data;
  },
  async supprimer(publicationId) {
    const { data } = await apiClient.delete(`/api/publications/${publicationId}/`);
    return data;
  },
  async reagir(publicationId, code) {
    const { data } = await apiClient.post(`/api/publications/${publicationId}/reactions/`, {
      code,
    });
    return data; // { ok, maReaction }
  },
  async commentaires(publicationId) {
    const { data } = await apiClient.get(`/api/publications/${publicationId}/commentaires/`);
    return data; // { count, results }
  },
  async commenter(publicationId, contenu, idempotencyKey, parentId) {
    const { data } = await apiClient.post(
      `/api/publications/${publicationId}/commentaires/`,
      { contenu, idempotencyKey, ...(parentId ? { parentId } : {}) },
    );
    return data;
  },
  async supprimerCommentaire(commentaireId) {
    const { data } = await apiClient.delete(`/api/commentaires/${commentaireId}/`);
    return data;
  },
  async signaler(contentType, objectId, raison) {
    const { data } = await apiClient.post("/api/signalements/", {
      contentType,
      objectId,
      raison,
    });
    return data;
  },
  async questionsRestantes() {
    const { data } = await apiClient.get("/api/publications/questions-restantes/");
    return data; // { restantes }
  },
};
