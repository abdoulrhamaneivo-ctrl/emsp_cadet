import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import Avatar from "@shared/components/Avatar";
import Button from "@shared/components/Button";
import { filApi } from "../api";
import { schemaPublication, TYPES_PUBLICATION } from "../schemas";
import { useInvaliderFil } from "../hooks/usePublications";

const LIBELLES = { annonce: "Annonce", question: "Question", succes: "Succès" };

/**
 * Composeur en tête de fil (doc 09 §4) — carte repliée « Partage une annonce,
 * pose une question… » qui s'ouvre au focus : segmented type + textarea
 * compteur + Publier. Question : hint annuaire + compteur quota/jour.
 */
export default function ComposeurPublication({ user, questionsRestantes = 1 }) {
  const [ouvert, setOuvert] = useState(false);
  const [type, setType] = useState("annonce");
  const [contenu, setContenu] = useState("");
  const [erreur, setErreur] = useState(null);
  const invalider = useInvaliderFil();

  const mutation = useMutation({
    mutationFn: () => filApi.publier(type, contenu.trim()),
    onSuccess: (publication) => {
      invalider();
      setContenu("");
      setOuvert(false);
      setErreur(null);
      toast.success(
        type === "question"
          ? "Question publiée — les Aînés répondent ici."
          : "Publication en ligne.",
      );
      if (publication.type === "question") invalider();
    },
    onError: (e) => {
      const detail = e?.response?.data?.detail;
      toast.error(detail ?? "Publication impossible pour le moment.");
    },
  });

  const validation = schemaPublication.safeParse({ type, contenu });
  const reste = questionsRestantes > 0;

  const publier = () => {
    if (!validation.success) {
      setErreur(validation.error.issues[0].message);
      return;
    }
    setErreur(null);
    mutation.mutate();
  };

  return (
    <motion.section
      layout
      aria-label="Créer une publication"
      className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-3">
        <Avatar prenom={user?.prenom} nom={user?.nom} id={user?.id} size="md" className="shrink-0" />
        {ouvert ? null : (
          <button
            type="button"
            onClick={() => setOuvert(true)}
            className="flex-1 rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-4 py-2.5 text-left text-sm text-[var(--text-muted)] hover:border-[var(--emsp-gold)]"
          >
            Partage une annonce, pose une question…
          </button>
        )}
      </div>
      <AnimatePresence>
        {ouvert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-3 pl-0 sm:pl-13">
              <div
                role="radiogroup"
                aria-label="Type de publication"
                className="flex w-fit gap-1 rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-panel-alt)] p-1"
              >
                {TYPES_PUBLICATION.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={type === t}
                    onClick={() => setType(t)}
                    className={
                      type === t
                        ? "rounded-[calc(var(--radius-input)-4px)] bg-[var(--emsp-green-deep)] px-3 py-1.5 text-xs font-semibold text-[var(--emsp-cream)]"
                        : "rounded-[calc(var(--radius-input)-4px)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-white/60"
                    }
                  >
                    {LIBELLES[t]}
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                maxLength={1200}
                value={contenu}
                onChange={(e) => {
                  setContenu(e.target.value);
                  setErreur(null);
                }}
                aria-label="Contenu de la publication"
                placeholder={
                  type === "question"
                    ? "Pose ta question — les Aînés répondent ici."
                    : type === "succes"
                      ? "Partage un succès de binôme, une étape franchie…"
                      : "Annonce une session, partage une ressource…"
                }
                className="w-full resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--emsp-gold)] focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[var(--text-muted)]">
                  {type === "question" &&
                    (reste ? (
                      "Les Aînés répondent ici — pour un suivi personnel, passe par l'annuaire."
                    ) : (
                      "Une question par jour — retombe demain."
                    ))}
                  {erreur && (
                    <span className="ml-1 font-medium text-[var(--danger)]">{erreur}</span>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] tabular-nums text-[var(--text-muted)]">
                    {contenu.length}/1200
                  </span>
                  <Button
                    size="sm"
                    onClick={publier}
                    loading={mutation.isPending}
                    disabled={!contenu.trim() || (type === "question" && !reste)}
                  >
                    <SendHorizonal size={14} aria-hidden="true" />
                    Publier
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
