/** Fusion de classes utilitaire (clsx minimal, zéro dépendance). */
export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
