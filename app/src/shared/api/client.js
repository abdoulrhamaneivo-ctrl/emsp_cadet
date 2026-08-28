import axios from "axios";

/**
 * Client HTTP central (doc 19) :
 * - withCredentials : le refresh token vit dans un cookie httpOnly;
 * - interceptor 401 -> tentative de refresh -> replay de la requête ;
 * - interceptor 423 -> redirection /compte-suspendu (RG11).
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
});

/**
 * Access token EN MÉMOIRE uniquement (doc 19 §5.1 — jamais localStorage).
 * Posé par authApi.connexion / rafraîchissement, lu par l'intercepteur request.
 */
let jetonMemoire = null;

export function definirJeton(jeton) {
  jetonMemoire = jeton;
}

/** Le WS réel lit le token ici (mémoire seule — jamais sessionStorage, doc 19). */
export function obtenirJeton() {
  return jetonMemoire;
}

apiClient.interceptors.request.use((config) => {
  if (jetonMemoire) {
    config.headers.Authorization = `Bearer ${jetonMemoire}`;
  }
  return config;
});

let rafraichissementEnCours = null;

apiClient.interceptors.response.use(
  (reponse) => reponse,
  async (erreur) => {
    const { response, config } = erreur;

    if (response?.status === 423) {
      window.location.assign("/compte-suspendu");
      return Promise.reject(erreur);
    }

    // 401 : un seul essai de refresh par salve de requêtes
    if (response?.status === 401 && !config.__rejoue) {
      try {
        rafraichissementEnCours =
          rafraichissementEnCours ||
          apiClient.post("/api/auth/refresh/").finally(() => {
            rafraichissementEnCours = null;
          });
        const rafraichi = await rafraichissementEnCours;
        // Rotation : le nouvel access remplace l'ancien en mémoire.
        if (rafraichi?.data?.access) definirJeton(rafraichi.data.access);
        return apiClient({ ...config, __rejoue: true });
      } catch {
        // refresh échoué : session morte, l'app repassera en état "invite"
        definirJeton(null);
        return Promise.reject(erreur);
      }
    }

    return Promise.reject(erreur);
  },
);
