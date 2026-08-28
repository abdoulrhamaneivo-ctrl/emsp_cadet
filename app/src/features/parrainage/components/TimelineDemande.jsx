import { formatteurDate } from "../utils/dates";

/**
 * Timeline « Envoyée → En examen → Réponse » (doc 05 §4) — aucun composant
 * externe : 3 points reliés, l'étape active ressort, les autres restent posées.
 */
export default function TimelineDemande({ demande }) {
  const etapes = [
    { label: "Envoyée", date: demande.dateDemande, faite: true },
    {
      label: "En examen",
      date: null,
      faite: demande.statut !== "en_attente",
      active: demande.statut === "en_attente",
    },
    {
      label: "Réponse",
      date: demande.dateReponse,
      faite: Boolean(demande.dateReponse),
      active: demande.statut !== "en_attente" && !demande.dateReponse,
    },
  ];

  return (
    <ol className="flex items-start gap-0" aria-label="Suivi de la demande">
      {etapes.map((etape, i) => (
        <li key={etape.label} className={i < etapes.length - 1 ? "flex flex-1 items-start gap-0" : ""}>
          <div className="flex flex-col items-center gap-1.5 pt-0.5">
            <span
              aria-hidden="true"
              className={[
                "h-2.5 w-2.5 rounded-full border-2",
                etape.faite
                  ? "border-[var(--accent-green)] bg-[var(--accent-green)]"
                  : etape.active
                    ? "border-[var(--emsp-gold)] bg-[var(--emsp-gold)]"
                    : "border-[var(--border-structural)] bg-transparent",
              ].join(" ")}
            />
            <span
              className={[
                "text-[11px] font-medium leading-none",
                etape.active ? "text-[var(--accent-gold)]" : etape.faite ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
              ].join(" ")}
            >
              {etape.label}
            </span>
            {etape.date && (
              <span className="text-[11px] leading-none text-[var(--text-muted)]">
                {formatteurDate(etape.date)}
              </span>
            )}
          </div>
          {i < etapes.length - 1 && (
            <span
              aria-hidden="true"
              className={["mb-4 h-0.5 flex-1", etape.faite ? "bg-[var(--accent-green)]/40" : "bg-[var(--border-soft)]"].join(" ")}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
