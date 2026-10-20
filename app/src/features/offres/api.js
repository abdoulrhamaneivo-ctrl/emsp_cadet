import { apiClient } from "@shared/api/client";

export const offresApi = {
  lister: (params = {}) => apiClient.get("/api/offres/", { params }).then((r) => r.data),
  detail: (id) => apiClient.get(`/api/offres/${id}/`).then((r) => r.data),
  candidatures: (id) => apiClient.get(`/api/offres/${id}/candidatures/`).then((r) => r.data),
  creer: (offre) => apiClient.post("/api/offres/", offre).then((r) => r.data),
  genererIA: (typeOffre, variables) =>
    apiClient.post("/api/offres/generer/", { typeOffre, variables }).then((r) => r.data),
  candidater: (id, candidature = {}) =>
    apiClient.post(`/api/offres/${id}/candidater/`, candidature).then((r) => r.data),
};
