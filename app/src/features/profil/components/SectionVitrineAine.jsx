import { Plus, X, Sparkles } from "lucide-react";
import PanneauCopilot from "@shared/components/PanneauCopilot";

/**
 * Section vitrine Aîné (doc 11 §4) — 4 listes CRUD simples (ambitions ≥ 3,
 * projets ≥ 1, points forts ≥ 2, points faibles ≥ 1 : ce sont LES seuils de
 * complétude annuaire). Visible même candidature fermée — prépare l'avenir.
 */
function ListeVitrine({ titre, hint, seuil, items, surChanger, copilot, surCopilot }) {
  const ajouter = () => surChanger([...items, ""]);
  const modifier = (index, valeur) =>
    surChanger(items.map((item, i) => (i === index ? valeur : item)));
  const retirer = (index) => surChanger(items.filter((_, i) => i !== index));

  return (
    <div className="rounded-[var(--radius-input)] border border-[var(--border-soft)] p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-bold text-[var(--text-primary)]">{titre}</p>
        <span
          className={
            items.filter((i) => i.trim()).length >= seuil
              ? "text-[11px] font-semibold text-[var(--accent-green)]"
              : "text-[11px] text-[var(--text-muted)]"
          }
        >
          {items.filter((i) => i.trim()).length}/{seuil} requis
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{hint}</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <input
              className="min-w-0 flex-1 rounded-[var(--radius-chip)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
              value={item}
              maxLength={160}
              onChange={(e) => modifier(index, e.target.value)}
              placeholder={`${titre} ${index + 1}…`}
              aria-label={`${titre} ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => retirer(index)}
              aria-label={`Retirer ${titre} ${index + 1}`}
              className="shrink-0 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--hover-bg)]"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={ajouter}
        disabled={items.length >= 8}
        className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--accent-green)] hover:underline disabled:opacity-50"
      >
        <Plus size={13} aria-hidden="true" /> Ajouter
      </button>
      {/* Copilot IA-3 (doc 17 §2) — opt-in strict via preferences_ia.copilot */}
      {copilot && (
        <PanneauCopilot
          section={titre.toLowerCase() === "points forts" ? "pointsForts" : titre.toLowerCase() === "points faibles" ? "pointsFaibles" : titre.toLowerCase()}
          motsCles={surCopilot?.motsCles ?? ""}
          surInsertion={(texte) => {
            // Trouve le premier item vide ou ajoute
            const idx = items.findIndex((i) => !i.trim());
            if (idx >= 0) {
              surChanger(items.map((item, i) => (i === idx ? texte : item)));
            } else {
              surChanger([...items, texte]);
            }
          }}
          surFermeture={() => {}}
          desactive={false}
        />
      )}
    </div>
  );
}

export default function SectionVitrineAine({ moi, surChamp }) {
  return (
    <section
      aria-labelledby="titre-vitrine"
      className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-card)]"
    >
      <h2 id="titre-vitrine" className="font-display text-base font-bold text-[var(--text-primary)]">
        Ta vitrine d'Aîné
      </h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        C'est ce que lisent les cadets avant de te choisir dans l'annuaire — visible
        même candidature fermée, pour préparer l'avenir.
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <ListeVitrine
          titre="Ambitions"
          hint="Où tu veux aller, professionnellement ou personnellement."
          seuil={3}
          items={moi.ambitions ?? []}
          surChanger={(liste) => surChamp("ambitions", liste)}
          copilot={moi.preferencesIA?.copilot}
          surCopilot={{}}
        />
        <ListeVitrine
          titre="Projets"
          hint="Ce que tu construis en ce moment (projet d'études, side project…)."
          seuil={1}
          items={moi.projets ?? []}
          surChanger={(liste) => surChamp("projets", liste)}
          copilot={moi.preferencesIA?.copilot}
          surCopilot={{}}
        />
        <ListeVitrine
          titre="Points forts"
          hint="Sur quoi tu peux aider concrètement un cadet."
          seuil={2}
          items={moi.pointsForts ?? []}
          surChanger={(liste) => surChamp("pointsForts", liste)}
          copilot={moi.preferencesIA?.copilot}
          surCopilot={{}}
        />
        <ListeVitrine
          titre="Points faibles"
          hint="Assumés — ils rendent ta vitrine crédible et humaine."
          seuil={1}
          items={moi.pointsFaibles ?? []}
          surChanger={(liste) => surChamp("pointsFaibles", liste)}
          copilot={moi.preferencesIA?.copilot}
          surCopilot={{}}
        />
      </div>
    </section>
  );
}
