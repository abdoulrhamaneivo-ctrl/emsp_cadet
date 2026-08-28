import { useState } from "react";
import Modal from "@shared/components/Modal";
import Button from "@shared/components/Button";
import { useContreProposer } from "../hooks/useRendezVous";

/**
 * Contre-proposition (doc 06 §2) : l'invité propose un autre créneau —
 * dateHeure future requise, lieu pré-rempli avec celui d'origine.
 */
export default function FormulaireContreProposition({ rdv, open, onClose }) {
  const [dateHeure, setDateHeure] = useState("");
  const [lieu, setLieu] = useState(rdv?.lieu ?? "");
  const [erreur, setErreur] = useState(null);
  const contreProposer = useContreProposer();

  const minDate = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  const soumettre = (e) => {
    e.preventDefault();
    const date = new Date(dateHeure);
    if (!dateHeure || Number.isNaN(date.getTime()) || date.getTime() <= Date.now() + 5 * 60 * 1000) {
      setErreur("Choisis un créneau au moins 5 minutes dans le futur.");
      return;
    }
    if (!lieu.trim()) {
      setErreur("Le lieu est requis.");
      return;
    }
    setErreur(null);
    contreProposer.mutate(
      { id: rdv.id, dateHeure, lieu: lieu.trim() },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Proposer un autre créneau">
      <form onSubmit={soumettre} className="flex flex-col gap-3.5">
        <div>
          <label htmlFor="cp-date" className="text-sm font-medium text-[var(--text-primary)]">
            Date et heure
          </label>
          <input
            id="cp-date"
            type="datetime-local"
            min={minDate}
            value={dateHeure}
            onChange={(e) => setDateHeure(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="cp-lieu" className="text-sm font-medium text-[var(--text-primary)]">
            Lieu
          </label>
          <input
            id="cp-lieu"
            type="text"
            value={lieu}
            onChange={(e) => setLieu(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
          />
        </div>
        {erreur && <p className="text-xs font-medium text-[var(--danger)]">{erreur}</p>}
        <p className="text-xs text-[var(--text-muted)]">
          {rdv?.organisateur?.prenom} pourra confirmer ton créneau ou le refuser.
        </p>
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Retour
          </Button>
          <Button type="submit" disabled={contreProposer.isPending}>
            Envoyer la contre-proposition
          </Button>
        </div>
      </form>
    </Modal>
  );
}
