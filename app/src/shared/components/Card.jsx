import { motion } from "framer-motion";
import { cx } from "@shared/utils/cx";

/**
 * Carte contenu (doc 03 §6.2). Le contenu EST la responsabilité du caller —
 * jamais vide (principe n°4 : densité de contenu).
 * @param {boolean} interactive=false — hover-lift framer-motion + curseur pointer + ombre portée
 * @param {boolean} accent=false — liseré or 3px en haut (identité kente, panneaux prioritaires)
 */
export default function Card({ interactive = false, accent = false, className, children, ...props }) {
  return (
    <motion.div
      whileHover={interactive ? { y: -6 } : undefined}
      transition={{ duration: 0.2 }}
      className={cx(
        "relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] shadow-[var(--shadow-card)] min-w-0",
        interactive && "cursor-pointer transition-shadow duration-200 hover:shadow-lg",
        accent &&
          "before:absolute before:inset-x-0 before:top-0 before:z-[1] before:h-[3px] before:bg-[var(--emsp-gold)]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
