import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, SendHorizonal, Video } from "lucide-react";
import { toast } from "sonner";
import Avatar from "@shared/components/Avatar";
import Card from "@shared/components/Card";
import { SkeletonCard } from "@shared/components/Skeleton";
import { useAuth } from "@app/providers/Auth";
import {
  useDiscussion,
  useEvenement,
  useInvaliderEvenement,
  useParticipants,
  useToggleInscription,
} from "../hooks/useEvenements";
import { evenementsApi } from "../api";
import { schemaMessageEvenement } from "../schemas";
import BlocInscription from "../components/BlocInscription";
import ListeParticipants from "../components/ListeParticipants";
import ModaleCreationEvenement from "../components/ModaleCreationEvenement";

/** En-tête long date fr (doc 10 §5). */
function dateLongue(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** /evenements/:id (doc 10 §5) — header vert kente, description, discussion
 * réservée aux INSCRITS (les autres lisent avec encart CTA), colonne sticky
 * inscription + participants. */
export default function EvenementDetailPage() {
  const { evenementId } = useParams();
  const naviguer = useNavigate();
  const { user } = useAuth();
  const { data: evenement, isLoading } = useEvenement(evenementId);
  const inscrit = evenement?.inscrit ?? false;
  const { data: discussion } = useDiscussion(evenementId, true);
  const { data: participants } = useParticipants(evenementId, true);
  const invalider = useInvaliderEvenement(evenementId);
  const toggle = useToggleInscription(evenementId);
  const [message, setMessage] = useState("");
  const [modification, setModification] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }
  if (!evenement) {
    return (
      <Card className="p-6 text-sm text-[var(--text-muted)]">
        Événement introuvable —{" "}
        <Link to="/evenements" className="font-semibold underline">
          retour à la liste
        </Link>
        .
      </Card>
    );
  }

  const organisateurOuAdmin =
    user?.id === evenement.organisateur?.id || user?.isAdmin;
  const complet = evenement.nbInscrits >= evenement.capaciteMax;

  const ecrire = () => {
    const contenu = message.trim();
    const resultat = schemaMessageEvenement.safeParse({ contenu });
    if (!resultat.success) {
      toast.error(resultat.error.issues[0].message);
      return;
    }
    evenementsApi
      .ecrireMessage(evenementId, contenu)
      .then(() => {
        setMessage("");
        invalider();
      })
      .catch((e) =>
        toast.error(e?.response?.data?.detail ?? "Message impossible pour le moment."),
      );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header vert profond pleine largeur + kente (recette annuaire T1) */}
      <header className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--emsp-green-deep)] px-5 py-6 text-[var(--emsp-cream)] md:px-8">
        <div className="kente-pattern absolute inset-0" aria-hidden="true" />
        <div className="relative">
          <button
            type="button"
            onClick={() => naviguer("/evenements")}
            className="mb-3 flex items-center gap-1.5 rounded-full p-1.5 text-sm text-[var(--emsp-cream)]/90 hover:bg-white/10"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Tous les événements
          </button>
          {evenement.type && (
            <p className="text-xs font-semibold text-[var(--emsp-gold)]">{evenement.type}</p>
          )}
          <h1 className="font-display text-2xl font-bold">{evenement.titre}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-[var(--emsp-cream)]/90">
            <Avatar
              prenom={evenement.organisateur?.prenom}
              nom={evenement.organisateur?.nom}
              id={evenement.organisateur?.id}
              size="xs"
            />
            Organisé par {evenement.organisateur?.prenom} {evenement.organisateur?.nom}
          </p>
          <p className="mt-2 text-sm text-[var(--emsp-cream)]/90">
            {dateLongue(evenement.dateHeure)} ·{" "}
            {evenement.enLigne ? (
              <span className="inline-flex items-center gap-1">
                <Video size={14} aria-hidden="true" /> En ligne
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} aria-hidden="true" /> {evenement.lieu}
              </span>
            )}
          </p>
          {evenement.annule && (
            <p className="mt-2 inline-block rounded-full bg-[var(--danger-solid)] px-3 py-1 text-xs font-bold text-white">
              Événement annulé
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Colonne principale */}
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Au programme
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
              {evenement.description}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
              Discussion de l'événement
            </h2>
            {inscrit ? (
              <>
                <div className="mt-3 flex flex-col gap-3">
                  {(discussion ?? []).map((m) => (
                    <div key={m.id} className="flex items-start gap-2">
                      <Avatar
                        prenom={m.auteur?.prenom}
                        nom={m.auteur?.nom}
                        id={m.auteur?.id}
                        size="xs"
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1 rounded-[var(--radius-card)] bg-[var(--bg-panel-alt)] px-3 py-2">
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {m.auteur?.prenom} {m.auteur?.nom}
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {m.contenu}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(discussion ?? []).length === 0 && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Lance la discussion — pose ta question aux participants.
                    </p>
                  )}
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <label htmlFor="message-evenement" className="sr-only">
                    Ton message
                  </label>
                  <textarea
                    id="message-evenement"
                    rows={1}
                    maxLength={600}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        ecrire();
                      }
                    }}
                    placeholder="Écris aux participants…"
                    className="min-h-9 flex-1 resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm focus:border-[var(--emsp-gold)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={ecrire}
                    disabled={!message.trim()}
                    aria-label="Envoyer le message"
                    className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-input)] bg-[var(--accent-green)] text-[var(--text-on-accent)] disabled:opacity-50"
                  >
                    <SendHorizonal size={15} aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 rounded-[var(--radius-input)] border border-[var(--emsp-gold)]/50 bg-[var(--emsp-gold)]/10 px-4 py-3 text-sm text-[var(--text-primary)]">
                Inscris-toi pour participer à l'échange — tu peux lire les messages
                quand tu es inscrit, et écrire uniquement ici.
              </div>
            )}
          </Card>
        </div>

        {/* Colonne sticky */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <BlocInscription
            evenement={evenement}
            inscrit={inscrit}
            complet={complet}
            organisateurOuAdmin={organisateurOuAdmin}
            onToggle={() => toggle.mutate()}
            chargement={toggle.isPending}
            onModifier={() => setModification(true)}
          />
          <ListeParticipants participants={participants?.results ?? []} total={evenement.capaciteMax} />
        </div>
      </div>

      {organisateurOuAdmin && (
        <ModaleCreationEvenement
          open={modification}
          onClose={() => setModification(false)}
          evenement={evenement}
        />
      )}
    </div>
  );
}
