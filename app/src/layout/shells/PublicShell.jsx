import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import { pageTransition } from "@shared/motion/variants";
import NavBar from "@layout/navbar/NavBar";
import Footer from "@layout/footer/Footer";

/** Shell public (visiteur non connecté) — NavBar template + footer EMSP. */
export default function PublicShell() {
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
