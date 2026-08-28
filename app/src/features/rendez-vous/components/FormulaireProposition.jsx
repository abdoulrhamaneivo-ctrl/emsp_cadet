import { useState } from "react";
import { toast } from "sonner";
import Modal from "@shared/components/Modal";
import Button from "@shared/components/Button";
import { schemaPropositionRDV } from "../schemas";
import { useProposerRdv } from "../hooks/useRendezVous";
import { cx } from "@shared/utils/cx";

/**
 * Modale de création (doc 06 §4) : 5 champs, validation zod temps réel,
 * segmented control Présentiel/Visio, datetime-local min = maintenant.
 */
export default function FormulaireProposition({ open, onClose, invites, invitePrerempli }) {
  const [champs, setChamps] = useState({
    inviteId: invitePrerempli?.id ?? "",
    titre: "",
    description: "",
    dateHeure: "",
    mode: "presentiel",
    lieu: "",
  });
  const [erreurs, setErreurs] = useState({});
  const proposer = useProposerRdv();

  const set = (cle) => (e) => setChamps((c) => ({ ...c, [cle]: e.target.value }));

  const soumettre = (e) => {
    e.preventDefault();
    const candidat = {
      ...champs,
      inviteId: Number(champs.inviteId),
      description: champs.description || undefined,
      lieu: champs.lieu.trim(),
    };
    const resultat = schemaPropositionRDV.safeParse(candidat);
    if (!resultat.success) {
      const cartes = {};
      resultat.error.issues.forEach((i) => {
        cartes[i.path[0]] = cartes[i.path[0]] ?? i.message;
      });
      setErreurs(cartes);
      return;
    }
    setErreurs({});
    proposer.mutate(resultat.data, {
      onSuccess: (rdv) => {
        onClose();
        toast(`Proposition envoyée à ${rdv.invite?.prenom ?? "ton binôme"}`);
      },
    });
  };

  const minDate = new Date(Date.now() - 60000).toISOString().slice(0, 16);

  return (
    <Modal open={open} onClose={onClose} title="Proposer un rendez-vous">
      <form onSubmit={soumettre} className="flex flex-col gap-3.5">
        <div>
          <label htmlFor="rdv-invite" className="text-sm font-medium text-[var(--text-primary)]">
            Invité
          </label>
          <select
            id="rdv-invite"
            value={champs.inviteId}
            onChange={set("inviteId")}
            className="mt-1 w-full rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
          >
            <option value="">— Choisir dans mon binôme —</option>
            {invites.map((u) => (
              <option key={u.id} value={u.id}>
                {u.prenom} {u.nom}
              </option>
            ))}
          </select>
          {erreurs.inviteId && <p className="mt-1 text-xs text-[var(--danger)]">{erreurs.inviteId}</p>}
        </div>

        <div>
          <label htmlFor="rdv-titre" className="text-sm font-medium text-[var(--text-primary)]">
            Titre
          </label>
          <input
            id="rdv-titre"
            type="text"
            value={champs.titre}
            onChange={set("titre")}
            placeholder="Ex. Séance sous-réseaux"
            className="mt-1 w-full rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
          />
          {erreurs.titre && <p className="mt-1 text-xs text-[var(--danger)]">{erreurs.titre}</p>}
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="rdv-date" className="text-sm font-medium text-[var(--text-primary)]">
              Date et heure
            </label>
            <input
              id="rdv-date"
              type="datetime-local"
              min={minDate}
              value={champs.dateHeure}
              onChange={set("dateHeure")}
              className="mt-1 w-full rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
            />
            {erreurs.dateHeure && <p className="mt-1 text-xs text-[var(--danger)]">{erreurs.dateHeure}</p>}
          </div>
          <div>
            <span className="text-sm font-medium text-[var(--text-primary)]">Mode</span>
            <div className="mt-1 grid grid-cols-2 gap-1 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-input)] p-1">
              {[
                { valeur: "presentiel", libelle: "Présentiel" },
                { valeur: "visio", libelle: "Visio" },
              ].map((option) => (
                <button
                  key={option.valeur}
                  type="button"
                  onClick={() => setChamps((c) => ({ ...c, mode: option.valeur }))}
                  className={cx(
                    "rounded-[calc(var(--radius-card)-4px)] px-3 py-1.5 text-sm font-medium transition-colors",
                    champs.mode === option.valeur
                      ? "bg-[var(--emsp-green-deep)] text-[var(--emsp-cream)]"
                      : "text-[var(--text-muted)] hover:bg-white/50",
                  )}
                >
                  {option.libelle}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="rdv-lieu" className="text-sm font-medium text-[var(--text-primary)]">
            {champs.mode === "visio" ? "Lien ou précision (optionnel)" : "Lieu"}
          </label>
          <input
            id="rdv-lieu"
            type="text"
            value={champs.lieu}
            onChange={set("lieu")}
            placeholder={champs.mode === "visio" ? "Ex. Lien visio EMSP" : "Ex. Salle B12"}
            className="mt-1 w-full rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
          />
          {erreurs.lieu && <p className="mt-1 text-xs text-[var(--danger)]">{erreurs.lieu}</p>}
        </div>

        <div>
          <label htmlFor="rdv-desc" className="text-sm font-medium text-[var(--text-primary)]">
            Description (optionnel)
          </label>
          <textarea
            id="rdv-desc"
            rows={2}
            value={champs.description}
            onChange={set("description")}
            className="mt-1 w-full resize-none rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
          />
        </div>

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={proposer.isPending}>
            Envoyer la proposition
          </Button>
        </div>
      </form>
    </Modal>
  );
}
