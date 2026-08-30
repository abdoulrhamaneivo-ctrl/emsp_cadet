import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, ClipboardCheck } from "lucide-react";
import { cx } from "@shared/utils/cx";
import ChipIA from "@shared/components/ChipIA";
import Button from "@shared/components/Button";

/**
 * PanneauCopilot — IA-3 (doc 17 §2) : 3 propositions cliquables basées sur
 * 2-3 mots-clés. Insertion = action explicite utilisateur (RG12.1/3).
 * ChipIA sur chaque proposition (RG12.3). Fermeture auto après insertion.
 */
export default function PanneauCopilot({
  section,           // "attentes" | "ambitions" | "projets" | "pointsForts" | "pointsFaibles"
  motsCles,          // string (2-3 mots saisis par l'utilisateur)
  surInsertion,      // (texte) => void — insère la proposition dans le textarea
  surFermeture,      // () => void
  desactive = false,
}) {
  const [propositions, setPropositions] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const conteneurRef = useRef(null);

  // Fermeture si clic hors du panneau
  useEffect(() => {
    function handleClickOutside(e) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target)) {
        surFermeture();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [surFermeture]);

  const generer = useCallback(async () => {
    if (!motsCles?.trim() || chargement) return;
    setChargement(true);
    setErreur(null);
    try {
      const api = window.profilApi;
      if (!api?.copilot) {
        setErreur("Service copilot indisponible.");
        setChargement(false);
        return;
      }
      const { data } = await api.copilot(section, motsCles);
      if (data?.propositions?.length) {
        setPropositions(data.propositions);
      } else {
        setErreur("Aucune proposition générée — essaie d'autres mots-clés.");
      }
    } catch (e) {
      setErreur("Service indisponible — réessaie plus tard.");
    } finally {
      setChargement(false);
    }
  }, [section, motsCles, chargement]);

  // Auto-génération au montage si motsCles fourni
  useEffect(() => {
    let mounted = true;
    if (motsCles?.trim() && !propositions.length && mounted) {
      generer();
    }
    return () => { mounted = false; };
  }, [motsCles, section, propositions.length, generer]);

  if (!motsCles?.trim() && !propositions.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={conteneurRef}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        className={cx(
          "absolute z-20 w-full max-w-xs mt-1.5 rounded-[var(--radius-card)]",
          "border border-[var(--emsp-cream)]/20 bg-[var(--bg-panel)] shadow-[var(--shadow-panel)] overflow-hidden"
        )}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between gap-2 p-3 border-b border-[var(--emsp-cream)]/15">
          <div className="flex items-center gap-2">
            <ChipIA />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Copilot — 3 propositions
            </span>
          </div>
          <button
            type="button"
            onClick={surFermeture}
            disabled={desactive}
            className="flex-shrink-0 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
            aria-label="Fermer le copilot"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-3">
          {erreur && (
            <p className="mb-3 text-sm text-[#b42318]" role="alert">{erreur}</p>
          )}

          {chargement ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={16} className="animate-spin text-[var(--emsp-gold)]" aria-hidden="true" />
              <span className="text-sm text-[var(--text-muted)]">L'assistant prépare...</span>
            </div>
          ) : propositions.length ? (
            <div className="flex flex-col gap-2" role="list" aria-label="Propositions du copilot">
              {propositions.map((p, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    surInsertion(p);
                    surFermeture();
                  }}
                  className={cx(
                    "w-full text-left p-3 rounded-[var(--radius-card)]",
                    "border border-[var(--emsp-cream)]/20 bg-[var(--bg-input)]",
                    "hover:bg-[var(--emsp-cream)]/10 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-gold)]"
                  )}
                  role="listitem"
                >
                  <div className="flex items-start gap-2">
                    <ChipIA />
                    <span className="flex-1 text-sm leading-relaxed text-[var(--text-primary)]">
                      {p}
                    </span>
                    <ClipboardCheck size={14} className="shrink-0 text-[var(--emsp-gold)] mt-0.5" aria-hidden="true" />
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              Saisis 2-3 mots-clés puis appuie sur Entrée pour générer.
            </p>
          )}
        </div>

        {/* Pied : info RG12.3 */}
        <div className="px-3 pb-3 border-t border-[var(--emsp-cream)]/15">
          <p className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--emsp-gold)]">
            <Sparkles size={10} aria-hidden="true" />
            Généré par IA — tu choisis d'insérer
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}