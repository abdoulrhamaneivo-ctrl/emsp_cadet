import { Sparkles, X, Loader2 } from "lucide-react";
import { cx } from "@shared/utils/cx";

/** PanneauSuggestionsIA — liste de suggestions cliquables + étiquette IA.
 *  États : loading (skeleton), erreur (dégradation silencieuse → UI classique),
 *  succès (suggestions + ChipIA obligatoire sur chaque item).
 */
export default function PanneauSuggestionsIA({
  suggestions = [],
  loading = false,
  erreur = false,
  surChoix,
  libelleVide = "Aucune suggestion disponible",
  className,
}) {
  if (erreur) return null; // dégradation silencieuse — l'UI classique prend le relai

  if (loading) {
    return (
      <div className={cx("flex flex-col gap-2", className)} role="status" aria-live="polite">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-4 w-24 bg-[var(--emsp-cream)]/20 rounded" />
            <div className="h-3 w-32 bg-[var(--emsp-cream)]/10 rounded" />
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] bg-[var(--emsp-cream)]/20" />
          </div>
        ))}
      </div>
    );
  }

  if (!suggestions.length) {
    return (
      <p className={cx("text-sm text-[var(--text-muted)]", className)}>{libelleVide}</p>
    );
  }

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {suggestions.map((s, idx) => (
        <button
          key={s.id ?? idx}
          type="button"
          onClick={() => surChoix?.(s)}
          className={cx(
            "w-full flex items-start gap-3 rounded-[var(--radius-card)] p-3",
            "bg-[var(--bg-input)] border border-[var(--emsp-cream)]/20",
            "hover:bg-[var(--emsp-cream)]/10 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-gold)]"
          )}
          aria-label={`Choisir cette suggestion : ${s.texte}`}
        >
          <ChipIA />
          <span className="flex-1 text-sm text-[var(--text-primary)] leading-relaxed">
            {s.texte}
          </span>
          {s.raison && (
            <span className="flex-shrink-0 text-[10px] font-medium text-[var(--emsp-gold)] bg-[var(--emsp-cream)]/10 px-2 py-0.5 rounded-full">
              {s.raison}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}