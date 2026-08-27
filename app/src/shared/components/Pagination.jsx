import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@shared/utils/cx";

/** Pages affichées : 1 … p-1 p p+1 … N (ellipsis au-delà de 7). */
function listePages(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const sortie = [1];
  if (page > 3) sortie.push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p += 1) {
    sortie.push(p);
  }
  if (page < total - 2) sortie.push("…");
  sortie.push(total);
  return sortie;
}

/**
 * Pagination (doc 03 §6.9) — prev/next ronds outline, chiffres, ellipsis.
 * @param {number} page @param {number} pageCount @param {function} onChange
 * @param {number|null} totalElements — libellé « N éléments »
 */
export default function Pagination({ page, pageCount, onChange, totalElements = null, className }) {
  if (!pageCount || pageCount <= 1) {
    if (totalElements == null) return null;
    return (
      <p className={cx("text-center text-xs text-[var(--text-muted)]", className)}>
        {totalElements} élément{totalElements > 1 ? "s" : ""}
      </p>
    );
  }

  const allerA = (p) => {
    if (p >= 1 && p <= pageCount && p !== page) onChange(p);
  };

  return (
    <nav className={cx("flex flex-wrap items-center justify-center gap-2", className)} aria-label="Pagination">
      {totalElements != null && (
        <span className="mr-2 text-xs text-[var(--text-muted)]">
          {totalElements} élément{totalElements > 1 ? "s" : ""}
        </span>
      )}
      <button
        type="button"
        onClick={() => allerA(page - 1)}
        disabled={page <= 1}
        aria-label="Page précédente"
        className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[var(--border-structural)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)] focus-visible:ring-offset-2"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {listePages(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`points-${i}`} className="px-1 text-sm text-[var(--text-muted)]" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => allerA(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={cx(
              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)] focus-visible:ring-offset-2",
              p === page
                ? "bg-[var(--accent-green)] text-[var(--emsp-cream)]"
                : "border-[1.5px] border-transparent text-[var(--text-primary)] hover:bg-[var(--hover-bg)]",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => allerA(page + 1)}
        disabled={page >= pageCount}
        aria-label="Page suivante"
        className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-[var(--border-structural)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)] focus-visible:ring-offset-2"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
