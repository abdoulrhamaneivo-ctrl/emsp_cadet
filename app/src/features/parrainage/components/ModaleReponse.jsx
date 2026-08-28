import { useState } from "react";
import Modal from "@shared/components/Modal";
import Button from "@shared/components/Button";
import Switch from "@shared/components/Switch";
import Avatar from "@shared/components/Avatar";
import { useRepondreDemande } from "../hooks/useDemandes";

/**
 * ModaleReponse (doc 05 §4) — refuser une demande reçue.
 * Checkbox « partager la raison » (Switch, RG UX) : le motif part au cadet
 * seulement s'il est coché ; la décision part toujours.
 */
export default function ModaleReponse({ demande, onClose }) {
  const [partager, setPartager] = useState(false);
  const [motif, setMotif] = useState("");
  const repondre = useRepondreDemande();

  if (!demande) return null;
  const cadet = demande.cadet ?? {};

  const refuser = () => {
    repondre.mutate(
      {
        demandeId: demande.id,
        decision: "refusee",
        options: { partagerMotif: partager, motifRefus: motif.trim() },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Refuser la demande de ${cadet.prenom} ${cadet.nom}`}
      subtitle="Le cadet est notifié de ta décision. Tu peux lui laisser la raison — c'est souvent plus respectueux."
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={repondre.isPending}>
            Retour
          </Button>
          <Button variant="danger" onClick={refuser} loading={repondre.isPending}>
            Confirmer le refus
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-[var(--radius-chip)] bg-[var(--bg-panel-alt)] p-3.5">
        <Avatar prenom={cadet.prenom ?? "?"} nom={cadet.nom ?? ""} id={cadet.id} size="md" />
        <p className="text-sm text-[var(--text-primary)]">
          {cadet.prenom} {cadet.nom} — {cadet.classe}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span id="label-partage" className="text-sm text-[var(--text-primary)]">
          Partager la raison avec le cadet
        </span>
        <Switch
          checked={partager}
          onChange={setPartager}
          label="Partager la raison avec le cadet"
        />
      </div>

      {partager && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="motif-refus" className="text-sm font-medium text-[var(--text-primary)]">
            Ta raison
          </label>
          <textarea
            id="motif-refus"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows={3}
            placeholder="Ex : mon emploi du temps de ce semestre ne me permet pas d'accompagner un cadet."
            className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-green)] focus:outline-none focus:ring-2 focus:ring-[var(--emsp-green-luminous)]/20"
          />
        </div>
      )}
    </Modal>
  );
}
