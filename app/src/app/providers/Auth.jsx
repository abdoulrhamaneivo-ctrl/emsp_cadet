import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@shared/api/auth";
import { apiClient, definirJeton } from "@shared/api/client";

const AuthContext = createContext(null);

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

  useEffect(() => {
    if (initialUser !== undefined) return; // injection de test (même null = figé)
    let actif = true;
    // Résolution de session AU RECHARGEMENT (t5b) : l'access en mémoire est
    // mort, mais le refresh httpOnly cookie est toujours là. On tente d'abord
    // un refresh silencieux — s'il réussit, la session part avec un jeton
    // frais ; s'il échoue (401, pas de cookie), on part réellement invité.
    apiClient
      .post("/api/auth/refresh/")
      .then((r) => {
        if (r?.data?.access) definirJeton(r.data.access);
      })
      .catch(() => {}) // pas de cookie → session() renverra un invité propre
      .finally(() => {
        if (!actif) return;
        authApi
          .session()
          .then((u) => {
            if (!actif) return;
            setUser(u);
            setStatut(u ? "authentifie" : "invite");
          })
          .catch(() => {
            if (!actif) return;
            setUser(null);
            setStatut("invite");
          });
      });
    return () => {
      actif = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialUser : injection de test figée, jamais re-résolue
  }, []);

  const login = (u) => {
    setUser(u);
    setStatut("authentifie");
  };
  const logout = () => {
    setUser(null);
    setStatut("invite");
  };

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
