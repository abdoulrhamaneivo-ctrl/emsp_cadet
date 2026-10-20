import { useState } from "react";
import { CalendarOff, Plus } from "lucide-react";
import Card from "@shared/components/Card";
import EmptyState from "@shared/components/EmptyState";
import Button from "@shared/components/Button";
import { SkeletonCard } from "@shared/components/Skeleton";
import { useEvenements } from "../hooks/useEvenements";
import { estAine } from "../rules";
import CarteEvenement from "../components/CarteEvenement";
import ModaleCreationEvenement from "../components/ModaleCreationEvenement";
import { useAuth } from "@app/providers/Auth";

const ONGLETS = [
  { valeur: "a_venir", libelle: "À venir" },
  { valeur: "passes", libelle: "Passés" },
];

/** /evenements (doc 10 §4) — grille de cartes + création aîné/admin. */
export default function EvenementsPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState("a_venir");
  const [creation, setCreation] = useState(false);
  const { data, isLoading } = useEvenements(scope);
  const evenements = data?.results ?? [];
  const peutCreer = estAine(user);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--accent-green)]">
            La communauté se retrouve
          </p>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Événements
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            Ateliers, sorties et révisions ouverts à plusieurs cadets — inscris-toi en un clic.
          </p>
        </div>
        {peutCreer && (
          <Button size="sm" icon={Plus} onClick={() => setCreation(true)}>
            Créer
          </Button>
        )}
      </header>

      <div
        role="radiogroup"
        aria-label="Filtrer les événements"
        className="flex w-fit gap-1 rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-1 shadow-[var(--shadow-card)]"
      >
        {ONGLETS.map((onglet) => (
          <button
            key={onglet.valeur}
            type="button"
            role="radio"
            aria-checked={scope === onglet.valeur}
            onClick={() => setScope(onglet.valeur)}
            className={
              scope === onglet.valeur
                ? "rounded-[calc(var(--radius-input)-4px)] bg-[var(--emsp-green-deep)] px-3 py-1.5 text-xs font-semibold text-[var(--emsp-cream)]"
                : "rounded-[calc(var(--radius-input)-4px)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--hover-bg)]"
            }
          >
            {onglet.libelle}
            {onglet.valeur === "a_venir" && evenements.length > 0 && ` (${evenements.length})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : evenements.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={CalendarOff}
            title="Aucun événement programmé"
            description={
              scope === "a_venir"
                ? "Les Aînés en publient bientôt — reviens regarder, ou propose l'idée à ton Aîné."
                : "Les événements passés apparaîtront ici."
            }
          />
        </Card>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evenements.map((evenement) => (
            <CarteEvenement key={evenement.id} evenement={evenement} />
          ))}
        </div>
      )}

      {peutCreer && (
        <ModaleCreationEvenement open={creation} onClose={() => setCreation(false)} />
      )}
    </div>
  );
}
