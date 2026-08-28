import { useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import Button from "@shared/components/Button";
import { schemaMessage } from "../schemas";
import { cx } from "@shared/utils/cx";

/**
 * Zone de saisie (doc 08 §5) : textarea auto-expand 1..6 lignes, Enter = envoyer,
 * Maj+Enter = nouvelle ligne, compteur live (max 2000), Escape vide le champ.
 */
export default function ZoneSaisie({ valeur, onChange, onEnvoyer }) {
  const ref = useRef(null);
  const [erreur, setErreur] = useState(null);

  const envoyer = () => {
    const contenu = valeur.trim();
    const resultat = schemaMessage.safeParse({ contenu });
    if (!resultat.success) {
      setErreur(resultat.error.issues[0].message);
      return;
    }
    setErreur(null);
    onEnvoyer();
  };

  return (
    <div className="sticky bottom-0 border-t border-[var(--border-soft)] bg-[var(--bg-panel)] p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="zone-message" className="sr-only">
            Ton message
          </label>
          <textarea
            id="zone-message"
            ref={ref}
            rows={1}
            value={valeur}
            onChange={(e) => {
              onChange(e.target.value);
              setErreur(null);
              // auto-expand jusqu'à 6 lignes
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 144)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                envoyer();
              }
              if (e.key === "Escape") {
                onChange("");
                e.target.blur();
              }
            }}
            maxLength={2000}
            placeholder="Écris ton message…"
            className={cx(
              "w-full resize-none rounded-[var(--radius-card)] border bg-[var(--bg-input)] px-3.5 py-2.5 text-sm",
              "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
              "focus:border-[var(--emsp-gold)] focus:outline-none",
            )}
          />
          <div className="mt-1 flex items-center justify-between px-1 text-[11px]">
            <span className={cx("text-[var(--text-muted)]", erreur && "text-[var(--danger)] font-medium")}>
              {erreur ?? "Entrée pour envoyer · Maj+Entrée pour un retour à la ligne"}
            </span>
            <span className="text-[var(--text-muted)] tabular-nums">
              {valeur.length}/2000
            </span>
          </div>
        </div>
        <Button onClick={envoyer} disabled={!valeur.trim()} aria-label="Envoyer le message">
          <SendHorizonal size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Envoyer</span>
        </Button>
      </div>
    </div>
  );
}
