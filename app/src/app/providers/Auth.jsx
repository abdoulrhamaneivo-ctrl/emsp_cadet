import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@shared/api/auth";

const AuthContext = createContext(null);

/**
 * État d'authentification global.
 * Sécurité (doc 19) : access token en mémoire uniquement, refresh en cookie
 * httpOnly — JAMAIS localStorage.
 * initialUser : injection pour les tests (vitest) — production : session MSW/API.
 * Note démo T0 : VITE_DEMO_SESSION=1 pré-authentifie via le mock MSW pour
 * vérifier le shell protégé ; retiré en T1 au branchement de LoginPage.
 */
export function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser ?? null);
  const [statut, setStatut] = useState(initialUser ? "authentifie" : "chargement"); // chargement | authentifie | invite

  useEffect(() => {
    if (initialUser) return; // injection de test : ne jamais résoudre la session par-dessus
    if (import.meta.env.VITE_DEMO_SESSION === "1") {
      // Session de démo : l'utilisateur mocké par MSW
      setUser(window.__sessionDemo ?? {
        id: 1, prenom: "Ivo", nom: "Abdoul", isAdmin: false,
        niveauEtude: "L2", classe: "L2 Digitalisation",
        candidatureAineOuverte: true,
      });
      setStatut("authentifie");
      return;
    }
    let actif = true;
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
