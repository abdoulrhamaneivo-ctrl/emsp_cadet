import { motion } from "framer-motion";

/** « Prénom écrit… » — trois points en bounce CSS (perf, doc 08 §6). */
export default function IndicateurTyping({ prenom }) {
  if (!prenom) return null;
  return (
    <div className="flex items-center gap-2 px-1 text-xs text-[var(--text-muted)]" role="status">
      <span className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      {prenom} écrit…
    </div>
  );
}

/** Variante animée d'apparition (motion) — utilisée par le fil. */
export function PointsTyping() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-1"
    >
      <IndicateurTyping prenom="" />
    </motion.div>
  );
}
