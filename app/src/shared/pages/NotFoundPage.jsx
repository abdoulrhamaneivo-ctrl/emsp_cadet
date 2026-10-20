import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

/** 404 maison (doc 20 P25) — ton EMSP, pas d'emoji. */
export default function NotFoundPage() {
  return (
    <section className="panel mx-auto max-w-lg p-10 text-center" aria-labelledby="titre-404">
      <div className="kente-band rounded-t-md -mx-10 -mt-10 mb-8" />
      <p className="font-mono text-5xl font-bold text-[var(--accent-green)]">404</p>
      <h1 id="titre-404" className="mt-3 text-xl font-bold text-[var(--text-primary)]">
        Cette page n'existe pas
      </h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Le lien est peut-être obsolète, ou l'adresse mal recopiée.
      </p>
      <Link
        to="/accueil"
        className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-chip)] bg-[var(--accent-green)] px-4 py-2.5 text-sm font-semibold text-[var(--text-on-accent)] hover:bg-[var(--accent-green-hover)]"
      >
        <Compass size={16} aria-hidden="true" /> Retour à l'accueil
      </Link>
    </section>
  );
}
