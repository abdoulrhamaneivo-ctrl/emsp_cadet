import { cx } from "@shared/utils/cx";

const FILTRES = [
  { valeur: "tous", libelle: "Tous" },
  { valeur: "annonce", libelle: "Annonces" },
  { valeur: "question", libelle: "Questions" },
  { valeur: "succes", libelle: "Succès" },
];

/** Segmented Tous|Annonces|Questions|Succès (doc 09 §4) — sync URL côté page. */
export default function FiltresType({ valeur, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Filtrer le fil par type"
      className="flex w-fit gap-1 rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-1 shadow-[var(--shadow-card)]"
    >
      {FILTRES.map((f) => (
        <button
          key={f.valeur}
          type="button"
          role="radio"
          aria-checked={valeur === f.valeur}
          onClick={() => onChange(f.valeur)}
          className={cx(
            "rounded-[calc(var(--radius-input)-4px)] px-3 py-1.5 text-xs font-semibold transition-colors",
            valeur === f.valeur
              ? "bg-[var(--emsp-green-deep)] text-[var(--emsp-cream)]"
              : "text-[var(--text-muted)] hover:bg-[var(--hover-bg)]",
          )}
        >
          {f.libelle}
        </button>
      ))}
    </div>
  );
}
