import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, ClipboardCheck, WandSparkles } from "lucide-react";
import { cx } from "@shared/utils/cx";
import ChipIA from "@shared/components/ChipIA";

/**
 * Assistant de rédaction : l'utilisateur fournit son contexte, demande des
 * propositions puis choisit explicitement celle qu'il veut insérer.
 */
export default function PanneauCopilot({
  section,
  ouvert = false,
  motsClesInitials = "",
  genererPropositions,
  surInsertion,
  surFermeture,
}) {
  const [motsCles, setMotsCles] = useState(String(motsClesInitials ?? "").slice(0, 300));
  const [propositions, setPropositions] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  if (!ouvert) return null;

  const generer = async (event) => {
    event.preventDefault();
    const contexte = motsCles.trim();
    if (!contexte || chargement) return;

    setChargement(true);
    setErreur("");
    setPropositions([]);
    try {
      const resultat = await genererPropositions(contexte);
      const liste = Array.isArray(resultat)
        ? resultat
        : resultat?.propositions ?? resultat?.[section] ?? [];
      if (liste.length) setPropositions(liste);
      else {
        setErreur(
          typeof resultat?.detail === "string"
            ? resultat.detail
            : "Aucune proposition disponible. Essaie d'autres mots-clés.",
        );
      }
    } catch (e) {
      const detail = e?.response?.data?.detail;
      setErreur(
        typeof detail === "string"
          ? detail
          : "L'assistant n'est pas disponible pour le moment. Réessaie dans un instant.",
      );
    } finally {
      setChargement(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.16 }}
        aria-label="Assistant de rédaction"
        className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-structural)] bg-[var(--bg-panel)] shadow-[var(--shadow-card)]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border-soft)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--emsp-gold)]/15 text-[var(--accent-green)]">
              <WandSparkles size={16} aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Assistant de rédaction</span>
                <ChipIA />
              </div>
              <p className="text-xs text-[var(--text-muted)]">Donne-lui quelques mots pour personnaliser les idées.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={surFermeture}
            className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
            aria-label="Fermer l'assistant de rédaction"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="p-4">
          <form onSubmit={generer} className="flex flex-col gap-2 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Mots-clés pour l'assistant</span>
              <input
                autoFocus
                value={motsCles}
                onChange={(event) => setMotsCles(event.target.value)}
                maxLength={300}
                placeholder="Ex. réseaux, cybersécurité, travail en équipe"
                className="w-full rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-green)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)]/20"
              />
            </label>
            <button
              type="submit"
              disabled={!motsCles.trim() || chargement}
              className={cx(
                "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-input)] px-4 py-2 text-sm font-semibold transition-colors",
                "bg-[var(--accent-green)] text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {chargement ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Sparkles size={15} aria-hidden="true" />}
              {chargement ? "Préparation…" : "Générer des idées"}
            </button>
          </form>

          {erreur && <p className="mt-3 text-sm text-[#b42318]" role="alert">{erreur}</p>}

          {propositions.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2" aria-label="Propositions de rédaction">
              {propositions.map((proposition, index) => (
                <li key={`${index}-${proposition}`}>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => {
                      surInsertion(proposition);
                      surFermeture();
                    }}
                    className="flex w-full items-start gap-2 rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-panel-alt)] p-3 text-left text-sm leading-relaxed text-[var(--text-primary)] transition-colors hover:border-[var(--accent-green)] hover:bg-[var(--hover-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-green)]"
                  >
                    <ChipIA />
                    <span className="min-w-0 flex-1">{proposition}</span>
                    <ClipboardCheck size={15} className="mt-0.5 shrink-0 text-[var(--accent-green)]" aria-hidden="true" />
                  </motion.button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <Sparkles size={12} className="text-[var(--emsp-gold)]" aria-hidden="true" />
            Les suggestions ne sont insérées que lorsque tu en choisis une.
          </p>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
