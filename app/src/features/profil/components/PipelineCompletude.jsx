import { Check, CircleAlert } from "lucide-react";
import { CONDITIONS_VISIBILITE } from "../schemas";

/**
 * Pipeline de complétude (doc 11 §4) — checklist 1:1 avec les motifs API
 * (doc 11 §8 n°4). Affiché seulement s'il manque quelque chose ; phrase
 * d'impact explicite.
 */
export default function PipelineCompletude({ visibilite }) {
  if (!visibilite || visibilite.visible) return null;

  const ordre = ["candidature", "photo", "ambitions", "projets", "pointsForts", "pointsFaibles"];
  const manquants = new Set(visibilite.motifs);

  return (
    <section
      aria-labelledby="titre-completude"
      className="rounded-[var(--radius-card)] border-2 border-[var(--emsp-gold)] bg-[var(--emsp-cream-alt)] p-5"
    >
      <h2 id="titre-completude" className="font-display text-base font-bold text-[var(--text-primary)]">
        Il manque encore…
      </h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {ordre
          .filter((cle) => manquants.has(cle))
          .map((cle) => (
            <li
              key={cle}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--bg-panel)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)]"
            >
              <CircleAlert size={12} aria-hidden="true" className="text-[var(--accent-gold)]" />
              {CONDITIONS_VISIBILITE[cle]}
            </li>
          ))}
      </ul>
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        Tant que ces points sont incomplets, tu restes invisible de l'annuaire.
      </p>
      <p className="sr-only">
        Conditions déjà remplies :{" "}
        {ordre.filter((cle) => !manquants.has(cle)).map((cle) => CONDITIONS_VISIBILITE[cle]).join(", ")}.
      </p>
      {/* Les cochées servent aussi de feedback positif (doc 11 §6 — check morph) */}
      <div className="mt-2 flex flex-wrap gap-2" aria-hidden="true">
        {ordre
          .filter((cle) => !manquants.has(cle))
          .map((cle) => (
            <span
              key={cle}
              className="flex items-center gap-1 rounded-full bg-[var(--accent-green)]/10 px-2.5 py-1 text-xs font-medium text-[var(--accent-green)]"
            >
              <Check size={12} aria-hidden="true" />
              {CONDITIONS_VISIBILITE[cle]}
            </span>
          ))}
      </div>
    </section>
  );
}
