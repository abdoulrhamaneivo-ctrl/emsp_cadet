import { motion } from "framer-motion";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { pageTransition } from "@shared/motion/variants";
import NavBar from "@layout/navbar/NavBar";
import Footer from "@layout/footer/Footer";
import { useAuth } from "@app/providers/Auth";

/**
 * Shell public (visiteur non connecté) — NavBar template + footer EMSP.
 * Garde de session : un utilisateur déjà authentifié n'a rien à faire ici —
 * renvoyé vers sa destination (state.from posé par ProtectedShell, ou
 * /messagerie par défaut), sans boucle possible.
 */
export default function PublicShell() {
  const { statut, user } = useAuth();
  const location = useLocation();
  const destination = location.state?.from ?? "/messagerie";

  if (statut === "authentifie" && user) {
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="flex min-h-full flex-col">
      <NavBar />
      <main id="main" className="flex-1 pt-20 pb-10">
        <motion.div {...pageTransition}>
          <div className="mx-auto w-full max-w-7xl px-5 lg:px-10">
            <Outlet />
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
