import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import CarteAine from "./CarteAine";
import { staggerContainer, staggerItem } from "@shared/motion/variants";

/**
 * Bandeau suggestions automatiques (doc 04 §4) — cards horizontales
 * scrollables snap, label or uppercase, raisonIA affichée si présente (IA-2).
 * N'apparaît que si cadet libre ET ≥ 1 suggestion (doc 04 §8 critère 4).
 */
export default function BandeauSuggestions({ suggestions = [] }) {
  if (!suggestions.length) return null;

  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--bg-panel)] shadow-[var(--shadow-panel)]"
      aria-label="Suggestions personnalisées"
    >
      <div className="kente-band" aria-hidden="true" />
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Chip tone="gold">Suggérés pour toi</Chip>
            <span className="text-xs text-[var(--text-muted)]">
              même filière · intérêts proches
            </span>
          </div>
        </div>

        {/* Grille pleine largeur — suggestions plafonnées à 3 (doc 04), chaque
            colonne remplie : aucun vide à droite, aucun débordement possible */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((s) => (
            <motion.div
              key={s.id}
              variants={staggerItem}
              className="flex min-w-0 flex-col"
            >
              {/* Wrapper flex-1 : la carte remplit l'espace restant SANS pousser
                  le chip hors de la cellule (sinon chevauchement avec la légende) */}
              <div className="min-h-0 flex-1">
                <CarteAine aine={s} />
              </div>
              {s.raisonIA && (
                <p className="mt-2 flex items-start gap-1.5 rounded-[var(--radius-chip)] bg-[#175cd3]/10 px-2.5 py-1.5 text-xs text-[#175cd3]">
                  <Sparkles size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span>
                    <span className="font-semibold">Généré par IA · </span>
                    {s.raisonIA}
                  </span>
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Basé sur ta filière et tes attentes — mise en avant automatique.
        </p>
      </div>
    </motion.section>
  );
}
