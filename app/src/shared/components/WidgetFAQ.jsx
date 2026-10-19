import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, MessageCircle, Loader2, ExternalLink } from "lucide-react";
import { cx } from "@shared/utils/cx";
import ChipIA from "@shared/components/ChipIA";
import Button from "@shared/components/Button";

/**
 * WidgetFAQ — IA-4 (doc 17 §2) : chatbot FAQ L1.
 * - Champ question + envoi
 * - Réponse avec ChipIA + sources si trouvée
 * - Sinon : bouton "Poser à la communauté" → lien vers /fil (nouvelle question)
 * - Opt-in RG12.4 : matchingEnrichi (toggle réutilisé) ou toggle dédié
 * - États : loading, erreur, dégradation silencieuse
 */
export default function WidgetFAQ({ open = false, onClose, onFermer, desactive = false }) {
  const [question, setQuestion] = useState("");
  const [historique, setHistorique] = useState([]); // {question, reponse, sources, score, timestamp}
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);
  const finRef = useRef(null);

  // Scroll auto vers le bas
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historique]);

  async function envoyer() {
    const q = question.trim();
    if (!q || q.length < 3 || chargement) return;
    setChargement(true);
    setErreur(null);
    try {
      const res = await window.faqApi?.poser(q);
      setHistorique((h) => [
        ...h,
        { question: q, ...res.data, timestamp: Date.now() },
      ]);
      setQuestion("");
    } catch (e) {
      setErreur("Service indisponible — réessaie plus tard.");
    } finally {
      setChargement(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  }

  const fermer = onClose ?? onFermer;
  if (!open || desactive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cx(
        "fixed inset-0 z-50 flex flex-col",
        "bg-[var(--bg-overlay)] backdrop-blur-sm"
      )}
    >
      {/* Overlay de fermeture */}
      <div
        className="absolute inset-0"
        onClick={fermer}
        aria-hidden="true"
      />

      {/* Panneau */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className={cx(
          "absolute bottom-4 right-4 left-4 md:right-4 md:left-auto md:w-96",
          "max-h-[70vh] flex flex-col rounded-[var(--radius-card)]",
          "border border-[var(--emsp-cream)]/20 bg-[var(--bg-panel)] shadow-[var(--shadow-panel)] overflow-hidden"
        )}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between gap-2 p-3 border-b border-[var(--emsp-cream)]/15">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--emsp-cream)]/10 px-2.5 py-1">
              <Sparkles size={13} aria-hidden="true" className="text-[var(--emsp-gold)]" />
              <span className="text-xs font-semibold text-[var(--emsp-gold)]">
                FAQ L1
              </span>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Assistant EMSP
            </span>
          </div>
          <button
            type="button"
            onClick={fermer}
            className="flex-shrink-0 rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
            aria-label="Fermer la FAQ"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Zone conversation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4" ref={finRef}>
          {historique.length === 0 && (
            <div className="flex flex-col items-center gap-3 text-center py-8">
              <MessageCircle size={32} className="text-[var(--text-muted)]/50" aria-hidden="true" />
              <p className="text-sm text-[var(--text-muted)]">
                Pose ta question — base connaissances EMSP validée par l'admin.
              </p>
              <p className="text-xs text-[var(--text-muted)]/70">
                Ex: « Comment m'inscrire ? », « C'est quoi le Fil ? »
              </p>
            </div>
          )}

          {historique.map((item, idx) => (
            <motion.div
              key={item.timestamp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col gap-2"
            >
              {/* Question utilisateur */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-[var(--radius-card)] bg-[var(--emsp-green-deep)] px-3.5 py-2.5">
                  <p className="text-sm text-[var(--emsp-cream)]">{item.question}</p>
                </div>
              </div>

              {/* Réponse IA */}
              <div className="flex justify-start">
                <div className={cx(
                  "max-w-[80%] rounded-[var(--radius-card)] p-3",
                  item.trouve
                    ? "bg-[var(--bg-input)] border border-[var(--emsp-cream)]/20"
                    : "bg-[var(--bg-input)]/50 border border-dashed border-[var(--emsp-cream)]/20"
                )}>
                  {item.trouve ? (
                    <>
                      <div className="flex items-start gap-2">
                        <ChipIA />
                        <p className="flex-1 text-sm leading-relaxed text-[var(--text-primary)]">
                          {item.reponse}
                        </p>
                      </div>
                      {item.sources?.length && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                          <span className="font-semibold">Sources :</span>
                          {item.sources.map((s, i) => (
                            <span key={i} className="rounded-full bg-[var(--emsp-cream)]/10 px-2 py-0.5">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-[var(--text-muted)]">
                        Aucune réponse dans la base validée.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = "/fil/nouvelle"}
                        startIcon={<MessageCircle size={13} />}
                      >
                        Poser à la communauté sur le Fil
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Erreur globale */}
        {erreur && (
          <div className="px-3 pb-2 text-center text-sm text-[#b42318]" role="alert">
            {erreur}
          </div>
        )}

        {/* Zone saisie */}
        <div className="p-3 border-t border-[var(--emsp-cream)]/15">
          <div className="flex items-center gap-2">
            <textarea
              ref={finRef}
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ta question (ex: Comment m'inscrire ?)..."
              className={cx(
                "flex-1 resize-none rounded-[var(--radius-input)] border",
                "border-[var(--border-soft)] bg-[var(--bg-input)]",
                "px-3 py-2 text-sm text-[var(--text-primary)]",
                "focus:border-[var(--emsp-gold)] focus:outline-none",
                "placeholder:text-[var(--text-muted)]/60"
              )}
              disabled={chargement}
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
            <Button
              onClick={envoyer}
              disabled={chargement || !question.trim() || question.trim().length < 3}
              startIcon={chargement ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              className="flex-shrink-0"
            >
              {chargement ? "..." : "Envoyer"}
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--text-muted)]/80">
            Base validée par l'admin · RG12.3 : réponse étiquetée IA
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
