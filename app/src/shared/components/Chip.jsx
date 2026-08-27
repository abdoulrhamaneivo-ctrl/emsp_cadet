import { cx } from "@shared/utils/cx";

const tons = {
  neutral: "bg-[var(--bg-panel-alt)] text-[var(--text-primary)] border border-[var(--border-soft)]",
  goldSoft: "bg-[var(--acc-gold-soft)] text-[var(--text-primary)] border border-[var(--acc-gold-border)]",
  success: "bg-[var(--emsp-green-bright)]/12 text-[var(--accent-green)] border border-[var(--emsp-green-bright)]/40",
  gold: "bg-[var(--emsp-gold)] text-[#16281c]",
  danger: "bg-[#b42318]/10 text-[#b42318] border border-[#b42318]/30",
  info: "bg-[#175cd3]/10 text-[#175cd3] border border-[#175cd3]/30",
};

/** Variant outline : fond transparent, couleurs du ton conservées (contraste dark). */
const tonsOutline = {
  neutral: "text-[var(--text-primary)] border-[var(--border-structural)]",
  success: "text-[var(--accent-green)] border-[var(--emsp-green-bright)]/60",
  gold: "text-[var(--accent-gold)] border-[var(--emsp-gold)]",
  danger: "text-[#b42318] border-[#b42318]/50",
  info: "text-[#175cd3] border-[#175cd3]/50",
};

/**
 * Chip (doc 03 §6.5) — meta/uppercase. Radius-chip, jamais plus grand que text-xs.
 * @param {"solid"|"outline"} variant="solid"
 * @param {"neutral"|"success"|"gold"|"danger"|"info"} tone="neutral"
 */
export default function Chip({ variant = "solid", tone = "neutral", className, children, ...props }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-[var(--radius-chip)] px-2.5 py-1 text-xs font-medium",
        variant === "outline" ? cx("bg-transparent border", tonsOutline[tone]) : tons[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
