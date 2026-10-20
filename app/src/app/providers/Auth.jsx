import { createContext, useContext, useEffect, useRef, useState } from "react";
import { authApi } from "@shared/api/auth";
import { apiClient, definirJeton } from "@shared/api/client";

const AuthContext = createContext(null);
const CLE_DECONNEXION = "emsp-connect:deconnecte";

function lireMarqueurDeconnexion() {
  try {
    return Boolean(window.localStorage.getItem(CLE_DECONNEXION));
  } catch {
    return false;
  }
}

function ecrireMarqueurDeconnexion(valeur) {
  try {
    if (valeur) window.localStorage.setItem(CLE_DECONNEXION, String(Date.now()));
    else window.localStorage.removeItem(CLE_DECONNEXION);
  } catch {
    // L'état local et la révocation serveur restent prioritaires si le stockage est bloqué.
  }
}

/**
 * État d'authentification global.
 * Sécurité (doc 19) : access token en mémoire uniquement, refresh en cookie
 * httpOnly — JAMAIS localStorage.
 * initialUser : injection pour les tests (vitest) — production : session API.
 */
export function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser ?? null);
  const [statut, setStatut] = useState(
    initialUser !== undefined ? "authentifie" : "chargement",
  ); // chargement | authentifie | invite
  const revisionSession = useRef(0);
  const resolutionEnCours = useRef(null);

  useEffect(() => {
    if (initialUser !== undefined) return; // injection de test (même null = figé)
    let actif = true;
    const revision = ++revisionSession.current;
    // Résolution de session AU RECHARGEMENT (t5b) : l'access en mémoire est
    // mort, mais le refresh httpOnly cookie est toujours là. On tente d'abord
    // un refresh silencieux — s'il réussit, la session part avec un jeton
    // frais ; s'il échoue (401, pas de cookie), on part réellement invité.
    const resolution = (async () => {
      // Après une déconnexion explicite, le cookie ne doit jamais restaurer la
      // session au rechargement, même si l'appel réseau de révocation a échoué.
      if (lireMarqueurDeconnexion()) return null;
      try {
        const reponse = await apiClient.post("/api/auth/refresh/");
        if (reponse?.data?.access) definirJeton(reponse.data.access);
      } catch {
        // Pas de cookie valide : la requête session ci-dessous confirme l'état invité.
      }
      return authApi.session();
    })();
    resolutionEnCours.current = resolution;
    resolution
      .then((u) => {
        if (!actif || revisionSession.current !== revision) return;
        setUser(u);
        setStatut(u ? "authentifie" : "invite");
      })
      .catch(() => {
        if (!actif || revisionSession.current !== revision) return;
        setUser(null);
        setStatut("invite");
      })
      .finally(() => {
        if (resolutionEnCours.current === resolution) resolutionEnCours.current = null;
      });
    return () => {
      actif = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialUser : injection de test figée, jamais re-résolue
  }, []);

  const login = (u) => {
    revisionSession.current += 1;
    ecrireMarqueurDeconnexion(false);
    setUser(u);
    setStatut("authentifie");
  };
  const logout = async () => {
    revisionSession.current += 1;
    ecrireMarqueurDeconnexion(true);
    definirJeton(null);
    setUser(null);
    setStatut("invite");
    // Termine d'abord tout refresh déjà lancé puis révoque le cookie côté API.
    // Le marqueur local protège entre-temps contre une reconnexion silencieuse.
    try {
      await resolutionEnCours.current;
    } catch {
      // Une session qui se résout mal ne doit pas empêcher la déconnexion.
    }
    try {
      await authApi.deconnexion();
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const synchroniserDeconnexion = (event) => {
      if (event.key !== CLE_DECONNEXION || !event.newValue) return;
      revisionSession.current += 1;
      definirJeton(null);
      setUser(null);
      setStatut("invite");
    };
    window.addEventListener("storage", synchroniserDeconnexion);
    return () => window.removeEventListener("storage", synchroniserDeconnexion);
  }, []);

  return (
    <AuthContext.Provider value={{ user, statut, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
