import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Video } from "lucide-react";
import Card from "@shared/components/Card";
import JaugeCapacite from "@shared/components/JaugeCapacite";
import { staggerItem } from "@shared/motion/variants";

/** Bloc date vert profond (doc 10 §4) — jour + mois + heure, signature carte. */
export function BlocDate({ dateHeure }) {
  const date = new Date(dateHeure);
  return (
    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[var(--radius-card)] bg-[var(--emsp-green-deep)] text-[var(--emsp-cream)]">
      <span className="text-[10px] font-semibold">
        {date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
      </span>
      <span className="font-display text-xl font-bold leading-none">{date.getDate()}</span>
      <span className="mt-0.5 text-[10px] tabular-nums opacity-90">
        {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}

/**
 * Carte de la liste (doc 10 §4) : bloc date + titre + organisateur + lieu +
 * jauge places. Complète → chip danger « Complet » (même logique que RG2).
 * Chaîne min-w-0 COMPLÈTE (leçon T1) : motion.div > Link > Card > colonne —
 * sans elle, la jauge 12 segments élargit la carte en mobile (testé vision).
 */
export default function CarteEvenement({ evenement }) {
  const complet = evenement.nbInscrits >= evenement.capaciteMax;
  return (
    <motion.div variants={staggerItem} className="min-w-0">
      <Link to={`/evenements/${evenement.id}`} className="block min-w-0">
        <Card interactive className="flex min-w-0 items-start gap-4 p-4">
          <BlocDate dateHeure={evenement.dateHeure} />
          <div className="min-w-0 flex-1">
            {evenement.type && (
              <p className="text-[11px] font-semibold text-[var(--accent-gold)]">
                {evenement.type}
              </p>
            )}
            <p className="truncate font-bold text-[var(--text-primary)]">{evenement.titre}</p>
            <p className="truncate text-sm text-[var(--text-muted)]">
              Par {evenement.organisateur?.prenom} {evenement.organisateur?.nom}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              {evenement.enLigne ? (
                <>
                  <Video size={13} aria-hidden="true" className="shrink-0" />
                  <span className="truncate">En ligne</span>
                </>
              ) : (
                <>
                  <MapPin size={13} aria-hidden="true" className="shrink-0" />
                  <span className="truncate">{evenement.lieu}</span>
                </>
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <JaugeCapacite
                actifs={evenement.nbInscrits}
                total={evenement.capaciteMax}
                className="max-w-full"
              />
              {complet && (
                <span className="shrink-0 rounded-full border border-[#b42318]/40 bg-[#b42318]/10 px-2 py-0.5 text-[10px] font-bold text-[#b42318]">
                  COMPLET
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
