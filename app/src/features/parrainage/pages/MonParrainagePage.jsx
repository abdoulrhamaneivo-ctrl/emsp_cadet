import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Card from "@shared/components/Card";
import ConfirmDialog from "@shared/components/ConfirmDialog";
import { SkeletonCard } from "@shared/components/Skeleton";
import { staggerContainer, staggerItem } from "@shared/motion/variants";
import { useAuth } from "@app/providers/Auth";
import PanneauMonAine from "../components/PanneauMonAine";
import GrilleMesCadets from "../components/GrilleMesCadets";
import BlocFamilleCercles from "../components/BlocFamilleCercles";
import HistoriqueParrainages from "../components/HistoriqueParrainages";
import ModaleDonnerAvis from "../components/ModaleDonnerAvis";
import { useMonParrainage } from "@features/annuaire/hooks/useParrains";
import { useCloturerParrainage } from "../hooks/useDemandes";
import { statutFacetteAinee } from "../rules";

/**
 * /mon-parrainage (doc 05 §5) — tableau de bord à double facette.
 * Facette cadette : PanneauMonAine. Facette aînée : GrilleMesCadets +
 * BlocFamilleCercles + historique clos avec avis RG6.
 */
export default function MonParrainagePage() {
  const { user } = useAuth();
  const [aCloturer, setACloturer] = useState(null);
  const [avisOuvert, setAvisOuvert] = useState(null);

  const { data: monParrainage, isPending } = useMonParrainage();
  const cloturer = useCloturerParrainage();

  const monAine = monParrainage?.monAine ?? null;
  const cadetsActifs = monParrainage?.cadetsActifs ?? [];
  const historique = [
    ...(monParrainage?.historiqueEnvoyes ?? []),
    ...(monParrainage?.historiqueRecus ?? []),
  ].sort((a, b) => new Date(b.dateReponse ?? b.dateDemande) - new Date(a.dateReponse ?? a.dateDemande));

  const confirmerCloture = () => {
    cloturer.mutate(
      { parrainageId: aCloturer.id },
      {
        onSuccess: () => {
          toast.success("Accompagnement clôturé — laisse une revue à ton cadet, ça compte pour lui.");
          setACloturer(null);
        },
        onError: () => {
          toast.error("Impossible de clôturer. Réessaie.");
          setACloturer(null);
        },
      },
    );
  };

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <SkeletonCard />
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const facette = statutFacetteAinee(user);
  const deuxFacettes = facette === "ouvert";

  return (
    <div className="flex flex-col gap-6">
      {/* Hero vert profond opaque (gabarit annuaire) */}
      <header className="sticky top-0 z-10 -mx-5 -mt-6 lg:-mx-10 lg:-mt-8">
        <div className="relative overflow-hidden border-b border-white/8 bg-[var(--emsp-green-deep)] px-5 py-7 lg:px-10 lg:py-8">
          <div className="kente-pattern absolute inset-0" aria-hidden="true" />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-sm font-semibold text-[var(--emsp-gold)]">
                Ton parcours d'accompagnement
              </p>
              <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-[var(--emsp-cream)] lg:text-[1.75rem]">
                Mon parrainage
              </h1>
              <p className="mt-1 text-sm text-[var(--emsp-cream)]/90">
                {deuxFacettes
                  ? "Des deux côtés du binôme : ce que tu reçois, ce que tu donnes."
                  : "Où tu en es : ton Aîné, tes demandes, tes rendez-vous."}
              </p>
            </div>
            {deuxFacettes && (
              <span className="inline-flex items-center rounded-[var(--radius-chip)] bg-[var(--emsp-cream)] px-4 py-2 text-sm font-semibold text-[var(--accent-green)]">
                Facette aînée active
              </span>
            )}
            {facette === "l1" && (
              <span className="max-w-xs text-xs text-[var(--emsp-cream)]/90">
                La facette Aîné s'ouvre en L2 — quand tu seras prêt(e) à accompagner à ton tour.
              </span>
            )}
          </div>
        </div>
      </header>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className={deuxFacettes ? "grid min-w-0 gap-6 xl:grid-cols-2" : "flex flex-col gap-6"}
      >
        {/* FACETTE CADETTE */}
        <motion.div variants={staggerItem} className="min-w-0">
          <PanneauMonAine monAine={monAine} />
        </motion.div>

        {/* FACETTE AÎNÉE — jamais pour un L1 (RG7), bloc seulement si candidature fermée */}
        {deuxFacettes && (
          <motion.div variants={staggerItem} className="min-w-0 flex flex-col gap-6">
            <GrilleMesCadets cadetsActifs={cadetsActifs} onCloturer={setACloturer} />
            <BlocFamilleCercles />
          </motion.div>
        )}
      </motion.div>

      {facette === "ferme" && user?.niveauEtude !== "L1" && (
        <Card className="p-5">
          <p className="text-sm text-[var(--text-muted)]">
            Tu n'as pas ouvert ta candidature d'Aîné — active-la depuis ton profil quand tu veux accompagner à ton tour.
          </p>
        </Card>
      )}

      {/* HISTORIQUE + AVIS RG6 */}
      <section aria-labelledby="titre-historique" className="flex flex-col gap-4">
        <div>
          <h2 id="titre-historique" className="font-display text-lg font-bold text-[var(--emsp-cream)]/90">
            Historique des parrainages
          </h2>
          <p className="mt-0.5 text-sm text-[var(--emsp-cream)]/90">
            Chaque binôme clos attend une revue — c'est elle qui fait la réputation des Aînés.
          </p>
        </div>
        <AnimatePresence>
          <HistoriqueParrainages entrees={historique} onDonnerAvis={setAvisOuvert} />
        </AnimatePresence>
      </section>

      <ConfirmDialog
        open={Boolean(aCloturer)}
        onClose={() => setACloturer(null)}
        title="Clôturer cet accompagnement ?"
        message={`${aCloturer?.autre?.prenom ?? "Ton cadet"} ne comptera plus parmi tes cadets actifs. Tu pourras ensuite laisser ton avis — c'est RG6, la revue fait partie de la clôture.`}
        confirmLabel="Clôturer"
        onConfirm={confirmerCloture}
        loading={cloturer.isPending}
      />

      <ModaleDonnerAvis binome={avisOuvert} autre={avisOuvert?.cadet ?? avisOuvert?.aine} onClose={() => setAvisOuvert(null)} />
    </div>
  );
}
