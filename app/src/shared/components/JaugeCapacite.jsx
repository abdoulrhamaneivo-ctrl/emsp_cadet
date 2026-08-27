import { cx } from "@shared/utils/cx";

/**
 * Jauge capacité RG2 (doc 03 §6.14) — 5 segments pleins/vacants + label n/5.
 * À 4/5 le dernier vacant pulse or subtil (avertissement « dernière place », RG2).
 * @param {number} actifs — nbCadetsActifs 0..5
 * @param {number} total=5 — quota RG2
 */
export default function JaugeCapacite({ actifs = 0, total = 5, className }) {
  const plein = Math.min(Math.max(actifs, 0), total);
  const dernierePlace = actifs === total - 1;

  return (
    <span
      className={cx("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Capacité ${actifs} sur ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const rempli = i < plein;
        const pulseOr = dernierePlace && i === total - 1;
        return (
          <span
            key={i}
            aria-hidden="true"
            className={cx(
              "h-2.5 w-4 rounded-[3px] border transition-colors",
              rempli
                ? "bg-[var(--accent-green)] border-[var(--accent-green)]"
                : "bg-transparent border-[var(--border-structural)]/50",
              pulseOr && "bg-[var(--accent-gold)]/25 border-[var(--accent-gold)]",
            )}
          />
        );
      })}
      <span className="ml-1 font-mono text-xs text-[var(--text-muted)]">
        {actifs}/{total}
      </span>
    </span>
  );
}
