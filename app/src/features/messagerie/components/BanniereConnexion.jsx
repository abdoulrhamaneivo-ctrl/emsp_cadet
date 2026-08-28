import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Bannière fine « Connexion perdue » (doc 08 §5) — top du fil, danger discret.
 * La reconnexion est automatique (expo 1s→30s) ; les envois en échec sont
 * rejoués avec leurs idempotencyKeys au retour du lien.
 */
export default function BanniereConnexion({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          role="status"
          className="flex items-center justify-center gap-2 bg-[var(--danger-solid)] px-4 py-1.5 text-xs font-semibold text-white"
        >
          <WifiOff size={13} aria-hidden="true" />
          Connexion perdue — reconnexion… tes messages partent dès le retour du lien.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
