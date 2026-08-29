import { Switch } from "@mui/material";
import { cx } from "@shared/utils/cx";

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
    <label className={cx("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-3">
        <Switch
          checked={checked}
          onChange={onChange}
          disabled={desactive}
          size="small"
          color="primary"
          inputProps={{ "aria-label": label }}
        />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm text-[var(--text-primary)]">
            {label}
          </span>
          {description && (
            <p className="text-[11px] text-[var(--text-muted)] truncate">{description}</p>
          )}
        </div>
        {desactive && (
          <span className="flex-shrink-0 text-[10px] font-medium text-[var(--emsp-gold)] bg-[var(--emsp-cream)]/10 px-2 py-0.5 rounded-full">
            Kill-switch admin
          </span>
        )}
      </div>
    </label>
  );
}