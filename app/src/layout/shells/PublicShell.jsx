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
  const authExperience =
    location.pathname === "/inscription" ||
    location.pathname === "/mot-de-passe-oublie" ||
    location.pathname.startsWith("/reinitialiser-mot-de-passe/") ||
    location.pathname.startsWith("/verifier-email/");
  const lienCompte =
    location.pathname.startsWith("/reinitialiser-mot-de-passe/") ||
    location.pathname.startsWith("/verifier-email/") ||
    location.pathname === "/mot-de-passe-oublie";

  if (statut === "authentifie" && user && !lienCompte) {
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="app pub">
      <a href="#main" className="skip-link">Aller au contenu principal</a>
      {!authExperience && <NavBar />}
      <main id="main" className="public-main">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            {...pageTransition}
            className={authExperience ? "w-full" : landing ? "" : "wrap public-page"}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!authExperience && <Footer />}
    </div>
  );
}
