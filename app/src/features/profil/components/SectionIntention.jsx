import { motion } from "framer-motion";

const OPTIONS = [
  {
    valeur: "master",
    libelle: "Je continue en Master (M1) à l'EMSP",
    detail: "Ta place de parrain et tes relations continuent sans interruption.",
  },
  {
    valeur: "alumni",
    libelle: "Je passe alumni à la fin de l'année",
    detail: "Tu restes un devancier : ton profil passe au régime alumni (RG10).",
  },
  {
    valeur: "inconnu",
    libelle: "Je ne sais pas encore",
    detail: "La transition te proposera alumni par défaut — ajustable avant exécution.",
  },
];

/**
 * Section « Mon année prochaine » (doc 15 §1) — visible SEULEMENT en L3/M2.
 * Déclaratif : ce n'est PAS une admission officielle, l'admin vérifie à la
 * transition annuelle. Un M2 ne peut pas choisir « master » (doc 15 CA n°4).
 */
export default function SectionIntention({ valeur, niveau, surChamp }) {
  const options = niveau === "M2" ? OPTIONS.filter((o) => o.valeur !== "master") : OPTIONS;
  return (
    <motion.section
      layout
      aria-labelledby="titre-intention"
      className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-card)]"
    >
      <h2 id="titre-intention" className="font-display text-base font-bold text-[var(--text-primary)]">
        Mon année prochaine
      </h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Déclaration indicative — vérifiée par l'administration à la transition
        annuelle. Elle ne vaut pas admission officielle.
      </p>
      <fieldset className="mt-3">
        <legend className="sr-only">Ton intention pour l'année suivante</legend>
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <label
              key={option.valeur}
              className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-input)] border border-[var(--border-soft)] px-3 py-2.5 has-checked:border-[var(--emsp-gold)] has-checked:bg-[var(--emsp-gold)]/5"
            >
              <input
                type="radio"
                name="intention-annee-suivante"
                value={option.valeur}
                checked={valeur === option.valeur}
                onChange={() => surChamp(option.valeur)}
                className="mt-1 accent-[var(--emsp-gold)]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[var(--text-primary)]">
                  {option.libelle}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                  {option.detail}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </motion.section>
  );
}
