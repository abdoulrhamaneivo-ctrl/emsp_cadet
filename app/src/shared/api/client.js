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
  // Le proxy Vite forward les cookies pour le refresh token
  headers: { "Content-Type": "application/json" },
});

/**
 * Access token EN MÉMOIRE uniquement (doc 19 §5.1 — jamais localStorage).
 * Posé par authApi.connexion / rafraîchissement, lu par l'intercepteur request.
 */
let jetonMemoire = null;

// Ces routes portent leurs propres informations d'authentification (cookie
// httpOnly ou données du formulaire). Un ancien access dans Authorization ne
// doit pas empêcher le refresh, la déconnexion ou un parcours public.
const SANS_JETON_BEARER = new Set([
  "/api/auth/connexion/",
  "/api/auth/refresh/",
  "/api/auth/inscription/",
  "/api/auth/verifier-email/",
  "/api/auth/renvoyer-confirmation/",
  "/api/auth/mot-de-passe-oublie/",
  "/api/auth/verifier-lien-reinitialisation/",
  "/api/auth/reinitialiser-mot-de-passe/",
  "/api/auth/deconnexion/",
]);

export function definirJeton(jeton) {
  jetonMemoire = jeton;
}

/** Le WS réel lit le token ici (mémoire seule — jamais sessionStorage, doc 19). */
export function obtenirJeton() {
  return jetonMemoire;
}

apiClient.interceptors.request.use((config) => {
  const chemin = String(config.url ?? "").split("?")[0];
  if (jetonMemoire && !SANS_JETON_BEARER.has(chemin)) {
    config.headers.Authorization = `Bearer ${jetonMemoire}`;
  } else if (SANS_JETON_BEARER.has(chemin)) {
    // Écarte aussi un éventuel Authorization fourni par défaut par Axios.
    delete config.headers.Authorization;
  }
  return config;
});

let rafraichissementEnCours = null;

// Les points d'entrée de session peuvent renvoyer 401 sans que cela signifie
// qu'une requête métier doit être rejouée. En particulier, réessayer /refresh/
// sur son propre 401 crée une boucle infinie au premier chargement invité.
const SANS_TENTATIVE_DE_REFRESH = new Set([
  "/api/auth/refresh/",
  "/api/auth/session/",
  "/api/auth/connexion/",
  "/api/auth/inscription/",
  "/api/auth/verifier-email/",
  "/api/auth/renvoyer-confirmation/",
  "/api/auth/mot-de-passe-oublie/",
  "/api/auth/verifier-lien-reinitialisation/",
  "/api/auth/reinitialiser-mot-de-passe/",
  "/api/auth/deconnexion/",
]);

apiClient.interceptors.response.use(
  (reponse) => reponse,
  async (erreur) => {
    const { response, config } = erreur;

    if (response?.status === 423) {
      window.location.assign("/compte-suspendu");
      return Promise.reject(erreur);
    }

    // 401 : un seul essai de refresh par salve de requêtes
    const chemin = String(config?.url ?? "").split("?")[0];
    if (
      response?.status === 401 &&
      !config?.__rejoue &&
      !SANS_TENTATIVE_DE_REFRESH.has(chemin)
    ) {
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
