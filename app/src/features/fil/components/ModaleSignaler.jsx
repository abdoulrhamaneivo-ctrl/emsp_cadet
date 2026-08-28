import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Modal from "@shared/components/Modal";
import Button from "@shared/components/Button";
import { filApi } from "../api";
import { RAISONS_SIGNALEMENT } from "../schemas";

/**
 * Signalement (doc 09 §3/§7) — raisons prescrites en radios obligatoires,
 * effet immédiat : la cible est masquée du feed (panneau de modération).
 */
export default function ModaleSignaler({ open, onClose, contentType, objectId }) {
  const [raison, setRaison] = useState(null);
  const envoyer = useMutation({
    mutationFn: () => filApi.signaler(contentType, objectId, raison),
    onSuccess: () => {
      toast.success("Signalement envoyé — la modération prend le relais.");
      setRaison(null);
      onClose();
    },
    onError: () => toast.error("Signalement impossible pour le moment."),
  });

  const fermer = () => {
    setRaison(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={fermer}
      title="Signaler ce contenu"
      subtitle="La modération de l'école examine chaque signalement."
      actions={
        <>
          <Button variant="ghost" onClick={fermer} disabled={envoyer.isPending}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={() => envoyer.mutate()}
            loading={envoyer.isPending}
            disabled={!raison}
          >
            Signaler
          </Button>
        </>
      }
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Raison du signalement</legend>
        {RAISONS_SIGNALEMENT.map(({ code, libelle }) => (
          <label
            key={code}
            className={
              raison === code
                ? "flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-input)] border border-[var(--emsp-gold)] bg-[var(--emsp-gold)]/10 px-3 py-2.5 text-sm"
                : "flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-input)] border border-[var(--border-soft)] px-3 py-2.5 text-sm hover:bg-[var(--hover-bg)]"
            }
          >
            <input
              type="radio"
              name={`raison-${contentType}-${objectId}`}
              value={code}
              checked={raison === code}
              onChange={() => setRaison(code)}
              className="accent-[var(--accent-green)]"
            />
            {libelle}
          </label>
        ))}
      </fieldset>
    </Modal>
  );
}
