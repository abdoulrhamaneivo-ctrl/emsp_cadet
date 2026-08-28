/** Dates en français — Intl suffit (pas de date-fns dans le projet). */

const DF_JOUR = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const DF_JOUR_HEURE = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const DF_MOIS_ANNEE = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

/** « 2 mars 2026 » */
export function formatteurDate(iso) {
  if (!iso) return null;
  return DF_JOUR.format(new Date(iso));
}

/** « 2 mars, 15:00 » */
export function formatteurDateHeure(iso) {
  if (!iso) return null;
  return DF_JOUR_HEURE.format(new Date(iso));
}

/** « mars 2026 » */
export function formatteurMoisAnnee(iso) {
  if (!iso) return null;
  return DF_MOIS_ANNEE.format(new Date(iso));
}
