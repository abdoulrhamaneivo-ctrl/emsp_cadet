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
    (await apiClient.post("/api/auth/inscription/", formulaire, {
      // Laisser le navigateur ajouter le boundary multipart au formulaire fichier.
      headers: { "Content-Type": undefined },
    })).data,
  verifierEmail: async (uid, token) =>
    (await apiClient.post("/api/auth/verifier-email/", { uid, token })).data,
  renvoyerConfirmation: async (email) =>
    (await apiClient.post("/api/auth/renvoyer-confirmation/", { email })).data,
  demanderReinitialisation: async (email) =>
    (await apiClient.post("/api/auth/mot-de-passe-oublie/", { email })).data,
  verifierLienReinitialisation: async ({ uid, token }) =>
    (await apiClient.post("/api/auth/verifier-lien-reinitialisation/", { uid, token })).data,
  reinitialiserMotDePasse: async ({ uid, token, password }) =>
    (await apiClient.post("/api/auth/reinitialiser-mot-de-passe/", { uid, token, password })).data,
  changerMotDePasse: async ({ currentPassword, newPassword }) =>
    (await apiClient.post("/api/auth/changer-mot-de-passe/", { currentPassword, newPassword })).data,
  deconnexion: async () => {
    definirJeton(null);
    return apiClient.post("/api/auth/deconnexion/");
  },
};
