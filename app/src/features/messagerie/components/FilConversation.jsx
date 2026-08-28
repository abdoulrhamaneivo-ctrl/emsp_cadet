import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CalendarOff } from "lucide-react";
import Card from "@shared/components/Card";
import BulleMessage from "./BulleMessage";
import EnteteConversation from "./EnteteConversation";
import ZoneSaisie from "./ZoneSaisie";
import IndicateurTyping from "./IndicateurTyping";
import BanniereConnexion from "./BanniereConnexion";
import { useMessages } from "../hooks/useMessages";
import { useTyping } from "../hooks/useTyping";
import { useAuth } from "@app/providers/Auth";

/**
 * Fil de messages (doc 08 §5) : panel crème, scroll interne, séparateurs de
 * date, « Charger les anciens » prepend, scroll bas auto à l'ouverture.
 * Temps réel complet : bannière perte de lien, « Prénom écrit… », « ✓ lu ».
 */
export default function FilConversation({ conversation, surRetour }) {
  const { user } = useAuth();
  const {
    messages,
    hasMore,
    chargement,
    brouillon,
    setBrouillon,
    envoyer,
    chargerAnciens,
    envoyerBrut,
    etatConnexion,
    etatTyping,
    presence,
    luJusqua,
  } = useMessages(conversation.id);
  const surSaisie = useTyping(envoyerBrut, conversation.id);
  const refFin = useRef(null);

  // Scroll bas auto à l'ouverture et à chaque nouveau message
  useEffect(() => {
    refFin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const interlocuteur = conversation.type === "prive" ? conversation.interlocuteur : null;
  const auteurParId = new Map(
    conversation.groupe?.membres?.map((m) => [m.id, m]) ?? [],
  );

  // Séparateurs de date « Aujourd'hui » / « Hier » / date longue.
  // Le cache est « plus récent d'abord » (pagination descendante doc 08 §2) →
  // on réaffiche en ordre chronologique : plus ancien en haut (chat standard),
  // sinon le fil apparaît inversé et « Charger les anciens » en haut est faux.
  const avecSeparateurs = [];
  let precedente = null;
  for (const m of [...messages].reverse()) {
    const jour = new Date(m.dateEnvoi).toDateString();
    if (jour !== precedente) {
      precedente = jour;
      avecSeparateurs.push({ type: "separateur", jour: new Date(m.dateEnvoi) });
    }
    avecSeparateurs.push({ type: "message", message: m });
  }

  const libelleJour = (date) => {
    const aujourdHui = new Date().toDateString();
    const hier = new Date(Date.now() - 86400000).toDateString();
    if (date.toDateString() === aujourdHui) return "Aujourd'hui";
    if (date.toDateString() === hier) return "Hier";
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <BanniereConnexion visible={etatConnexion === "reconnexion"} />
      <EnteteConversation conversation={conversation} surRetour={surRetour} presence={presence} />
      <div
        role="log"
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-[var(--bg-panel-alt)]/40 p-4"
      >
        {hasMore && (
          <button
            type="button"
            onClick={chargerAnciens}
            className="mx-auto rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs font-medium text-[var(--text-muted)] hover:bg-white/50"
          >
            Charger les anciens messages
          </button>
        )}
        {chargement ? (
          <p className="py-8 text-center text-sm text-[var(--text-muted)]">Chargement…</p>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <CalendarOff size={28} className="text-[var(--text-muted)]" aria-hidden="true" />
            <p className="text-sm text-[var(--text-muted)]">
              Aucun message — lance la conversation !
            </p>
          </div>
        ) : (
          avecSeparateurs.map((entree, i) =>
            entree.type === "separateur" ? (
              <p
                key={`sep-${i}`}
                className="my-2 text-center text-[11px] font-semibold text-[var(--text-muted)]"
              >
                {libelleJour(entree.jour)}
              </p>
            ) : (
              <BulleMessage
                key={entree.message.id}
                message={entree.message}
                auteur={
                  entree.message.envoyeParMoi
                    ? user
                    : (interlocuteur ?? auteurParId.get(entree.message.auteurId))
                }
                luJusqua={luJusqua?.jusquaMessageId ?? null}
              />
            ),
          )
        )}
        <div ref={refFin} />
      </div>
      {etatTyping?.actif && (
        <IndicateurTyping prenom={interlocuteur?.prenom ?? ""} />
      )}
      <ZoneSaisie
        valeur={brouillon}
        onChange={(valeur) => {
          setBrouillon(valeur);
          surSaisie(valeur);
        }}
        onEnvoyer={envoyer}
      />
      <span className="sr-only">
        <Link to="/messagerie">Retour à la messagerie</Link>
      </span>
    </Card>
  );
}
