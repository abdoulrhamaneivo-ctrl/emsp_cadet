/**
 * Section académique (doc 11 §4) — classe, filière, NIVEAU select (RG7 :
 * conditionne la candidature) et attentes visibles par les futurs Aînés.
 */
const NIVEAUX = [
  { valeur: "L1", libelle: "L1 — première année" },
  { valeur: "L2", libelle: "L2 — tu peux aider les nouveaux" },
  { valeur: "L3", libelle: "L3 — dernière année de licence" },
  { valeur: "M1", libelle: "M1 — master" },
  { valeur: "M2", libelle: "M2 — master" },
  { valeur: "alumni", libelle: "Alumni — diplômé, tu restes un devancier" },
];

export default function SectionAcademique({ moi, surChamp }) {
  return (
    <section
      aria-labelledby="titre-academique"
      className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-card)]"
    >
      <h2 id="titre-academique" className="font-display text-base font-bold text-[var(--text-primary)]">
        Parcours académique
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Classe</span>
          <input
            className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
            value={moi.classe ?? ""}
            onChange={(e) => surChamp("classe", e.target.value)}
            maxLength={40}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Filière</span>
          <input
            className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
            value={moi.filiere ?? ""}
            onChange={(e) => surChamp("filiere", e.target.value)}
            maxLength={120}
          />
        </label>
      </div>
      <label className="mt-3 flex flex-col gap-1">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          Niveau d'étude
        </span>
        <select
          className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
          value={moi.niveauEtude ?? "L1"}
          onChange={(e) => surChamp("niveauEtude", e.target.value)}
          aria-describedby="hint-niveau"
        >
          {NIVEAUX.map((n) => (
            <option key={n.valeur} value={n.valeur}>
              {n.libelle}
            </option>
          ))}
        </select>
        <span id="hint-niveau" className="text-[11px] text-[var(--text-muted)]">
          Tu changeras de niveau en début d'année suivante.
        </span>
      </label>
      <label className="mt-3 flex flex-col gap-1">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          Tes attentes (visibles par tes futurs Aînés)
        </span>
        <textarea
          rows={3}
          maxLength={1000}
          className="resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
          value={moi.attentes ?? ""}
          onChange={(e) => surChamp("attentes", e.target.value)}
          placeholder="Ce que tu veux apprendre, comment tu aimes travailler…"
        />
      </label>
    </section>
  );
}
