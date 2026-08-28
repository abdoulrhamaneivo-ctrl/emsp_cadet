import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Button from "@shared/components/Button";
import Card from "@shared/components/Card";
import ConfirmDialog from "@shared/components/ConfirmDialog";
import { SkeletonCard } from "@shared/components/Skeleton";
import EmptyState from "@shared/components/EmptyState";
import { staggerContainer } from "@shared/motion/variants";
import { useAuth } from "@app/providers/Auth";
import CarteDemandeEnvoyee from "../components/CarteDemandeEnvoyee";
import CarteDemandeRecue from "../components/CarteDemandeRecue";
import ModaleReponse from "../components/ModaleReponse";
import { useDemandes, useAnnulerDemandeEnvoyee, useRepondreDemande } from "../hooks/useDemandes";
import { useMonParrainage } from "@features/annuaire/hooks/useParrains";
import { peutVoirRecues, peutAccepter, PLACES_MAX } from "../rules";

/**
 * /mes-demandes (doc 05 §4) — suivi bidirectionnel.
 * Onglet Envoyées : timeline + annulation (RG1). Onglet Reçues : accepter /
 * refuser, seulement si candidature aîné ouverte (RG8) — l'onglet n'existe
 * pas pour un L1 (RG7).
 */
export default function MesDemandesPage() {
  const { user } = useAuth();
  const [onglet, setOnglet] = useState("envoyees");
  const [annulation, setAnnulation] = useState(null); // demande envoyée à annuler
  const [refus, setRefus] = useState(null); // demande reçue à refuser

  const { data: monParrainage } = useMonParrainage();
  const { data: envoyees, isPending: chargeEnvoyees } = useDemandes("envoyees");
  const recuesActivees = peutVoirRecues(user);
  const { data: recues, isPending: chargeRecues } = useDemandes("recues");

  const annuler = useAnnulerDemandeEnvoyee();
  const repondre = useRepondreDemande();

  const nbRecues = recues?.results?.length ?? 0;
  const nbCadets = monParrainage?.cadetsActifs?.length ?? 0;

  const confirmerAnnulation = () => {
    annuler.mutate(annulation.id, {
      onSuccess: () => {
        toast.success("Demande annulée — tu peux en envoyer une nouvelle.");
        setAnnulation(null);
      },
      onError: () => {
        toast.error("Impossible d'annuler. Réessaie.");
        setAnnulation(null);
      },
    });
  };

  const accepter = (demande) => {
    repondre.mutate(
      { demandeId: demande.id, decision: "acceptee" },
      {
        onSuccess: () => {
          toast.success(`${demande.cadet.prenom} rejoint tes cadets — la Famille est à jour.`);
        },
        onError: (erreur) => {
          toast.error(erreur?.response?.data?.detail ?? "Impossible d'accepter. Réessaie.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero vert profond opaque, même gabarit que l'annuaire (barre designer) */}
      <header className="sticky top-0 z-10 -mx-5 -mt-6 lg:-mx-10 lg:-mt-8">
        <div className="relative overflow-hidden border-b border-white/8 bg-[var(--emsp-green-deep)] px-5 py-7 lg:px-10 lg:py-8">
          <div className="kente-pattern absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <p className="font-display text-sm font-semibold text-[var(--emsp-gold)]">
              Ton parcours d'accompagnement
            </p>
            <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-[var(--emsp-cream)] lg:text-[1.75rem]">
              Mes demandes
            </h1>
            <p className="mt-1 text-sm text-[var(--emsp-cream)]/90">
              Ce que tu as envoyé, ce qu'on t'a envoyé — tout se suit ici.
            </p>
          </div>
        </div>
      </header>

      {/* Onglets — Reçues masqué si candidature fermée (RG8) */}
      <div role="tablist" aria-label="Sens des demandes" className="flex items-center gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={onglet === "envoyees"}
          onClick={() => setOnglet("envoyees")}
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold transition-shadow duration-200",
            onglet === "envoyees"
              ? "bg-[var(--accent-green)] text-[var(--emsp-cream)] shadow-[var(--shadow-card)]"
              : "bg-[var(--bg-panel-alt)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
          ].join(" ")}
        >
          Envoyées
        </button>
        {recuesActivees && (
          <button
            type="button"
            role="tab"
            aria-selected={onglet === "recues"}
            onClick={() => setOnglet("recues")}
            className={[
              "relative rounded-full px-4 py-2 text-sm font-semibold transition-shadow duration-200",
              onglet === "recues"
                ? "bg-[var(--accent-green)] text-[var(--emsp-cream)] shadow-[var(--shadow-card)]"
                : "bg-[var(--bg-panel-alt)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            ].join(" ")}
          >
            Reçues
            {nbRecues > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--emsp-gold)] px-1 text-xs font-bold text-[#16281c] tabular-nums">
                {nbRecues}
              </span>
            )}
          </button>
        )}
        {recuesActivees && (
          <span className="ml-auto text-xs font-medium text-[var(--emsp-cream)]/90">
            Capacité : {nbCadets}/{PLACES_MAX} cadets
          </span>
        )}
      </div>

      {/* Contenu des onglets */}
      <AnimatePresence mode="wait">
        {onglet === "envoyees" ? (
          <motion.div
            key="envoyees"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {chargeEnvoyees ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (envoyees?.results?.length ?? 0) === 0 ? (
              <Card className="p-6">
                <EmptyState
                  title="Aucune demande envoyée"
                  description="Parcours l'annuaire et choisis un Aîné — ta demande apparaîtra ici avec son suivi."
                />
              </Card>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid gap-4 lg:grid-cols-2"
              >
                {envoyees.results.map((d) => (
                  <CarteDemandeEnvoyee
                    key={d.id}
                    demande={d}
                    onAnnuler={d.statut === "en_attente" ? () => setAnnulation(d) : undefined}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="recues"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {chargeRecues ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (recues?.results?.length ?? 0) === 0 ? (
              <Card className="p-6">
                <EmptyState
                  title="Aucune demande reçue"
                  description="Les cadets qui sollicitent ton accompagnement arriveront ici."
                />
              </Card>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid gap-4 lg:grid-cols-2"
              >
                {recues.results.map((d) => (
                  <CarteDemandeRecue
                    key={d.id}
                    demande={d}
                    peutAccepter={peutAccepter(user, nbCadets)}
                    onAccepter={() => accepter(d)}
                    onRefuser={() => setRefus(d)}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {user?.niveauEtude === "L1" && (
        <p className="text-sm text-[var(--text-muted)]">
          La facette Aîné s'ouvre à partir du L2 (RG7) — en attendant, profite de l'annuaire pour trouver la tienne.
        </p>
      )}

      <ConfirmDialog
        open={Boolean(annulation)}
        onClose={() => setAnnulation(null)}
        title="Annuler cette demande ?"
        message={`Ta demande à ${annulation?.aine?.prenom ?? "cet Aîné"} sera retirée. Tant qu'elle attend, tu ne peux pas en envoyer d'autre (RG1).`}
        confirmLabel="Annuler la demande"
        tone="danger"
        onConfirm={confirmerAnnulation}
        loading={annuler.isPending}
      />

      <ModaleReponse demande={refus} onClose={() => setRefus(null)} />
    </div>
  );
}
