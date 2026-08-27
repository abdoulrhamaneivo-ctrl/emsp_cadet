import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import CarteAine from "./CarteAine";
import { staggerContainer, staggerItem } from "@shared/motion/variants";

/**
 * Bandeau suggestions automatiques (doc 04 §4) — éditorial, posé sur le fond
 * vert : textes crème (contraste), en-tête de section (icône or + titre),
 * grille, légende. raisonIA affichée si présente (IA-2), sans préfixe
 * « Généré par IA ». N'apparaît que si cadet libre ET ≥ 1 suggestion.
 */
export default function BandeauSuggestions({ suggestions = [] }) {
  if (!suggestions.length) return null;

  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      aria-label="Suggestions personnalisées"
    >
      {/* En-tête éditorial : le trait structure, la boîte serait redondante */}
      <div className="flex items-end justify-between gap-3 border-b border-white/15 pb-3">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-[var(--emsp-cream)]">
          <Sparkles size={16} aria-hidden="true" className="text-[var(--emsp-gold)]" />
          Suggestions pour toi
        </h2>
        <p className="text-xs text-[var(--emsp-cream)]/80">
          même filière · intérêts proches
        </p>
      </div>

      {/* Grille pleine largeur — suggestions plafonnées à 3 (doc 04), chaque
          colonne remplie : aucun vide à droite, aucun débordement possible */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((s) => (
          <motion.div
            key={s.id}
            variants={staggerItem}
            className="flex min-w-0 flex-col"
          >
            {/* Wrapper flex-1 : la carte remplit l'espace restant SANS pousser
                le chip hors de la cellule (sinon chevauchement avec la légende) */}
            <div className="min-h-0 flex-1">
              <CarteAine aine={s} enVedette raison={s.raisonIA} />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-xs text-[var(--emsp-cream)]/65">
        Basé sur ta filière et tes attentes — mise en avant automatique.
      </p>
    </motion.section>
  );
}
