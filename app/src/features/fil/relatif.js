/** Dates relatives en français — Intl, jamais de dépendance (doc 19). */

export function ilYA(dateIso) {
  const secondes = Math.max(0, (Date.now() - new Date(dateIso).getTime()) / 1000);
  if (secondes < 60) return "à l'instant";
  const format = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  if (secondes < 3600) return format.format(-Math.floor(secondes / 60), "minute");
  if (secondes < 86400) return format.format(-Math.floor(secondes / 3600), "hour");
  if (secondes < 604800) return format.format(-Math.floor(secondes / 86400), "day");
  if (secondes < 2629800) return format.format(-Math.floor(secondes / 604800), "week");
  if (secondes < 31557600) return format.format(-Math.floor(secondes / 2629800), "month");
  return format.format(-Math.floor(secondes / 31557600), "year");
}

export function dateCourte(dateIso) {
  return new Date(dateIso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}
