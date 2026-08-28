import { Users } from "lucide-react";
import Avatar from "@shared/components/Avatar";
import Card from "@shared/components/Card";

/** Liste des inscrits (doc 10 §5) — avatars + noms ; l'organisateur reste
 * visible même à pleine capacité (il fait partie des inscrits). */
export default function ListeParticipants({ participants, total }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Users size={16} className="text-[var(--accent-green)]" aria-hidden="true" />
        <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
          Participants
        </h2>
        <span className="ml-auto text-xs text-[var(--text-muted)] tabular-nums">
          {participants.length}/{total}
        </span>
      </div>
      {participants.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">
          Personne encore — sois parmi les premiers.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {participants.map((participant) => (
            <li key={participant.id} className="flex min-w-0 items-center gap-2">
              <Avatar
                prenom={participant.prenom}
                nom={participant.nom}
                id={participant.id}
                size="xs"
                className="shrink-0"
              />
              <span className="truncate text-sm text-[var(--text-primary)]">
                {participant.prenom} {participant.nom}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
