import Chip from "@shared/components/Chip";

/**
 * Page placeholder — indique la spec de la page à venir.
 * Chaque placeholder est remplacé tranche par tranche (doc 18 §4).
 */
export default function PlaceholderPage({ titre, spec }) {
  return (
    <section className="panel p-8" aria-labelledby="titre-page">
      <div className="kente-band rounded-t-md -mx-8 -mt-8 mb-8" />
      <Chip tone="gold">Page à venir</Chip>
      <h1 id="titre-page" className="mt-4 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
        {titre}
      </h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Cette page suivra la spec : <span className="font-mono">{spec}</span>
      </p>
    </section>
  );
}
