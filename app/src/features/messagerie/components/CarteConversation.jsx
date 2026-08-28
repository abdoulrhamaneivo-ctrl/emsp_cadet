import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Avatar from "@shared/components/Avatar";
import Card from "@shared/components/Card";
import { cx } from "@shared/utils/cx";
import { staggerItem } from "@shared/motion/variants";

/**
 * Carte de la liste (doc 08 §4) : avatar + nom + dernier message + heure +
 * badge or de non-lus (pop scale à l'incrément — doc 08 §6).
 */
export default function CarteConversation({ conversation, active }) {
  const prive = conversation.type === "prive";
  const nom = prive
    ? `${conversation.interlocuteur.prenom} ${conversation.interlocuteur.nom}`
    : conversation.groupe?.titre ?? "Groupe";
  const initiales = prive
    ? { prenom: conversation.interlocuteur.prenom, nom: conversation.interlocuteur.nom, id: conversation.interlocuteur.id }
    : null;

  const heure = conversation.dernierMessage
    ? new Date(conversation.dernierMessage.dateEnvoi).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <motion.div variants={staggerItem}>
      <Link to={`/messagerie/${conversation.id}`} className="block min-w-0">
        <Card
          interactive
          className={cx(
            "flex min-w-0 items-center gap-3 p-3.5",
            active && "border-2 border-[var(--emsp-gold)]",
          )}
        >
          {initiales ? (
            <Avatar {...initiales} size="md" className="shrink-0" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--emsp-green-deep)] text-[var(--emsp-cream)]">
              <Users size={18} aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-bold text-[var(--text-primary)]">{nom}</span>
              <span className="shrink-0 text-[11px] text-[var(--text-muted)] tabular-nums">{heure}</span>
            </span>
            <span className="mt-0.5 flex items-center justify-between gap-2">
              <span className="truncate text-sm text-[var(--text-muted)]">
                {conversation.dernierMessage?.contenu ?? "—"}
              </span>
              {conversation.nonLus > 0 && (
                <motion.span
                  key={conversation.nonLus}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--emsp-gold)] px-1.5 text-[11px] font-bold text-[#16281c] tabular-nums"
                  aria-label={`${conversation.nonLus} messages non lus`}
                >
                  {conversation.nonLus}
                </motion.span>
              )}
            </span>
          </span>
        </Card>
      </Link>
    </motion.div>
  );
}
