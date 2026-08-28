import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MoreHorizontal, Flag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Avatar from "@shared/components/Avatar";
import { filApi } from "../api";
import { ilYA } from "../relatif";
import { useInvaliderFil } from "../hooks/usePublications";
import ModaleSignaler from "./ModaleSignaler";

/**
 * Un commentaire (doc 09 §4) — avatar xs + nom + « il y a … », menu
 * signaler/supprimer (moi ou admin), indenté si réponse.
 */
export default function CommentaireItem({ commentaire, monId, suiAdmin = false, reponse = false, onRepondre }) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [signalement, setSignalement] = useState(false);
  const invalider = useInvaliderFil();

  const supprimer = useMutation({
    mutationFn: () => filApi.supprimerCommentaire(commentaire.id),
    onSuccess: () => {
      invalider();
      toast.success("Commentaire supprimé.");
    },
    onError: () => toast.error("Suppression refusée."),
  });

  const peutSupprimer = commentaire.auteur?.id === monId || suiAdmin;

  return (
    <div className={reponse ? "ml-8 flex items-start gap-2" : "flex items-start gap-2"}>
      <Avatar
        prenom={commentaire.auteur?.prenom}
        nom={commentaire.auteur?.nom}
        id={commentaire.auteur?.id}
        size="xs"
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1 rounded-[var(--radius-card)] bg-[var(--bg-panel-alt)] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-primary)]">
            {commentaire.auteur?.prenom} {commentaire.auteur?.nom}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {ilYA(commentaire.dateCreation)}
          </span>
          {onRepondre && (
            <button
              type="button"
              onClick={onRepondre}
              className="ml-auto text-[11px] font-semibold text-[var(--accent-green)] hover:underline underline-offset-2"
            >
              Répondre
            </button>
          )}
          {(peutSupprimer || !reponse) && !onRepondre && (
            <div className="relative ml-auto">
              <button
                type="button"
                aria-label="Actions du commentaire"
                onClick={() => setMenuOuvert((v) => !v)}
                className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--hover-bg)]"
              >
                <MoreHorizontal size={14} aria-hidden="true" />
              </button>
              {menuOuvert && (
                <div
                  role="menu"
                  className="absolute right-0 top-6 z-20 w-44 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-1 shadow-[var(--shadow-panel)]"
                >
                  {!peutSupprimer && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOuvert(false);
                        setSignalement(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                    >
                      <Flag size={13} aria-hidden="true" /> Signaler
                    </button>
                  )}
                  {peutSupprimer && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOuvert(false);
                        supprimer.mutate();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-[#b42318] hover:bg-[var(--hover-bg)]"
                    >
                      <Trash2 size={13} aria-hidden="true" /> Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="whitespace-pre-wrap break-words text-sm text-[var(--text-primary)]">
          {commentaire.contenu}
        </p>
      </div>
      <ModaleSignaler
        open={signalement}
        onClose={() => setSignalement(false)}
        contentType="commentaire"
        objectId={commentaire.id}
      />
    </div>
  );
}
