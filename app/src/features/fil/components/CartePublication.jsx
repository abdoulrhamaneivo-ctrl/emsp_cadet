import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Flag,
  Heart,
  MoreHorizontal,
  PartyPopper,
  PenLine,
  MessageCircle,
  ThumbsUp,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Avatar from "@shared/components/Avatar";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import ConfirmDialog from "@shared/components/ConfirmDialog";
import { filApi } from "../api";
import { ilYA } from "../relatif";
import { useInvaliderFil } from "../hooks/usePublications";
import FilCommentaires from "./FilCommentaires";
import ModaleSignaler from "./ModaleSignaler";
import ChipIA from "@shared/components/ChipIA";

const TONS = { annonce: "info", question: "gold", succes: "success" };
const LIBELLES = { annonce: "Annonce", question: "Question", succes: "Succès" };
const REACTIONS = [
  { code: "bravo", libelle: "Bravo", Icone: PartyPopper },
  { code: "merci", libelle: "Merci", Icone: Heart },
  { code: "utile", libelle: "Utile", Icone: ThumbsUp },
];

/**
 * Publication complète (doc 09 §4) : chip type + auteur + contenu (1re ligne
 * bold = titre implicite), réactions fermées togglables, zone commentaires
 * dépliable, menu auteur (éditer/supprimer tant que 0 commentaire) ou
 * signalement. Version masquée = panneau discret de modération.
 */
