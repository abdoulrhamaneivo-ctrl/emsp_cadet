import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmDialog from "@shared/components/ConfirmDialog";

/**
 * Zone danger (doc 11 §4) — suppression de compte collapsée. Jamais visible
 * au premier écran ; double confirmation par prénom (doc 11 §2 n°8) et
 * anonymisation des avis expliquée AVANT l'accord.
 */
export default function ZoneDanger({ prenom, surSupprimer, chargement }) {
  const [ouvert, setOuvert] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [texte, setTexte] = useState("");

  const exact = texte.trim().toLowerCase() === (prenom ?? "").trim().toLowerCase();

  return (
    <section aria-labelledby="titre-danger" className="rounded-[var(--radius-card)] border border-[#b42318]/30 bg-[#b42318]/5">
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls="zone-danger-corps"
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center gap-2 px-5 py-3.5 text-left text-sm font-semibold text-[#b42318]"
      >
        <Trash2 size={15} aria-hidden="true" />
        Supprimer mon compte
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={ouvert ? "ml-auto rotate-180 transition-transform" : "ml-auto transition-transform"}
        />
      </button>
      <AnimatePresence initial={false}>
        {ouvert && (
          <motion.div
            id="zone-danger-corps"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-5 pb-4 text-sm text-[var(--text-muted)]">
              <p>
                Ton compte est désactivé et ton adresse anonymisée. Les avis que tu as
                publiés restent mais deviennent anonymes — les binômes en cours prennent fin.
              </p>
              <p className="font-medium text-[#b42318]">Cette action est définitive.</p>
              <button
                type="button"
                onClick={() => setConfirmation(true)}
                className="w-fit rounded-[var(--radius-input)] bg-[#b42318] px-3.5 py-2 text-xs font-bold text-white hover:opacity-90"
              >
                Je comprends — supprimer mon compte
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={confirmation}
        onClose={() => {
          setConfirmation(false);
          setTexte("");
        }}
        title="Dernière confirmation"
        message={`Saisis ton prénom (« ${prenom} ») pour confirmer la suppression définitive.`}
        tone="danger"
        confirmLabel="Supprimer définitivement"
        loading={chargement}
        onConfirm={() => {
          if (exact) surSupprimer();
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[var(--text-primary)]">Ton prénom</span>
          <input
            className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#b42318] focus:outline-none"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            maxLength={80}
            autoComplete="off"
          />
        </label>
      </ConfirmDialog>
    </section>
  );
}
