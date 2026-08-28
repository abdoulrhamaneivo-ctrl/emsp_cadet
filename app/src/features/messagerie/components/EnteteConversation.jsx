import { ArrowLeft, Users } from "lucide-react";
import Avatar from "@shared/components/Avatar";
import Chip from "@shared/components/Chip";

/**
 * Entête de conversation (doc 08 §5) : panneau vert opaque sticky. Privé =
 * identité interlocuteur + présence ; famille/groupe = icône + titre + nombre
 * de membres (casse naturelle, pas de chip présence en groupe).
 */
export default function EnteteConversation({ conversation, surRetour }) {
  const prive = conversation?.type === "prive";
  const interlocuteur = prive ? conversation.interlocuteur : null;
  const groupe = conversation?.groupe ?? null;
  if (!interlocuteur && !groupe) return null;

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/10 bg-[var(--emsp-green-deep)] px-4 py-3 text-[var(--emsp-cream)]">
      {surRetour && (
        <button
          type="button"
          onClick={surRetour}
          className="rounded-full p-1.5 hover:bg-white/10 lg:hidden"
          aria-label="Retour aux conversations"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
      )}
      {interlocuteur ? (
        <Avatar prenom={interlocuteur.prenom} nom={interlocuteur.nom} id={interlocuteur.id} size="md" />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
          <Users size={18} aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {interlocuteur
            ? `${interlocuteur.prenom} ${interlocuteur.nom}`
            : (groupe.titre ?? "Groupe")}
        </p>
        <p className="truncate text-xs text-[var(--emsp-cream)]/90">
          {interlocuteur
            ? (interlocuteur.classe ?? interlocuteur.filiere ?? "Ton binôme")
            : `${groupe.membres?.length ?? 0} membres`}
        </p>
      </div>
      {interlocuteur && <Chip tone="gold">En ligne</Chip>}
    </div>
  );
}