export default function CartePublication({ publication, monId, suiAdmin = false, index = 0 }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [edition, setEdition] = useState(false);
  const [contenuEdite, setContenuEdite] = useState(publication.contenu);
  const [suppression, setSuppression] = useState(false);
  const [signalement, setSignalement] = useState(false);
  const invalider = useInvaliderFil();

  const maPublication = publication.auteur?.id === monId;

  const reagir = useMutation({
    mutationFn: (code) => filApi.reagir(publication.id, code),
    onSuccess: () => invalider(),
    onError: () => toast.error("Réaction impossible pour le moment."),
  });
  const modifier = useMutation({
    mutationFn: () => filApi.modifier(publication.id, contenuEdite.trim()),
    onSuccess: () => {
      invalider();
      setEdition(false);
      toast.success("Publication mise à jour.");
    },
    onError: (e) =>
      toast.error(e?.response?.data?.detail ?? "Modification refusée."),
  });
  const supprimer = useMutation({
    mutationFn: () => filApi.supprimer(publication.id),
    onSuccess: () => {
      invalider();
      toast.success("Publication supprimée.");
    },
    onError: (e) =>
      toast.error(e?.response?.data?.detail ?? "Suppression refusée — elle a été commentée."),
  });

  if (publication.masquee) {
    return (
      <Card className="flex items-center gap-3 p-4">
        <Flag size={16} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
        <p className="text-sm text-[var(--text-muted)]">
          Publication retirée — en attente de modération.
        </p>
      </Card>
    );
  }

  const [premiere, ...suite] = publication.contenu.split("\n");
  const animer = index < 20; // perf : stagger sur les 20 premiers, fade simple ensuite
  const enVerification = publication.enVerification;

  return (
    <motion.article
      initial={animer ? { opacity: 0, y: 12 } : { opacity: 0 }}
      animate={{ opacity: 1, ...(animer ? { y: 0 } : {}) }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="min-w-0"
      aria-label={`${LIBELLES[publication.type]} de ${publication.auteur?.prenom ?? ""}`}
    >
      <Card className="flex min-w-0 flex-col gap-3 p-5">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar
            prenom={publication.auteur?.prenom}
            nom={publication.auteur?.nom}
            id={publication.auteur?.id}
            size="sm"
            className="mt-0.5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {publication.auteur?.prenom} {publication.auteur?.nom}
              </span>
              <Chip tone={TONS[publication.type]} className="shrink-0">
                {LIBELLES[publication.type]}
              </Chip>
              {enVerification && (
                <ChipIA />
              )}
            </p>
            <p className="truncate text-xs text-[var(--text-muted)]">
              {ilYA(publication.dateCreation)}
              {publication.auteur?.filiere ? ` · ${publication.auteur.filiere}` : ""}
            </p>
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              aria-label="Actions de la publication"
              aria-expanded={menuOuvert}
              onClick={() => setMenuOuvert((v) => !v)}
              className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--hover-bg)]"
            >
              <MoreHorizontal size={16} aria-hidden="true" />
            </button>
            {menuOuvert && (
              <div
                role="menu"
                className="absolute right-0 top-9 z-20 w-52 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-1.5 shadow-[var(--shadow-panel)]"
              >
                {maPublication && publication.nbCommentaires === 0 && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOuvert(false);
                      setEdition(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                  >
                    <PenLine size={14} aria-hidden="true" /> Modifier
                  </button>
                )}
                {maPublication && publication.nbCommentaires === 0 && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOuvert(false);
                      setSuppression(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[#b42318] hover:bg-[var(--hover-bg)]"
                  >
                    <Trash2 size={14} aria-hidden="true" /> Supprimer
                  </button>
                )}
                {!maPublication && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOuvert(false);
                      setSignalement(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                  >
                    <Flag size={14} aria-hidden="true" /> Signaler
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {edition ? (
          <div className="flex flex-col gap-2">
            <textarea
              rows={4}
              maxLength={1200}
              value={contenuEdite}
              onChange={(e) => setContenuEdite(e.target.value)}
              aria-label="Modifier la publication"
              className="w-full resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEdition(false);
                  setContenuEdite(publication.contenu);
                }}
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--hover-bg)]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => modifier.mutate()}
                disabled={contenuEdite.trim().length < 10 || modifier.isPending}
                className="rounded-[var(--radius-input)] bg-[var(--accent-green)] px-3 py-1.5 text-xs font-semibold text-[var(--emsp-cream)] disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-[var(--text-primary)]">
            <p className="break-words font-semibold">{premiere}</p>
            {suite.length > 0 && (
              <p className="whitespace-pre-wrap break-words text-[var(--text-muted)]">
                {suite.join("\n")}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-soft)] pt-3">
          {REACTIONS.map(({ code, libelle, Icone }) => {
            const active = publication.maReaction === code;
            return (
              <motion.button
                key={code}
                type="button"
                whileTap={{ scale: active ? 0.94 : 1.15 }}
                onClick={() => reagir.mutate(code)}
                aria-pressed={active}
                aria-label={`${libelle} (${publication.reactions[code]})`}
                className={
                  active
                    ? "flex items-center gap-1.5 rounded-full border border-[var(--emsp-gold)] bg-[var(--emsp-gold)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)]"
                    : "flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)] hover:border-[var(--emsp-gold)]"
                }
              >
                <Icone size={13} aria-hidden="true" />
                {publication.reactions[code] > 0 && (
                  <span className="tabular-nums">{publication.reactions[code]}</span>
                )}
              </motion.button>
            );
          })}
          <span className="ml-auto flex items-center gap-1 text-xs text-[var(--text-muted)] tabular-nums">
            <MessageCircle size={13} aria-hidden="true" />
            {publication.nbCommentaires}
          </span>
        </div>

        <FilCommentaires publication={publication} monId={monId} suiAdmin={suiAdmin} />
      </Card>

      <ConfirmDialog
        open={suppression}
        onClose={() => setSuppression(false)}
        onConfirm={() => supprimer.mutate()}
        loading={supprimer.isPending}
        title="Supprimer la publication ?"
        message="Elle disparaît du fil. Impossible tant qu'elle a reçu un commentaire."
        tone="danger"
        confirmLabel="Supprimer"
      />
      <ModaleSignaler
        open={signalement}
        onClose={() => setSignalement(false)}
        contentType="publication"
        objectId={publication.id}
      />
    </motion.article>
  );
}
