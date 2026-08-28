import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Modal from "@shared/components/Modal";
import Button from "@shared/components/Button";
import ConfirmDialog from "@shared/components/ConfirmDialog";
import { Switch } from "@mui/material";
import { evenementsApi } from "../api";
import { schemaEvenement } from "../schemas";
import { useInvaliderEvenement } from "../hooks/useEvenements";

const CHAMP =
  "w-full rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--emsp-gold)] focus:outline-none";

/** Valeur <input type="datetime-local"> → ISO 8601 avec offset local. */
function versIso(valeurLocale) {
  if (!valeurLocale) return "";
  const date = new Date(valeurLocale);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** ISO → valeur datetime-local (heure locale, pour préremplir en édition). */
function versLocal(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const decalage = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - decalage).toISOString().slice(0, 16);
}

const VIDE = {
  titre: "",
  description: "",
  dateHeure: "",
  lieu: "",
  enLigne: false,
  capaciteMax: 15,
  type: "",
};

/**
 * Création ET édition d'événement (doc 10 §5) — création aîné/admin, édition
 * organisateur/admin. En édition : bouton « Annuler l'événement » → PATCH
 * {annule:true} → le backend publie l'annonce automatique sur le Fil.
 */
export default function ModaleCreationEvenement({ open, onClose, evenement = null }) {
  const naviguer = useNavigate();
  const invalider = useInvaliderEvenement(evenement?.id);
  const edition = Boolean(evenement);
  const [form, setForm] = useState(VIDE);
  const [erreur, setErreur] = useState(null);
  const [annulation, setAnnulation] = useState(false);

  useEffect(() => {
    if (open && evenement) {
      setForm({
        titre: evenement.titre ?? "",
        description: evenement.description ?? "",
        dateHeure: versLocal(evenement.dateHeure),
        lieu: evenement.lieu ?? "",
        enLigne: evenement.enLigne ?? false,
        capaciteMax: evenement.capaciteMax ?? 15,
        type: evenement.type ?? "",
      });
    } else if (open) {
      setForm(VIDE);
    }
    setErreur(null);
  }, [open, evenement]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      edition ? evenementsApi.modifier(evenement.id, payload) : evenementsApi.creer(payload),
    onSuccess: (resultat) => {
      invalider();
      toast.success(edition ? "Événement mis à jour." : "Événement créé — annonce-le sur le Fil !");
      onClose();
      if (!edition) naviguer(`/evenements/${resultat.id}`);
    },
    onError: (e) => toast.error(e?.response?.data?.detail ?? "Action refusée."),
  });

  const annulerEvenement = useMutation({
    mutationFn: () => evenementsApi.modifier(evenement.id, { annule: true }),
    onSuccess: () => {
      invalider();
      toast.success("Événement annulé — les inscrits voient l'annonce sur le Fil.");
      setAnnulation(false);
      onClose();
    },
    onError: () => toast.error("Annulation impossible."),
  });

  const set = (champ, valeur) => setForm((f) => ({ ...f, [champ]: valeur }));

  const soumettre = () => {
    const payload = {
      ...form,
      dateHeure: versIso(form.dateHeure),
      capaciteMax: Number(form.capaciteMax),
    };
    const resultat = schemaEvenement.safeParse(payload);
    if (!resultat.success) {
      setErreur(resultat.error.issues[0].message);
      return;
    }
    setErreur(null);
    mutation.mutate(payload);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={edition ? "Modifier l'événement" : "Créer un événement"}
        subtitle={
          edition
            ? "Les changements sont immédiats pour les inscrits."
            : "Atelier, sortie ou session de révision — ouvert à plusieurs cadets."
        }
        actions={
          <>
            {edition && !evenement.annule && (
              <Button
                variant="danger"
                onClick={() => setAnnulation(true)}
                disabled={mutation.isPending}
                className="mr-auto"
              >
                Annuler l'événement
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
              Fermer
            </Button>
            <Button onClick={soumettre} loading={mutation.isPending}>
              {edition ? "Enregistrer" : "Créer"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="ev-titre" className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">
              Titre
            </label>
            <input
              id="ev-titre"
              className={CHAMP}
              value={form.titre}
              onChange={(e) => set("titre", e.target.value)}
              placeholder="Atelier SQL — jointures et agrégats"
              maxLength={90}
            />
          </div>
          <div>
            <label htmlFor="ev-desc" className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">
              Description
            </label>
            <textarea
              id="ev-desc"
              rows={4}
              className={`${CHAMP} resize-none`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Au programme, ce qu'il faut apporter, niveau attendu…"
              maxLength={1500}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ev-date" className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">
                Date et heure
              </label>
              <input
                id="ev-date"
                type="datetime-local"
                className={CHAMP}
                value={form.dateHeure}
                onChange={(e) => set("dateHeure", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ev-capacite" className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">
                Capacité
              </label>
              <input
                id="ev-capacite"
                type="number"
                min={2}
                max={100}
                className={CHAMP}
                value={form.capaciteMax}
                onChange={(e) => set("capaciteMax", e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-[var(--radius-input)] border border-[var(--border-soft)] px-3 py-2">
            <span className="text-sm text-[var(--text-primary)]">En ligne (webconférence)</span>
            <Switch
              checked={form.enLigne}
              onChange={(e) => set("enLigne", e.target.checked)}
              inputProps={{ "aria-label": "Événement en ligne" }}
            />
          </div>
          {!form.enLigne && (
            <div>
              <label htmlFor="ev-lieu" className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">
                Lieu
              </label>
              <input
                id="ev-lieu"
                className={CHAMP}
                value={form.lieu}
                onChange={(e) => set("lieu", e.target.value)}
                placeholder="Salle B12, Amphi A…"
                maxLength={200}
              />
            </div>
          )}
          <div>
            <label htmlFor="ev-type" className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">
              Tag (optionnel)
            </label>
            <input
              id="ev-type"
              className={CHAMP}
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              placeholder="Atelier, Révision, Sortie…"
              maxLength={24}
            />
          </div>
          {erreur && <p className="text-xs font-medium text-[var(--danger)]">{erreur}</p>}
        </div>
      </Modal>
      <ConfirmDialog
        open={annulation}
        onClose={() => setAnnulation(false)}
        onConfirm={() => annulerEvenement.mutate()}
        loading={annulerEvenement.isPending}
        tone="danger"
        title="Annuler l'événement ?"
        message="Une annonce automatique sera publiée sur le Fil pour prévenir les inscrits. C'est définitif."
        confirmLabel="Annuler l'événement"
      />
    </>
  );
}
