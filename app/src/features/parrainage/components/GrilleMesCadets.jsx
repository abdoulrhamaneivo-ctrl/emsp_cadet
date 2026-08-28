import { motion } from "framer-motion";
import { UserRoundCheck } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import Avatar from "@shared/components/Avatar";
import JaugeCapacite from "@shared/components/JaugeCapacite";
import EmptyState from "@shared/components/EmptyState";
import { staggerContainer, staggerItem } from "@shared/motion/variants";
import { formatteurMoisAnnee } from "../utils/dates";
import { PLACES_MAX } from "../rules";

/**
 * MES CADETS — facette aînée (doc 05 §5) : binômes actifs + capacité RG2.
 * Clôturer = RG6 (ouvre la revue/avis) — ConfirmDialog côté page.
 */
export default function GrilleMesCadets({ cadetsActifs, onCloturer }) {
  return (
    <section aria-labelledby="titre-mes-cadets" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="titre-mes-cadets"
            className="font-display text-lg font-bold text-[var(--emsp-cream)]/90"
          >
            Mes cadets
          </h2>
          <p className="mt-0.5 text-sm text-[var(--emsp-cream)]/90">
            Les cadets que tu accompagnes cette année.
          </p>
        </div>
        <JaugeCapacite actifs={cadetsActifs.length} total={PLACES_MAX} surFonce />
      </div>

      {cadetsActifs.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={UserRoundCheck}
            title="Aucun cadet pour l'instant"
            description="Les demandes reçues arrivent ici — accepte-en une pour ouvrir ton premier binôme."
          />
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 sm:grid-cols-2"
        >
          {cadetsActifs.map((binome) => (
            <motion.div key={binome.id} variants={staggerItem}>
              <Card className="flex h-full flex-col gap-3.5 p-5">
                <div className="flex items-center gap-3">
                  <Avatar prenom={binome.autre.prenom} nom={binome.autre.nom} id={binome.autre.id} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--text-primary)]">
                      {binome.autre.prenom} {binome.autre.nom}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {binome.autre.classe} · {binome.autre.filiere}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Accompagné depuis {formatteurMoisAnnee(binome.dateDebut)}
                </p>
                <div className="mt-auto flex justify-end border-t border-[var(--border-soft)] pt-3.5">
                  <Button variant="outline" size="sm" onClick={() => onCloturer(binome)}>
                    Clôturer l'accompagnement
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
