import { motion } from "framer-motion";
import { cx } from "@shared/utils/cx";

/**
 * Interrupteur iOS — track 48×28, pouce contrasté de 22px avec ressort
 * physique (framer-motion). Remplace les checkboxes natives : un interrupteur
 * se pousse, une case à cocher demande de viser.
 * @param {boolean} checked
 * @param {function} onChange — (suivant: boolean) => void
 * @param {string} label — nom accessible (aria-label)
 */
export default function Switch({ checked = false, onChange, label, disabled = false, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cx(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)] focus-visible:ring-offset-2",
        checked
          ? "border-transparent bg-[var(--accent-green)]"
          : "border-[var(--border-structural)]/40 bg-[var(--bg-input)]",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <motion.span
        aria-hidden="true"
        animate={{ x: checked ? 23 : 3 }}
        transition={{ type: "spring", stiffness: 550, damping: 32, mass: 0.7 }}
        className={cx(
          "absolute h-[22px] w-[22px] rounded-full shadow-[0_1px_3px_rgba(13,42,24,0.35)]",
          checked ? "bg-[var(--text-on-accent)]" : "bg-[var(--text-primary)]",
        )}
      />
    </button>
  );
}
