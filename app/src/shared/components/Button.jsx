import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cx } from "@shared/utils/cx";

/**
 * Bouton maison (doc 03 §6.1). Variants EMSP, focus ring luminous.
 * @param {"primary"|"secondary"|"outline"|"ghost"|"danger"} variant="primary"
 * @param {"sm"|"md"|"lg"} size="md"
 * @param {boolean} loading=false — spinner remplace le label, bloque le clic
 * @param {React.ElementType} icon — icône lucide, position gauche
 */
const stylesBase =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-chip)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const stylesVariant = {
  primary:
    "bg-[var(--accent-green)] text-[var(--emsp-cream)] hover:bg-[var(--emsp-green-bright)]",
  secondary: "bg-[var(--emsp-gold)] text-[#16281c] hover:bg-[var(--emsp-gold-bright)]",
  outline:
    "border-[1.5px] border-[var(--border-structural)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--hover-bg)]",
  ghost:
    "bg-transparent text-[var(--text-primary)] hover:bg-[var(--hover-bg)]",
  danger: "bg-[#b42318] text-white hover:bg-[#932015]",
};

const stylesSize = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
};

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, disabled = false, icon: Icone, className, children, onClick, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cx(stylesBase, stylesVariant[variant], stylesSize[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        Icone && <Icone size={16} aria-hidden="true" />
      )}
      {children}
    </button>
  );
});

export default Button;
