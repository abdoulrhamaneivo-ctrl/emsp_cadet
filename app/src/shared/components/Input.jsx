import { forwardRef } from "react";
import { cx } from "@shared/utils/cx";

/**
 * Champ texte (doc 03 §6.3) : fond blanc pur sur panel crème, focus vert.
 * @param {React.ElementType} leadingIcon
 * @param {React.ReactNode} trailingSlot
 * @param {boolean} invalid — bordure erreur
 */
export const Input = forwardRef(function Input(
  { leadingIcon: Icone, trailingSlot, invalid = false, className, ...props },
  ref,
) {
  return (
    <div className="relative flex items-center w-full">
      {Icone && (
        <Icone
          size={16}
          aria-hidden="true"
          className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none"
        />
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cx(
          "w-full h-11 px-3.5 text-sm rounded-[var(--radius-input)] bg-white text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
          "border bg-white",
          invalid
            ? "border-[#b42318]"
            : "border-[var(--border-soft)] focus:border-[var(--accent-green)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--emsp-green-luminous)]/20",
          Icone && "pl-10",
          trailingSlot && "pr-11",
          className,
        )}
        {...props}
      />
      {trailingSlot && <div className="absolute right-3">{trailingSlot}</div>}
    </div>
  );
});

/** Wrapper label + erreur + aide (doc 03 §6.3). */
export function FormField({ label, htmlFor, error, helperText, required = false, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-[var(--text-primary)]">
        {label}
        {required && (
          <span className="text-[var(--accent-gold)] ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-erreur` : undefined} role="alert" className="text-xs text-[#b42318]">
          {error}
        </p>
      ) : helperText ? (
        <p id={htmlFor ? `${htmlFor}-aide` : undefined} className="text-xs text-[var(--text-muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
