import { apiClient, definirJeton } from "./client";

/** Endpoints d'authentification (contrat doc 02 §5 / doc 19 / doc 21 §6). */
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
  connexion: async (identifiants) => {
    const { data } = await apiClient.post("/api/auth/connexion/", identifiants);
    // Access token en mémoire (jamais localStorage — doc 19 §5.1) ; le refresh
    // repart en cookie httpOnly posé par le backend.
    definirJeton(data.access);
    return data;
  },
  inscription: async (formulaire) =>
    (await apiClient.post("/api/auth/inscription/", formulaire)).data,
  deconnexion: async () => {
    definirJeton(null);
    return apiClient.post("/api/auth/deconnexion/");
  },
};
