import { Star, StarHalf } from "lucide-react";
import { cx } from "@shared/utils/cx";

/**
 * Score fiabilité (doc 03 §6.13 — cahier §3.6). Étoiles lucide ton or,
 * note numérique, nbAvis. score null (0 avis) → « Pas encore noté » discret.
 * @param {number|null} score — moyenne 0..5
 * @param {number} nbAvis
 * @param {boolean} detail=false — taille d'étoile supérieure (fiche détaillée)
 * @param {"clair"|"fonce"} fond="clair" — "fonce" sur panneaux vert profond (header fiche)
 */
export default function ScoreFiabilite({ score, nbAvis = 0, detail = false, fond = "clair", className }) {
  const taille = detail ? 18 : 14;
  const surFonce = fond === "fonce";
  const etoileVide = surFonce ? "text-[var(--emsp-cream)]/30" : "text-[var(--border-soft)]";

  if (score == null || nbAvis === 0) {
    return (
      <span
        className={cx("inline-flex items-center text-xs", surFonce ? "text-[var(--emsp-cream)]/70" : "text-[var(--text-muted)]", className)}
      >
        Pas encore noté
      </span>
    );
  }

  const noteDemiPoint = Math.round(score * 2) / 2;
  const pleines = Math.floor(noteDemiPoint);
  const demi = noteDemiPoint - pleines === 0.5;
  const noteAffichee = score.toFixed(1).replace(".", ",");

  return (
    <span
      className={cx("inline-flex items-center gap-1", className)}
      role="img"
      aria-label={`Note moyenne ${noteAffichee} sur 5, ${nbAvis} avis`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        if (i < pleines) {
          return <Star key={i} size={taille} aria-hidden="true" className="fill-[var(--emsp-gold)] text-[var(--emsp-gold)]" />;
        }
        if (i === pleines && demi) {
          return <StarHalf key={i} size={taille} aria-hidden="true" className="fill-[var(--emsp-gold)] text-[var(--emsp-gold)]" />;
        }
        return <Star key={i} size={taille} aria-hidden="true" className={etoileVide} />;
      })}
      <span className={cx("font-semibold", detail ? "text-sm" : "text-xs", surFonce ? "text-[var(--emsp-cream)]" : "text-[var(--text-primary)]")}>
        {noteAffichee}
      </span>
      <span className={cx(detail ? "text-sm" : "text-xs", surFonce ? "text-[var(--emsp-cream)]/75" : "text-[var(--text-muted)]")}>
        ({nbAvis})
      </span>
    </span>
  );
}
