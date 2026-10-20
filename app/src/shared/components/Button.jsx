import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cx } from "@shared/utils/cx";

/**
 * Bouton maison (doc 03 §6.1). Variants EMSP, focus ring luminous.
 * Retour tactile : le bouton s'enfonce sous le doigt (scale 0.97 + ombre
 * interne) — jamais de lévitation. Rayon --radius-input (continuité avec
 * les champs). Désactivé = opacité, sans secousse.
 * @param {"primary"|"secondary"|"outline"|"ghost"|"ghost-fonce"|"danger"} variant="primary"
 * @param {"sm"|"md"|"lg"} size="md"
 * @param {boolean} loading=false — spinner remplace le label, bloque le clic
 * @param {React.ElementType} icon — icône lucide, position gauche
 * @param {string} to — si présent, rend un <Link> router stylé bouton
 */
const stylesBase =
  "btn inline-flex select-none items-center justify-center gap-2 font-semibold rounded-full transition-[background-color,border-color,box-shadow] duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const stylesVariant = {
  primary:
    "border border-[var(--accent-green)] bg-[var(--accent-green)] text-[var(--text-on-accent)] hover:bg-[var(--accent-green-hover)] hover:border-[var(--accent-green-hover)] active:shadow-[var(--shadow-pressed)]",
  secondary: "border border-[var(--emsp-gold)] bg-[var(--emsp-gold)] text-[#2a1b00] hover:bg-[var(--emsp-gold-bright)] active:shadow-[var(--shadow-pressed)]",
  outline:
    "border-[1.5px] border-[var(--border-structural)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--hover-bg)] active:shadow-[var(--shadow-pressed)]",
  ghost:
    "bg-transparent text-[var(--text-primary)] hover:bg-[var(--hover-bg)]",
  /** Ghost posé sur fond vert profond (hero, filtres hors panneau). */
  "ghost-fonce":
    "bg-transparent text-[var(--emsp-cream)] hover:bg-white/10",
  danger: "bg-[#b42318] text-white active:shadow-[var(--shadow-pressed)]",
};

const stylesSize = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
};

const BoutonLien = motion.create(Link);
const MotionButton = motion.button;

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading = false, disabled = false, icon: Icone, to, className, children, onClick, ...props },
  ref,
) {
  const desactive = disabled || loading;
  const commun = {
    ref,
    whileTap: { scale: 0.97 },
    transition: { type: "spring", stiffness: 500, damping: 32, mass: 0.6 },
    onClick,
    className: cx(stylesBase, stylesVariant[variant], stylesSize[size], className),
    ...props,
  };

  const contenu = (
    <>
      {loading ? (
        <Loader2 size={16} className="ic animate-spin" aria-hidden="true" />
      ) : (
        Icone && <Icone size={16} className="ic s" aria-hidden="true" />
      )}
      {children}
    </>
  );

  if (to) {
    return (
      <BoutonLien to={to} {...commun}>
        {contenu}
      </BoutonLien>
    );
  }

  return (
    <MotionButton type="button" disabled={desactive} {...commun}>
      {contenu}
    </MotionButton>
  );
});

export default Button;
