/**
 * Variantes framer-motion partagées — SOURCE UNIQUE (doc 03 §7).
 * Importer ici, ne jamais redéfinir une variante locale.
 *
 * Barre qualité « iPhone » : des ressorts physiques, jamais des durées
 * linéaires — l'interface répond comme un objet massif, pas comme un slide.
 * Reduced motion est géré globalement (globals.css + motion-reduce).
 */

/** Ressort standard : apparitions de contenu, entrées de listes. */
export const ressortStandard = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };

export const fadeInUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: ressortStandard,
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: ressortStandard,
};

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.25, 0.8, 0.3, 1] },
};
