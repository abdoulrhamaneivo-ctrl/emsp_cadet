/** Footer EMSP — bande institutionnelle + ruban tissé (doc 03 §4). */
export default function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer role="contentinfo" aria-label="Pied de page">
      <div className="woven-ribbon" />
      <div className="bg-[var(--emsp-green-deep)] px-5 py-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold text-[var(--emsp-cream)]">
              EMSP<span className="text-[var(--emsp-gold)]">Connect</span>
            </p>
            <p className="mt-1 text-sm text-[var(--emsp-cream)]/85">
              Parrainage Cadets &amp; Aînés — École Multinationale des Postes, Abidjan
            </p>
          </div>
          <p className="text-xs text-[var(--emsp-cream)]/90">
            <span className="sr-only">Copyright </span>
            <span aria-hidden="true">©</span> {annee} · Base design :{" "}
            <a
              href="https://craftedtemplate.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--emsp-gold)]"
            >
              cillaux
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
