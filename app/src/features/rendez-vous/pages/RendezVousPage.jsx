import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@shared/components/Button";
import Card from "@shared/components/Card";
import EmptyState from "@shared/components/EmptyState";
import CarteRDV from "../components/CarteRDV";
import FormulaireProposition from "../components/FormulaireProposition";
import { useMonParrainage } from "@features/annuaire/hooks/useParrains";
import { useRendezVous } from "../hooks/useRendezVous";
import { staggerContainer, pageTransition } from "@shared/motion/variants";
import { cx } from "@shared/utils/cx";

/** /rendez-vous (doc 06 §4) — onglets À venir / Passés + CTA proposition. */
export default function RendezVousPage() {
  const [scope, setScope] = useState("a_venir");
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const { data, isPending } = useRendezVous(scope);
  const { data: monParrainage } = useMonParrainage();
  const rdvs = data?.results ?? [];

  // Invités proposables = mon Aîné + mes cadets actifs (double casquette T2)
  const invites = [
    ...(monParrainage?.monAine?.autre ? [monParrainage.monAine.autre] : []),
    ...(monParrainage?.cadetsActifs ?? []).map((b) => b.autre),
  ];

  return (
    <motion.section {...pageTransition} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--emsp-gold)]">Coordination binôme</p>
          <h1 className="font-display text-2xl font-bold text-[var(--emsp-cream)]">Rendez-vous</h1>
          <p className="mt-0.5 text-sm text-[var(--emsp-cream)]/90">
            Planifie et suis tes séances avec ton binôme — présentiel ou visio.
          </p>
        </div>
        <Button onClick={() => setFormulaireOuvert(true)} disabled={invites.length === 0}>
          Proposer un rendez-vous
        </Button>
      </div>

      {/* Onglets À venir / Passés — segment actif or, texte /90 sur panneau foncé */}
      <div
        className="grid grid-cols-2 gap-1 rounded-[var(--radius-card)] border border-white/15 bg-[#143524] p-1"
        role="tablist"
      >
        {[
          { valeur: "a_venir", libelle: "À venir" },
          { valeur: "passes", libelle: "Passés" },
        ].map((onglet) => (
          <button
            key={onglet.valeur}
            type="button"
            role="tab"
            aria-selected={scope === onglet.valeur}
            onClick={() => setScope(onglet.valeur)}
            className={cx(
              "rounded-[calc(var(--radius-card)-4px)] px-3 py-1.5 text-sm font-medium transition-colors",
              scope === onglet.valeur
                ? "bg-[var(--emsp-gold)] text-[#16281c]"
                : "text-[var(--emsp-cream)]/90 hover:bg-white/10",
            )}
          >
            {onglet.libelle}
          </button>
        ))}
      </div>

      {isPending ? (
        <Card className="p-6 text-center text-sm text-[var(--text-muted)]">Chargement…</Card>
      ) : rdvs.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title={scope === "a_venir" ? "Aucun rendez-vous à venir" : "Aucun rendez-vous passé"}
            description="Propose un créneau à ton binôme pour lancer la coordination."
          >
            <Button variant="primary" onClick={() => setFormulaireOuvert(true)}>
              Proposer un rendez-vous
            </Button>
          </EmptyState>
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 lg:grid-cols-2"
        >
          {rdvs.map((rdv) => (
            <CarteRDV key={rdv.id} rdv={rdv} />
          ))}
        </motion.div>
      )}

      <FormulaireProposition
        open={formulaireOuvert}
        onClose={() => setFormulaireOuvert(false)}
        invites={invites}
      />
    </motion.section>
  );
}
