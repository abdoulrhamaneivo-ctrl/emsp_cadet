import { cx } from "@shared/utils/cx";

/**
 * Jauge capacité RG2 (doc 03 §6.14) — 5 segments pleins/vacants + label n/5.
 * À 4/5 le dernier vacant est signalé or (avertissement « dernière place », RG2).
 * @param {number} actifs — nbCadetsActifs 0..5
 * @param {number} total=5 — quota RG2
 * @param {boolean} surFonce=false — posée sur fond vert profond (panneau
 *   signature de la fiche) : segments en vert vif, compteur crème.
 */
export default function JaugeCapacite({ actifs = 0, total = 5, surFonce = false, className }) {
  const plein = Math.min(Math.max(actifs, 0), total);
  const dernierePlace = actifs === total - 1;

  return (
    <span
      className={cx("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Capacité ${actifs} sur ${total}`}
      title={`Places de parrainage occupées : ${actifs} sur ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const rempli = i < plein;
        const pulseOr = dernierePlace && i === total - 1;
        return (
          <span
            key={i}
            aria-hidden="true"
            className={cx(
              "h-2 w-3.5 rounded-[3px] border transition-colors",
              rempli
                ? surFonce
                  ? "bg-[var(--emsp-green-bright)] border-[var(--emsp-green-bright)]"
                  : "bg-[var(--accent-green)] border-[var(--accent-green)]"
                : surFonce
                  ? "bg-transparent border-white/35"
                  : "bg-transparent border-[var(--border-structural)]/50",
              pulseOr && "bg-[var(--accent-gold)]/25 border-[var(--accent-gold)]",
            )}
          />
        );
      })}
      <span
        className={cx(
          "ml-1.5 font-mono text-[11px] font-medium tabular-nums",
          surFonce ? "text-[var(--emsp-cream)]/70" : "text-[var(--text-muted)]",
        )}
      >
        {actifs}/{total}
      </span>
    </span>
  );
}
