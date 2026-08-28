import { apiClient } from "@shared/api/client";

/** Appels REST RDV (contrat doc 06 §2). */

export const rendezVousApi = {
  async liste(scope) {
    const { data } = await apiClient.get("/api/rendez-vous/", { params: { scope } });
    return data; // { count, results }
  },
  async prochainRappel() {
    const { data } = await apiClient.get("/api/rendez-vous/prochain/");
    return data; // { result: RendezVous|null }
  },
  async proposer(corps) {
    const { data } = await apiClient.post("/api/rendez-vous/", corps);
    return data;
  },
  async repondre(id, decision) {
    const { data } = await apiClient.patch(`/api/rendez-vous/${id}/repondre/`, { decision });
    return data;
  },
  async contreProposer(id, { dateHeure, lieu }) {
    const { data } = await apiClient.post(`/api/rendez-vous/${id}/contre-proposition/`, {
      dateHeure,
      lieu,
    });
    return data;
  },
  async annuler(id) {
    const { data } = await apiClient.patch(`/api/rendez-vous/${id}/annuler/`);
    return data;
  },
  async detail(id) {
    const { data } = await apiClient.get(`/api/rendez-vous/${id}/`);
    return data;
  },
  async rappelVu(id) {
    await apiClient.patch(`/api/rendez-vous/${id}/rappel-vu/`);
  },
};
