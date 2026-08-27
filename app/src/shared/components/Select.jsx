import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@shared/utils/cx";

/**
 * Select natif habillé aux tokens (filtres simples — doc 03 §5 : MUI réservé
 * aux selects recherche/autocomplete). @param {{value: string, label: string}[]} options
 */
export const Select = forwardRef(function Select({ label, options = [], className, ...props }, ref) {
  return (
    <div className={cx("relative", className)}>
      <select
        ref={ref}
        aria-label={label}
        className="h-11 w-full appearance-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] pl-3.5 pr-9 text-sm text-[var(--text-primary)] focus:border-[var(--accent-green)] focus:outline-none focus:ring-2 focus:ring-[var(--emsp-green-luminous)]/20"
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
      />
    </div>
  );
});

export default Select;
