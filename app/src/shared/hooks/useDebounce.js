import { useEffect, useState } from "react";

/** Débounce générique (filtres annuaire, recherche…). */
export function useDebounce(valeur, delaiMs = 300) {
  const [differee, setDifferee] = useState(valeur);

  useEffect(() => {
    const timer = setTimeout(() => setDifferee(valeur), delaiMs);
    return () => clearTimeout(timer);
  }, [valeur, delaiMs]);

  return differee;
}
