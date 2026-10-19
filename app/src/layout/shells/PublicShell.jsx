import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import NavBar from "@layout/navbar/NavBar";
import Footer from "@layout/footer/Footer";
import { useAuth } from "@app/providers/Auth";
import { pageTransition } from "@shared/motion/variants";

export default function PublicShell() {
  const { statut, user } = useAuth();
  const location = useLocation();
  const destination = location.state?.from ?? "/messagerie";
  const landing = location.pathname === "/";

  if (statut === "authentifie" && user) {
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="app pub">
      <a href="#main" className="skip-link">Aller au contenu principal</a>
      <NavBar />
      <main id="main" className="public-main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={location.pathname} {...pageTransition} className={landing ? "" : "wrap public-page"}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
