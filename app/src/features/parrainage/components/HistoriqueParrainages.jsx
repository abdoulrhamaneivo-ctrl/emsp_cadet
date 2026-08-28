import { motion } from "framer-motion";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import Avatar from "@shared/components/Avatar";
import Button from "@shared/components/Button";
import { staggerContainer, staggerItem } from "@shared/motion/variants";
import { formatteurDate } from "../utils/dates";

/**
 * HISTORIQUE DES PARRAINAGES (doc 05 §5) — binômes clos.
 * RG6 : toute entrée sans avis affiche le CTA « Donner mon avis ».
 */
export default function HistoriqueParrainages({ entrees, onDonnerAvis }) {
  if (entrees.length === 0) {
    return (
      <Card className="p-5">
        <p className="text-sm text-[var(--text-muted)]">
          Les accompagnements terminés s'afficheront ici — avec la revue à donner pour chacun.
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-3"
    >
      {entrees.map((entree) => {
        const autre = entree.cadet ?? entree.aine ?? {};
        const avisManquant = entree.avisDonne === false;
        return (
          <motion.div key={entree.id} variants={staggerItem}>
            <Card className="flex flex-wrap items-center gap-4 p-4">
              <Avatar prenom={autre.prenom ?? "?"} nom={autre.nom ?? ""} id={autre.id} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--text-primary)]">
                  {autre.prenom} {autre.nom}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  Du {formatteurDate(entree.dateDemande)} au {formatteurDate(entree.dateReponse)}
                </p>
              </div>
              {avisManquant ? (
                <div className="flex items-center gap-3">
                  <Chip tone="gold">Avis à donner</Chip>
                  <Button variant="primary" size="sm" onClick={() => onDonnerAvis(entree)}>
                    Donner mon avis
                  </Button>
                </div>
              ) : (
                <Chip tone="neutral">Revue donnée</Chip>
              )}
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
