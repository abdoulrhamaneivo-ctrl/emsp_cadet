import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { SkeletonCard } from "@shared/components/Skeleton";
import { apiClient } from "@shared/api/client";
import { useAuth } from "@app/providers/Auth";
import ModaleTransition from "../components/ModaleTransition";

/** GET /api/admin/stats/ — KPI (doc 12 §2, sous-ensemble V1). */
function useStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiClient.get("/api/admin/stats/").then((r) => r.data),
  });
}

/** Garde admin — redirige vers /accueil si pas isAdmin (doc 12 CA n°1). */
function GardeAdmin() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user?.isAdmin) {
    return <Navigate to="/accueil" replace state={{ from: location.pathname }} />;
  }
  return null;
}

function KPI({ valeur, libelle, accent = false }) {
  return (
    <Card className="flex min-w-0 flex-col gap-1 p-4">
      <p
        className={
          accent
            ? "font-display text-2xl font-bold text-[#b42318]"
            : "font-display text-2xl font-bold text-[var(--text-primary)]"
        }
      >
        {valeur}
      </p>
      <p className="text-xs text-[var(--text-muted)]">{libelle}</p>
    </Card>
  );
}

/**
 * /administration (doc 12 §4, tranche t5b) — dashboard stats + lancement de
 * la transition annuelle. Les autres blocs (signalements, comptes) suivront
 * en t5c — la route est déjà gardée admin.
 */
export default function AdminDashboardPage() {
  const { data: stats, isLoading, refetch, isFetching } = useStats();
  const [transition, setTransition] = useState(false);

  return (
    <>
      <GardeAdmin />
      <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--emsp-gold)]">Pilotage</p>
          <h1 className="font-display text-2xl font-bold text-[var(--emsp-cream)]">
            Administration
          </h1>
          <p className="mt-0.5 text-sm text-[var(--emsp-cream)]/90">
            Santé du dispositif de parrainage, en un coup d'œil.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => refetch()} loading={isFetching}>
            Actualiser
          </Button>
          <Button size="sm" onClick={() => setTransition(true)}>
            Clôturer l'année
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KPI valeur={stats?.parrainagesActifs ?? 0} libelle="Parrainages actifs" />
          <KPI valeur={stats?.demandesEnAttente ?? 0} libelle="Demandes en attente" accent={(stats?.demandesEnAttente ?? 0) > 0} />
          <KPI valeur={stats?.etudiants ?? 0} libelle="Étudiants (L1→M2)" />
          <KPI valeur={stats?.alumni ?? 0} libelle="Alumni" />
        </div>
      )}

      <Card className="p-5">
        <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
          Transition annuelle
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Chaque fin d'année : les niveaux montent (L1→L2…), les fins de cycle L3/M2
          basculent selon l'intention déclarée. Les parrainages en cours sont
          toujours conservés — personne ne perd son Aîné ni ses filleuls.
        </p>
        <Button className="mt-3" onClick={() => setTransition(true)}>
          Ouvrir le récapitulatif de transition
        </Button>
      </Card>

      <ModaleTransition open={transition} onClose={() => setTransition(false)} />
    </div>
    </>
  );
}
