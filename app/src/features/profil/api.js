import { apiClient } from "@shared/api/client";

/** Appels REST Profil (contrat doc 11 §2) — backend réel. */

export const profilApi = {
  async moi() {
    const { data } = await apiClient.get("/api/me/");
    return data;
  },
  async modifier(payload) {
    const { data } = await apiClient.patch("/api/me/", payload);
    return data; // + promotionDisponible (toast-action doc 11 §5)
  },
  async visibilite() {
    const { data } = await apiClient.get("/api/me/visibilite-annuaire/");
    return data; // { visible, motifs }
  },
  async preferencesIA() {
    const { data } = await apiClient.get("/api/me/preferences-ia/");
    return data; // { matchingEnrichi: boolean, copilot: boolean }
  },
  async copilot(section, motsCles) {
    const { data } = await apiClient.post("/api/me/copilot/", {
      section,
      motsCles,
    });
    return data; // { propositions: [...] }
  },
  async photo(fichier) {
    const corps = new FormData();
    corps.append("photo", fichier);
    const { data } = await apiClient.post("/api/me/photo/", corps, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data; // { photoUrl }
  },
  async supprimerCompte(confirmationPrenom) {
    const { data } = await apiClient.delete("/api/me/compte/", {
      data: { confirmationPrenom },
    });
    return data;
  },
};
