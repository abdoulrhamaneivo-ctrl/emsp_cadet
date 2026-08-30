import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { RefreshCw, AlertTriangle, Send, X, Loader2, Users } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { SkeletonCard } from "@shared/components/Skeleton";
import { apiClient } from "@shared/api/client";
import { useAuth } from "@app/providers/Auth";
import ModaleTransition from "../components/ModaleTransition";
import ChipIA from "@shared/components/ChipIA";
import Modal from "@shared/components/Modal";
import ConfirmDialog from "@shared/components/ConfirmDialog";

/** GET /api/admin/stats/ — KPI (doc 12 §2, sous-ensemble V1). */
function useStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiClient.get("/api/admin/stats/").then((r) => r.data),
  });
}

/** GET /api/admin/binomes-silencieux/ — liste des binômes à risque (IA-5). */
function useBinomesSilencieux() {
  return useQuery({
    queryKey: ["admin-binomes-silencieux"],
    queryFn: () => apiClient.get("/api/admin/binomes-silencieux/").then((r) => r.data),
  });
}

/** POST /api/admin/binomes-silencieux/ {binomeId} — envoie un nudge. */
function useEnvoyerNudge() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (binomeId) => apiClient.post("/api/admin/binomes-silencieux/", { binomeId }).then((r) => r.data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin-binomes-silencieux"] });
      client.invalidateQueries({ queryKey: ["admin-stats"] });
    },
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
  const { data: silence, isLoading: silenceLoading, refetch: refetchSilence } = useBinomesSilencieux();
  const { mutate: envoyerNudge, isPending: nudgeEnCours } = useEnvoyerNudge();
  const [transition, setTransition] = useState(false);
  const [nudge, setNudge] = useState(null); // {binomeId, raisons}

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
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => { refetch(); refetchSilence(); }} loading={isFetching || silenceLoading}>
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

      {/* IA-5 : Binômes silencieux */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              Binômes silencieux (IA-5)
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Detection metas-only : dernier message Famille {'>'} 21j OU sup ou egal a 3 RDV annules/30j.
              <ChipIA className="ml-2" />
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetchSilence()}
            loading={silenceLoading}
          >
            Actualiser
          </Button>
        </div>

        {silenceLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : silence?.count === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            <Users size={32} className="mx-auto mb-2 text-[var(--text-muted)]/50" aria-hidden="true" />
            <p className="text-sm">Aucun binôme silencieux détecté — tout va bien !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-soft)] text-left text-[var(--text-muted)]">
                  <th className="pb-2 pr-4">Aîné</th>
                  <th className="pb-2 pr-4">Cadet</th>
                  <th className="pb-2 pr-4">Raisons</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {silence?.results?.map((b) => (
                  <tr key={b.binomeId} className="border-b border-[var(--border-soft)]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">
                          {b.aine?.prenom} {b.aine?.nom}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {b.aine?.classe}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">
                          {b.cadet?.prenom} {b.cadet?.nom}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {b.cadet?.classe}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1.5">
                        {b.raisons?.map((r, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--emsp-cream)]/10 px-2 py-0.5 text-xs text-[var(--emsp-gold)]"
                          >
                            <AlertTriangle size={10} aria-hidden="true" />
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Send}
                        onClick={() => setNudge({ binomeId: b.binomeId, raisons: b.raisons })}
                        disabled={nudgeEnCours}
                      >
                        Nudge
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </Card>

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

      {/* Modale confirmation nudge IA-5 */}
      <ConfirmDialog
        open={!!nudge}
        onClose={() => setNudge(null)}
        title="Envoyer un nudge bienveillant ?"
        message={
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-muted)]">
              Un message système sera envoyé dans la conversation Famille aux DEUX membres :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--text-muted)]">
              {nudge?.raisons?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            <p className="text-xs text-[var(--text-muted)]">
              Ton du message : bienveillant, jamais culpabilisant (RG12.5).
            </p>
          </div>
        }
        confirmLabel="Envoyer le nudge"
        onConfirm={() => {
          if (nudge) {
            envoyerNudge(nudge.binomeId);
            setNudge(null);
          }
        }}
        loading={nudgeEnCours}
      />
    </div>
    </>
  );
}
