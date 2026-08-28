import { motion } from "framer-motion";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import Avatar from "@shared/components/Avatar";
import { cx } from "@shared/utils/cx";

/**
 * Bulle de message (doc 08 §5) — mienne accent-green texte crème à droite,
 * l'autre panneau clair à gauche. Coin asymétrique 16/16/16/4 = signature chat.
 * États d'envoi : en_cours (horloge), envoyé (✓), echec (alerte, cliquable).
 */
export default function BulleMessage({ message, auteur }) {
  const mienne = message.envoyeParMoi;
  const echec = message.etat === "echec";
  const enCours = message.etat === "en_cours";

  const heure = new Date(message.dateEnvoi).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      className={cx("flex w-full gap-2.5", mienne ? "justify-end" : "justify-start")}
    >
      {!mienne && (
        <Avatar
          prenom={auteur?.prenom ?? "?"}
          nom={auteur?.nom ?? ""}
          id={auteur?.id}
          size="sm"
          className="mt-auto shrink-0"
        />
      )}
      <div className={cx("max-w-[78%]", mienne && "flex flex-col items-end")}>
        <div
          className={cx(
            "px-4 py-2.5 text-sm leading-relaxed",
            "rounded-[16px] shadow-[var(--shadow-card)]",
            mienne
              ? "rounded-br-[4px] bg-[var(--emsp-green-deep)] text-[var(--emsp-cream)]"
              : "rounded-bl-[4px] border border-[var(--border-soft)] bg-[var(--bg-panel-alt)] text-[var(--text-primary)]",
            echec && "border-2 border-[var(--danger)]",
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.contenu}</p>
        </div>
        <div
          className={cx(
            "mt-1 flex items-center gap-1 text-[11px] text-[var(--text-muted)] tabular-nums",
            mienne && "flex-row-reverse",
          )}
        >
          <span>{heure}</span>
          {mienne &&
            (enCours ? (
              <Loader2 size={11} className="animate-spin" aria-label="Envoi en cours" />
            ) : echec ? (
              <AlertCircle size={11} className="text-[var(--danger)]" aria-label="Échec — cliquer pour renvoyer" />
            ) : (
              <Check size={11} aria-label="Envoyé" />
            ))}
        </div>
      </div>
    </motion.div>
  );
}
