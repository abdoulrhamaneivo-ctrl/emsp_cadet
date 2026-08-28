import { motion } from "framer-motion";
import { Users, CirclePlus } from "lucide-react";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import { staggerItem } from "@shared/motion/variants";
import { useGroupsResume } from "../hooks/useDemandes";

/**
 * FAMILLES & CERCLES — points d'entrée (doc 05 §5 / doc 13).
 * La famille est créée automatiquement à la première acceptation ;
 * les cercles sont Cercle 1 (T3) — CTA désactivé, jamais de carte vide.
 */
export default function BlocFamilleCercles() {
  const { data } = useGroupsResume();
  const groupes = data?.results ?? [];

  return (
    <section aria-labelledby="titre-famille" className="flex flex-col gap-4">
      <div>
        <h2
          id="titre-famille"
          className="font-display text-lg font-bold text-[var(--emsp-cream)]/90"
        >
          Familles & cercles
        </h2>
        <p className="mt-0.5 text-sm text-[var(--emsp-cream)]/90">
          Chaque binôme rejoint une famille d'accompagnement. Les cercles s'ouvriront avec la messagerie.
        </p>
      </div>

      <Card className="flex flex-col gap-3 p-5">
        {groupes.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            Ta famille s'ouvrira automatiquement dès ton premier binôme.
          </p>
        ) : (
          groupes.map((g) => (
            <motion.a
              key={g.conversationId}
              variants={staggerItem}
              href="/messagerie"
              className="flex items-center justify-between gap-3 rounded-[var(--radius-panel)] bg-[var(--bg-panel-alt)] p-4 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--emsp-green-deep)] text-[var(--emsp-cream)]">
                  <Users size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-[var(--text-primary)]">{g.titre}</span>
                  <span className="block text-xs text-[var(--text-muted)]">
                    {g.nbMembres} membres · ouverte dans la messagerie
                  </span>
                </span>
              </span>
              <Chip tone="goldSoft">Famille</Chip>
            </motion.a>
          ))
        )}

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-3.5">
          <span className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <CirclePlus size={16} aria-hidden="true" />
            Créer un cercle thématique
          </span>
          <Chip tone="neutral">Prochainement — avec la messagerie</Chip>
        </div>
      </Card>
    </section>
  );
}
