import { Sparkles } from "lucide-react";
import { cx } from "@shared/utils/cx";

/** ChipIA — RG12.3 : TOUTE sortie IA porte ce chip (Sparkles + tone info). */
export default function ChipIA({ className, ...props }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium",
        "bg-[var(--emsp-cream)] text-[var(--emsp-green-deep)] border border-[var(--emsp-gold)]/40",
        className
      )}
      aria-label="Contenu suggéré automatiquement, vérifie avant d'utiliser"
      {...props}
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      Généré par IA
    </span>
  );
}