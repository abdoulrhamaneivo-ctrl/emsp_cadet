import { motion } from "framer-motion";
import { pageTransition } from "@shared/motion/variants";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@app/providers/Auth";
import Sidebar from "@layout/sidebar/Sidebar";
import ErrorBoundary from "@shared/components/ErrorBoundary";
import BanniereRappel from "@features/rendez-vous/components/BanniereRappel";
import { useProchainRappel } from "@features/rendez-vous/hooks/useRendezVous";

/** Bannière J-1 auto-portée par le shell (doc 06 §6) — null si aucun rappel. */
function BanniereRappelAuto() {
  const { data } = useProchainRappel();
  return <BanniereRappel rdv={data?.result ?? null} />;
}

/**
 * Shell protégé (doc 03 §4) : sidebar 260px desktop, contenu max-w-7xl,
 * garde de session (invite → /connexion).
 */
export default function ProtectedShell() {
  const { statut } = useAuth();
  const location = useLocation();

  if (statut === "chargement") {
    return (
      <div className="flex min-h-full items-center justify-center">
        <span
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--emsp-cream)]/20 border-t-[var(--emsp-gold)]"
          role="status"
          aria-label="Chargement de la session"
        />
      </div>
    );
  }

  if (statut === "invite") {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-full lg:pl-[260px] pb-20 lg:pb-0">
      <Sidebar />
      <main id="main">
        <ErrorBoundary label="page">
          <BanniereRappelAuto />
          <motion.div {...pageTransition}>
            <div className="mx-auto w-full max-w-7xl px-5 py-6 lg:px-10 lg:py-8">
              <Outlet />
            </div>
          </motion.div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
