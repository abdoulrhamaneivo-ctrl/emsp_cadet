import { motion } from "framer-motion";
import { cx } from "@shared/utils/cx";

/**
 * Carte contenu (doc 03 §6.2). Le contenu EST la responsabilité du caller —
 * jamais vide (principe n°4 : densité de contenu).
 * @param {boolean} interactive=false — hover-lift framer-motion + curseur pointer
 */
export default function Card({ interactive = false, className, children, ...props }) {
  return (
    <motion.div
      whileHover={interactive ? { y: -4 } : undefined}
      transition={{ duration: 0.2 }}
      className={cx(
        "rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] shadow-[var(--shadow-card)] min-w-0",
        interactive && "cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
