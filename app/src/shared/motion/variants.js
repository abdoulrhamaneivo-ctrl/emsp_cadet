/**
 * Variantes framer-motion partagées — SOURCE UNIQUE (doc 03 §7).
 * Importer ici, ne jamais redéfinir une variante locale.
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const hoverLift = { whileHover: { y: -4 }, transition: { duration: 0.2 } };

export const pageTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { type: "tween", duration: 0.3, ease: "anticipate" },
};

export const pulseGentle = {
  animate: { scale: [1, 1.03, 1] },
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
};
