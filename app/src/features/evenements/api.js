import { apiClient } from "@shared/api/client";

/** Appels REST Événements (contrat doc 10 §2) — backend réel. */

export const evenementsApi = {
  async liste({ scope = "a_venir", page } = {}) {
    const { data } = await apiClient.get("/api/evenements/", {
      params: { scope, ...(page > 1 ? { page } : {}) },
    });
    return data;
  },
  async detail(id) {
    const { data } = await apiClient.get(`/api/evenements/${id}/`);
    return data;
  },
  async toggleInscription(id) {
    const { data } = await apiClient.post(`/api/evenements/${id}/inscription/`);
    return data; // { ok, inscrit }
  },
  async messages(id) {
    const { data } = await apiClient.get(`/api/evenements/${id}/messages/`);
    return data; // liste simple de commentaires
  },
  async ecrireMessage(id, contenu) {
    const { data } = await apiClient.post(`/api/evenements/${id}/messages/`, { contenu });
    return data;
  },
  async participants(id) {
    const { data } = await apiClient.get(`/api/evenements/${id}/participants/`);
    return data; // { count, results }
  },
  async creer(payload) {
    const { data } = await apiClient.post("/api/evenements/", payload);
    return data;
  },
  async modifier(id, payload) {
    const { data } = await apiClient.patch(`/api/evenements/${id}/modifier/`, payload);
    return data;
  },
};
