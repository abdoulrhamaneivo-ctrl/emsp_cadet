/** Séparateur fin (token border-soft). */
export default function Divider({ className = "", vertical = false }) {
  return vertical ? (
    <span aria-hidden="true" className={`inline-block w-px self-stretch bg-[var(--border-soft)] ${className}`} />
  ) : (
    <hr aria-hidden="true" className={`border-0 border-t border-[var(--border-soft)] ${className}`} />
  );
}
