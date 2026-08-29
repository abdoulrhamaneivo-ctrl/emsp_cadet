import { Switch } from "@mui/material";
import { motion } from "framer-motion";
import { cx } from "@shared/utils/cx";

/**
 * LE grand interrupteur RG8 (doc 11 §4) — panneau bordure or :
 *  • L1 : disabled + texte doux « ce sera ton tour » (pas une punition) ;
 *  • OFF : « tu n'apparais pas dans l'annuaire » ;
 *  • ON : « ton profil attire des cadets » + sous-texte RG8.
 * La confirmation (conséquences) vit dans la modale de la page — ce composant
 * ne fait qu'afficher l'état et remonter l'intention.
 */
export default function SectionCandidatureAine({
  ouvert,
  niveau,
  surBascule,
}) {
  const enL1 = niveau === "L1";
  return (
    <motion.section
      layout
      aria-labelledby="titre-candidature"
      className={cx(
        "rounded-[var(--radius-card)] border-2 bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-card)]",
        ouvert ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="titre-candidature" className="font-display text-base font-bold text-[var(--text-primary)]">
            Candidature Aîné
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {enL1 ? (
              "En L2, ce sera ton tour d'aider les nouveaux — pour l'instant, profite de ton Aîné."
            ) : ouvert ? (
              "Ton profil attire des cadets. Tu disparaîtras de l'annuaire en le fermant, sans jamais casser les binômes en cours."
            ) : (
              "Tu n'apparais pas dans l'annuaire des Aînés. Ouvre-le pour accueillir des cadets."
            )}
          </p>
        </div>
        <Switch
          checked={Boolean(ouvert)}
          disabled={enL1}
          onChange={(e) => surBascule(e.target.checked)}
          inputProps={{
            "aria-label": "Ouvrir ma candidature Aîné",
            role: "switch",
          }}
        />
      </div>
    </motion.section>
  );
}
