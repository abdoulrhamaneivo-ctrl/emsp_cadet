import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Inbox } from "lucide-react";
import Card from "@shared/components/Card";
import EmptyState from "@shared/components/EmptyState";
import { SkeletonCard } from "@shared/components/Skeleton";
import { usePublications, useQuestionsRestantes } from "../hooks/usePublications";
import ComposeurPublication from "../components/ComposeurPublication";
import CartePublication from "../components/CartePublication";
import FiltresType from "../components/FiltresType";
import { useAuth } from "@app/providers/Auth";

/**
 * /fil (doc 09 §4) — mur d'annonces + commentaires communautaires. Espace
 * COLLECTIF d'échange (décision produit août 2026) : pleine largeur, feed
 * dense, filtre par type sync URL ?type=.
 */
export default function FilPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const filtre = params.get("type") ?? "tous";
  const publications = usePublications({ type: filtre === "tous" ? undefined : filtre });
  const questions = useQuestionsRestantes();

  // Filtre hors enum (URL modifiée à la main) → on retombe sur « tous ».
  useEffect(() => {
    if (params.get("type") && params.get("type") !== filtre) setParams({});
  }, [params, filtre, setParams]);

  const pages = publications.data?.pages ?? [];
  const liste = pages.flatMap((p) => p.results);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--emsp-gold)]">
            L'espace collectif des étudiants
          </p>
          <h1 className="font-display text-2xl font-bold text-[var(--emsp-cream)]">
            Fil d'actualité
          </h1>
          <p className="mt-0.5 text-sm text-[var(--emsp-cream)]/90">
            Annonces, questions et succès de la communauté EMSP — publie en quelques secondes.
          </p>
        </div>
        <FiltresType
          valeur={filtre}
          onChange={(valeur) =>
            setParams(valeur === "tous" ? {} : { type: valeur }, { replace: true })
          }
        />
      </header>

      <ComposeurPublication user={user} questionsRestantes={questions.data?.restantes ?? 1} />

      {publications.isLoading ? (
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : liste.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={Inbox}
            title="Le fil est calme…"
            description="Sois le premier à poster une annonce, une question ou un succès de binôme."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {liste.map((publication, index) => (
            <CartePublication
              key={publication.id}
              publication={publication}
              monId={user?.id}
              suiAdmin={user?.isAdmin ?? false}
              index={index}
            />
          ))}
          {publications.hasNextPage && (
            <button
              type="button"
              onClick={() => publications.fetchNextPage()}
              disabled={publications.isFetchingNextPage}
              className="mx-auto rounded-full border border-[var(--border-soft)] bg-[var(--bg-panel)] px-4 py-1.5 text-xs font-medium text-[var(--text-muted)] shadow-[var(--shadow-card)] hover:bg-[var(--hover-bg)]"
            >
              {publications.isFetchingNextPage
                ? "Chargement…"
                : "Charger plus de publications"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
