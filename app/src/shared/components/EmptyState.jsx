/**
 * État vide contextualisé (doc 03 §6.11) — illustration = icône lucide
 * dans un disque crème-alt 64px, jamais d'emoji.
 */
export default function EmptyState({ icon: Icone, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--emsp-cream-alt)] mb-4">
        {Icone && <Icone size={28} aria-hidden="true" className="text-[var(--accent-green)]" />}
      </span>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 text-sm font-semibold text-[var(--accent-green)] hover:underline underline-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
