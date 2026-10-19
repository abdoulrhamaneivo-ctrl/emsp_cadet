import { AnimatePresence, motion } from "framer-motion";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@app/providers/Auth";
import { useTheme } from "@app/providers/Theme";
import Sidebar from "@layout/sidebar/Sidebar";
import ErrorBoundary from "@shared/components/ErrorBoundary";
import Avatar from "@shared/components/Avatar";
import BanniereRappel from "@features/rendez-vous/components/BanniereRappel";
import { useProchainRappel } from "@features/rendez-vous/hooks/useRendezVous";
import { pageTransition } from "@shared/motion/variants";
import menuProtege from "@/data/menu-protege.json";

function BanniereRappelAuto() {
  const { data } = useProchainRappel();
  return <BanniereRappel rdv={data?.result ?? null} />;
}

function ChargementSession() {
  return (
    <div className="app flex min-h-screen items-center justify-center px-4">
      <div className="card flex flex-col items-center gap-3 text-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--line)] border-t-[var(--pri)]" role="status" aria-label="Chargement de la session" />
        <p className="mut">Préparation de votre espace…</p>
      </div>
    </div>
  );
}

export default function ProtectedShell() {
  const { statut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (statut === "chargement") return <ChargementSession />;
  if (statut === "invite") {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  const activeMenu = [...menuProtege.data]
    .sort((a, b) => b.link.length - a.link.length)
    .find((item) => location.pathname === item.link || location.pathname.startsWith(`${item.link}/`));
  const title = location.pathname.startsWith("/administration")
    ? "Administration"
    : location.pathname.startsWith("/moderation")
      ? "Modération"
      : activeMenu?.title ?? "EMSP Connect";

  return (
    <div className="app shell">
      <Sidebar />
      <div className="col">
        <header className="top">
          <div className="ttl">{title}</div>
          <span className="top-context">École Multinationale des Postes · Abidjan</span>
          <button
            className="icb theme-toggle"
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre"}
            aria-label={theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre"}
          >
            {theme === "dark" ? <Sun className="ic" size={19} /> : <Moon className="ic" size={19} />}
          </button>
          <Link to="/profil" className="top-profile" aria-label="Ouvrir mon profil">
            <Avatar prenom={user?.prenom ?? ""} nom={user?.nom ?? ""} id={user?.id} size="sm" />
          </Link>
        </header>
        <main id="main" className="main" tabIndex={-1}>
          <ErrorBoundary label="page">
            <BanniereRappelAuto />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={location.pathname} {...pageTransition}>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
