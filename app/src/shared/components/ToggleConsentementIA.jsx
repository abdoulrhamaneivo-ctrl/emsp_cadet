import { cx } from "@shared/utils/cx";
import Switch from "@shared/components/Switch";

/** ToggleConsentementIA — switch pour les préférences IA (opt-in strict, RG12.4). */
export default function ToggleConsentementIA({
  label,
  description,
  checked,
  onChange,
  desactive = false,
  className,
}) {
  return (
    <div className={cx(
      "flex items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-panel-alt)] px-4 py-3",
      className,
    )}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        disabled={desactive}
        label={label}
        className="h-7 w-12"
      />
      {desactive && (
        <span className="flex-shrink-0 rounded-full bg-[var(--emsp-cream)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--emsp-gold)]">
          Kill-switch admin
        </span>
      )}
    </div>
  );
}
