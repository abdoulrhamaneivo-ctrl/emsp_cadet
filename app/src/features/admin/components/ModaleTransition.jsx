import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import Modal from "@shared/components/Modal";
import Button from "@shared/components/Button";
import { apiClient } from "@shared/api/client";

/** Aperçu de transition (doc 15 §2). */
function useApercu(open) {
  return useQuery({
    queryKey: ["transition-apercu"],
    queryFn: () => apiClient.get("/api/admin/transition-apercu/").then((r) => r.data),
    enabled: open,
  });
}

/**
 * Modale « Clôturer l'année » — 3 étapes (doc 15 §4) :
 * 1 récapitulatif + anomalies bloquantes, 2 ajustements (select par ligne),
 * 3 confirmation forte par saisie « TRANSITION <année> ».
 * RÈGLE IVO n°1 affichée en toutes lettres : les parrainages en cours sont
 * conservés, personne ne perd son Aîné ni ses filleuls.
 */
export default function ModaleTransition({ open, onClose }) {
  const client = useQueryClient();
  const { data: apercu, isLoading } = useApercu(open);
  const [etape, setEtape] = useState(1);
  const [decisions, setDecisions] = useState({});
  const [confirmation, setConfirmation] = useState("");

  const annee = new Date().getFullYear() + 1;
  const attendu = `TRANSITION ${annee}`;

  // Décisions par défaut dès l'arrivée de l'aperçu (étape 1 → 2).
  useMemo(() => {
    if (!apercu) return;
    const defauts = {};
    for (const p of apercu.promotions) defauts[p.id] = p.niveauSuivant;
    for (const f of apercu.finsDeCycle) defauts[f.id] = f.niveauSuivantPropose;
    setDecisions(defauts);
  }, [apercu]);

  const executer = useMutation({
    mutationFn: () =>
      apiClient.post("/api/admin/transition-executer/", { decisionParUser: decisions }),
    onSuccess: ({ data }) => {
      toast.success(data?.message ?? "Transition appliquée.");
      client.invalidateQueries(); // le niveau change TOUT (annuaire, RDV, quotas…)
      onClose();
      setEtape(1);
    },
    onError: (e) =>
      toast.error(e?.response?.data?.detail ?? "Transition refusée — rien n'a été modifié."),
  });

  const anomalies = apercu?.anomalies ?? [];
  const total = Object.keys(decisions).length;
  const peutExecuter = etape === 3 && confirmation.trim() === attendu && total > 0;

  const fermer = () => {
    onClose();
    setEtape(1);
    setConfirmation("");
  };

  return (
    <Modal
      open={open}
      onClose={fermer}
      title={`Clôturer l'année — Transition ${new Date().getFullYear()}→${annee}`}
      subtitle="Récapitulatif, ajustements, confirmation forte. Atomique : tout passe ou rien."
    >
      {/* Stepper */}
      <div className="mb-4 flex items-center gap-2" role="list" aria-label="Étapes">
        {["Récapitulatif", "Ajustements", "Confirmation"].map((libelle, i) => {
          const numero = i + 1;
          const actif = etape === numero;
          return (
            <button
              key={libelle}
              type="button"
              role="listitem"
              onClick={() => setEtape(numero)}
              aria-current={actif ? "step" : undefined}
              className={
                actif
                  ? "rounded-full bg-[var(--emsp-gold)] px-3 py-1 text-xs font-bold text-[#16281c]"
                  : "rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
              }
            >
              {numero}. {libelle}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {etape === 1 && (
          <motion.div
            key="etape1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-3"
          >
            {isLoading && <p className="text-sm text-[var(--text-muted)]">Chargement de l'aperçu…</p>}
            {apercu && (
              <>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {["L1→L2", "L2→L3", "L3→?", "M1→M2"].map((libelle, i) => {
                    const comptes = [
                      apercu.promotions.filter((p) => p.niveauActuel === "L1").length,
                      apercu.promotions.filter((p) => p.niveauActuel === "L2").length,
                      apercu.finsDeCycle.filter((f) => f.intention !== "fin_de_cycle").length,
                      apercu.promotions.filter((p) => p.niveauActuel === "M1").length,
                    ][i];
                    return (
                      <div
                        key={libelle}
                        className="rounded-[var(--radius-card)] border border-[var(--border-soft)] px-3 py-2 text-center"
                      >
                        <p className="font-display text-xl font-bold text-[var(--text-primary)]">{comptes}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{libelle}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-[var(--radius-input)] bg-[var(--emsp-green-mid)]/10 px-3 py-2 text-xs text-[var(--text-primary)]">
                  <strong>Règle de continuité :</strong> aucun parrainage en cours n'est
                  cassé — les alumni gardent leurs filleuls, les cadets gardent leur Aîné.
                </div>
                {anomalies.length > 0 && (
                  <div className="rounded-[var(--radius-input)] border-2 border-[#b42318] bg-[#b42318]/5 px-3 py-2 text-xs text-[#b42318]">
                    {anomalies.length} anomalie(s) à corriger avant exécution :
                    <ul className="mt-1 list-inside list-disc">
                      {anomalies.map((a) => (
                        <li key={a.user}>{a.user} — {a.raison}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={fermer}>Annuler</Button>
                  <Button onClick={() => setEtape(2)} disabled={anomalies.length > 0}>
                    Voir les ajustements
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {etape === 2 && (
          <motion.div
            key="etape2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-3"
          >
            <p className="text-xs text-[var(--text-muted)]">
              Ajuste chaque ligne si besoin (redoublement, fin de cycle changée).
            </p>
            <div className="max-h-64 overflow-y-auto pr-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--text-muted)]">
                    <th scope="col" className="py-1">Étudiant</th>
                    <th scope="col">Actuel</th>
                    <th scope="col">Année prochaine</th>
                  </tr>
                </thead>
                <tbody>
                  {[...(apercu?.promotions ?? []), ...(apercu?.finsDeCycle ?? [])].map((ligne) => (
                    <tr key={ligne.id} className="border-t border-[var(--border-soft)]">
                      <td className="py-1.5">
                        {ligne.user?.prenom} {ligne.user?.nom}
                        {ligne.parDefaut && (
                          <span className="ml-1.5 rounded-full bg-[var(--emsp-gold)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#8a6d00]">
                            par défaut
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-[var(--text-muted)]">{ligne.niveauActuel ?? ligne.intention}</td>
                      <td>
                        <select
                          aria-label={`Niveau suivant de ${ligne.user?.prenom}`}
                          className="rounded-[var(--radius-chip)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-2 py-1 text-xs"
                          value={decisions[ligne.id] ?? ligne.niveauSuivant ?? ligne.niveauSuivantPropose}
                          onChange={(e) =>
                            setDecisions((d) => ({ ...d, [ligne.id]: e.target.value }))
                          }
                        >
                          {["L1", "L2", "L3", "M1", "M2", "alumni"].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" onClick={() => setEtape(1)}>Retour</Button>
              <Button onClick={() => setEtape(3)}>Confirmer</Button>
            </div>
          </motion.div>
        )}

        {etape === 3 && (
          <motion.div
            key="etape3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm text-[var(--text-primary)]">
              <strong>{total}</strong> niveaux seront modifiés. Les parrainages en cours
              sont conservés. Les alumni passent au régime RG10.
            </p>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Saisis <strong>{attendu}</strong> pour activer l'exécution
              </span>
              <input
                className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm focus:border-[#b42318] focus:outline-none"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder={attendu}
                autoComplete="off"
              />
            </label>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" onClick={() => setEtape(2)}>Retour</Button>
              <Button
                variant="danger"
                loading={executer.isPending}
                disabled={!peutExecuter}
                onClick={() => executer.mutate()}
              >
                Exécuter la transition
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
