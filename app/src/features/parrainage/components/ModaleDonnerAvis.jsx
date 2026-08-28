import { useState } from "react";
import { Star } from "lucide-react";
import Modal from "@shared/components/Modal";
import Button from "@shared/components/Button";
import { useDonnerAvis } from "../hooks/useDemandes";

const COMMENTAIRE_MIN = 20;
const COMMENTAIRE_MAX = 600;

/**
 * ModaleDonnerAvis (RG6, doc 07) — revue d'un binôme clos.
 * Note 1..5 (étoiles or) + commentaire 20..600. UN seul avis par binôme :
 * le serveur répond 409 si déjà donné — le front masque le CTA après succès.
 */
export default function ModaleDonnerAvis({ binome, autre, onClose }) {
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const donner = useDonnerAvis();

  if (!binome) return null;

  const valide = note >= 1 && commentaire.trim().length >= COMMENTAIRE_MIN;

  const publier = () => {
    donner.mutate(
      { parrainageId: binome.id, note, commentaire: commentaire.trim() },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Ton avis sur ${autre?.prenom} ${autre?.nom}`}
      subtitle="Il aide les futurs cadets à choisir — sois sincère et concret."
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={donner.isPending}>
            Plus tard
          </Button>
          <Button variant="primary" onClick={publier} disabled={!valide || donner.isPending} loading={donner.isPending}>
            Publier mon avis
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div role="radiogroup" aria-label="Ta note de 1 à 5 étoiles" className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((valeur) => {
            const active = valeur <= note;
            return (
              <button
                key={valeur}
                type="button"
                role="radio"
                aria-checked={note === valeur}
                aria-label={`${valeur} étoile${valeur > 1 ? "s" : ""}`}
                onClick={() => setNote(valeur)}
                className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)]"
              >
                <Star
                  size={26}
                  aria-hidden="true"
                  className={active ? "fill-[var(--emsp-gold)] text-[var(--emsp-gold)]" : "text-[var(--border-structural)]/30"}
                />
              </button>
            );
          })}
          {note > 0 && (
            <span className="ml-2 text-sm font-semibold text-[var(--accent-gold)]">
              {note}/5
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="avis-commentaire" className="text-sm font-medium text-[var(--text-primary)]">
            Ton commentaire
          </label>
          <textarea
            id="avis-commentaire"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value.slice(0, COMMENTAIRE_MAX))}
            rows={4}
            placeholder="Ex : patiente et méthodique — elle m'a débloquée sur les jointures SQL en deux sessions."
            className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-green)] focus:outline-none focus:ring-2 focus:ring-[var(--emsp-green-luminous)]/20"
          />
          <p className="text-[11px] text-[var(--text-muted)]">
            {commentaire.trim().length < COMMENTAIRE_MIN
              ? `Minimum ${COMMENTAIRE_MIN} caractères — ${COMMENTAIRE_MIN - commentaire.trim().length} restant${COMMENTAIRE_MIN - commentaire.trim().length > 1 ? "s" : ""}.`
              : `${commentaire.length}/${COMMENTAIRE_MAX}`}
          </p>
        </div>
      </div>
    </Modal>
  );
}
