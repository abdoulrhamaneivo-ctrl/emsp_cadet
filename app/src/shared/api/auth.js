import { apiClient } from "./client";

/** Endpoints d'authentification (contrat doc 02 §5 / doc 19). */
export const authApi = {
  /** Session courante ; renvoie l'utilisateur ou null si invité. */
  session: async () => {
    try {
      const { data } = await apiClient.get("/api/auth/session/");
      return data?.estAuthentifie ? data.utilisateur : null;
    } catch {
      return null;
    }
  },
  connexion: async (identifiants) =>
    (await apiClient.post("/api/auth/connexion/", identifiants)).data,
  inscription: async (formulaire) =>
    (await apiClient.post("/api/auth/inscription/", formulaire)).data,
  deconnexion: async () => apiClient.post("/api/auth/deconnexion/"),
};
