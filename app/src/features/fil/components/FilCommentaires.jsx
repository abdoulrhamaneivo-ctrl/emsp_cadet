import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { filApi } from "../api";
import { schemaCommentaire } from "../schemas";
import { useCommentaires, useInvaliderFil } from "../hooks/usePublications";
import CommentaireItem from "./CommentaireItem";

const creeCle = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * Zone commentaires dépliable (doc 09 §4) : AnimatePresence height auto,
 * liste chronologique, champ inline pour répondre à UN niveau, insertion
 * optimiste top + idempotencyKey.
 */
export default function FilCommentaires({ publication, monId, suiAdmin = false }) {
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [reponseA, setReponseA] = useState(null); // Commentaire|null
  const { data, isLoading: chargement } = useCommentaires(publication.id, ouvert);
  const invalider = useInvaliderFil();
  const commentaires = data?.results ?? [];

  const commenter = useMutation({
    mutationFn: ({ contenu, parentId }) =>
      filApi.commenter(publication.id, contenu, creeCle(), parentId),
    onSuccess: () => {
      invalider();
      setTexte("");
      setReponseA(null);
    },
    onError: (e) => toast.error(e?.response?.data?.detail ?? "Commentaire refusé."),
  });

  const envoyer = () => {
    const contenu = texte.trim();
    const resultat = schemaCommentaire.safeParse({ contenu });
    if (!resultat.success) {
      toast.error(resultat.error.issues[0].message);
      return;
    }
    // Réponse imbriquée dans une réponse → aplatie au niveau 1 par le serveur ;
    // le front envoie le parent visible, la mention @ est déjà dans le texte.
    commenter.mutate({ contenu, parentId: reponseA?.id ?? null });
  };

  const racines = commentaires.filter((c) => c.parentId === null);
  const reponsesParParent = new Map();
  for (const c of commentaires) {
    if (c.parentId !== null) {
      reponsesParParent.set(c.parentId, [...(reponsesParParent.get(c.parentId) ?? []), c]);
    }
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls={`commentaires-${publication.id}`}
        onClick={() => setOuvert((v) => !v)}
        className="flex w-fit items-center gap-1.5 text-xs font-semibold text-[var(--accent-green)] hover:underline underline-offset-2"
      >
        <MessageSquare size={13} aria-hidden="true" />
        {publication.nbCommentaires > 0
          ? `${publication.nbCommentaires} commentaire${publication.nbCommentaires > 1 ? "s" : ""}`
          : "Commenter"}
      </button>
      <AnimatePresence initial={false}>
        {ouvert && (
          <motion.div
            id={`commentaires-${publication.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border-soft)] pt-3">
              {chargement ? (
                <p className="py-2 text-xs text-[var(--text-muted)]">Chargement des commentaires…</p>
              ) : racines.length === 0 ? (
                <p className="py-1 text-xs text-[var(--text-muted)]">
                  Sois le premier à commenter.
                </p>
              ) : (
                racines.map((c) => (
                  <div key={c.id} className="flex flex-col gap-2">
                    <CommentaireItem
                      commentaire={c}
                      monId={monId}
                      suiAdmin={suiAdmin}
                      onRepondre={() => {
                        setReponseA(c);
                        document.getElementById(`champ-commentaire-${publication.id}`)?.focus();
                      }}
                    />
                    {(reponsesParParent.get(c.id) ?? []).map((r) => (
                      <CommentaireItem
                        key={r.id}
                        commentaire={r}
                        monId={monId}
                        suiAdmin={suiAdmin}
                        reponse
                      />
                    ))}
                  </div>
                ))
              )}

              {reponseA && (
                <p className="text-xs text-[var(--text-muted)]">
                  Réponse à {reponseA.auteur?.prenom}{" "}
                  <button
                    type="button"
                    onClick={() => setReponseA(null)}
                    className="font-semibold text-[var(--accent-green)] hover:underline"
                  >
                    annuler
                  </button>
                </p>
              )}
              <div className="flex items-end gap-2">
                <label htmlFor={`champ-commentaire-${publication.id}`} className="sr-only">
                  Ton commentaire
                </label>
                <textarea
                  id={`champ-commentaire-${publication.id}`}
                  rows={1}
                  maxLength={600}
                  value={texte}
                  onChange={(e) => setTexte(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      envoyer();
                    }
                  }}
                  placeholder={
                    reponseA
                      ? `Répondre à ${reponseA.auteur?.prenom ?? ""}…`
                      : "Ajoute un commentaire constructif…"
                  }
                  className="min-h-9 flex-1 resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--emsp-gold)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={envoyer}
                  disabled={commenter.isPending || !texte.trim()}
                  aria-label="Envoyer le commentaire"
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-input)] bg-[var(--accent-green)] text-[var(--text-on-accent)] disabled:opacity-50"
                >
                  <SendHorizonal size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
