import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX, UserCheck, AlertTriangle, ArrowRight } from "lucide-react";
import Chip from "@shared/components/Chip";
import Button from "@shared/components/Button";
import EmptyState from "@shared/components/EmptyState";
import Pagination from "@shared/components/Pagination";
import { SkeletonCard } from "@shared/components/Skeleton";
import { staggerContainer } from "@shared/motion/variants";
import { useDebounce } from "@shared/hooks/useDebounce";
import CarteAine from "../components/CarteAine";
import BandeauSuggestions from "../components/BandeauSuggestions";
import BarreFiltres from "../components/BarreFiltres";
import { useParrains, useSuggestions, useMonParrainage } from "../hooks/useParrains";

/**
 * /annuaire — liste filtrable des Aînés disponibles (doc 04).
 * Filtres synchronisés à l'URL (?q=&filiere=&classe=&page=&inclureComplets=),
 * recherche debounced 400ms, suggestions si cadet libre, RG1/RG3 visibles.
 */
export default function AnnuairePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const filtres = {
    q: searchParams.get("q") || "",
    filiere: searchParams.get("filiere") || "",
    classe: searchParams.get("classe") || "",
    page: Number(searchParams.get("page")) || 1,
    inclureComplets: searchParams.get("inclureComplets") === "true",
  };

  // Recherche debounced 400ms (doc 04 §8 critère 7) : saisie locale → URL
  const [qSaisie, setQSaisie] = useState(filtres.q);
  const qDifferee = useDebounce(qSaisie, 400);

  useEffect(() => {
    const qUrl = searchParams.get("q") || "";
    if (qDifferee !== qUrl) {
      const next = new URLSearchParams(searchParams);
      if (qDifferee) next.set("q", qDifferee);
      else next.delete("q");
      next.delete("page");
      setSearchParams(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDifferee]);

  // Back/forward navigateur : resynchroniser la saisie depuis l'URL
  useEffect(() => {
    const qUrl = searchParams.get("q") || "";
    if (qSaisie === qDifferee && qUrl !== qSaisie) setQSaisie(qUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /** Patch des filtres non-texte : mise à jour immédiate de l'URL + reset page. */
  const changerFiltres = (patch) => {
    const next = new URLSearchParams(searchParams);
    for (const [cle, valeur] of Object.entries(patch)) {
      if (valeur === "" || valeur === false || valeur == null) next.delete(cle);
      else next.set(cle, String(valeur));
    }
    if (!("page" in patch)) next.delete("page");
    setSearchParams(next);
  };

  const reinitialiser = () => {
    setQSaisie("");
    setSearchParams({});
  };

  const { data, isPending, isError, refetch } = useParrains(filtres);
  const { data: monParrainage } = useMonParrainage();
  const cadetLibre = !monParrainage?.binomeActif;
  const { data: suggestionsData } = useSuggestions(cadetLibre);

  const resultats = data?.results ?? [];
  const engageRG1 = monParrainage?.binomeActif === true;

  return (
    <div className="flex flex-col gap-6">
      {/* Header page — panel opaque sticky (doc 04 §4) */}
      <header className="sticky top-0 z-10 -mx-5 -mt-6 border-b border-[var(--border-soft)] bg-[var(--bg-panel)] px-5 py-5 shadow-[var(--shadow-card)] lg:-mx-10 lg:-mt-8 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] lg:text-3xl">
              Annuaire des Aînés
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Trouve l'Aîné qui te correspond — filière, classe, points forts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <Chip tone="success">
                {data.count} Aîné{data.count > 1 ? "s" : ""} disponible{data.count > 1 ? "s" : ""}
              </Chip>
            )}
            <Link
              to="/mes-demandes"
              className="text-sm font-semibold text-[var(--accent-green)] underline-offset-2 hover:underline"
            >
              Mes demandes
            </Link>
          </div>
        </div>
      </header>

      {/* RG1 : cadet déjà engagé → encart vert à la place des suggestions */}
      {engageRG1 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-[var(--emsp-green-bright)]/40 bg-[var(--emsp-green-bright)]/12 p-5"
          aria-label="Parrainage en cours"
        >
          <div className="flex items-center gap-3">
            <UserCheck size={22} aria-hidden="true" className="text-[var(--accent-green)]" />
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Tu es accompagné(e)</p>
              <p className="text-sm text-[var(--text-muted)]">
                Un seul Aîné actif à la fois (RG1) — l'annuaire reste consultable.
              </p>
            </div>
          </div>
          <Button variant="primary" icon={ArrowRight} onClick={() => navigate("/mon-parrainage")}>
            Voir mon parrainage
          </Button>
        </motion.section>
      )}

      {/* Suggestions automatiques (cadet libre, ≥1 résultat — doc 04 §8 crit. 4) */}
      {!engageRG1 && monParrainage !== undefined && (
        <BandeauSuggestions suggestions={suggestionsData?.results ?? []} />
      )}

      {/* Barre filtres */}
      <BarreFiltres filtres={{ ...filtres, q: qSaisie }} onChanger={changerFiltres} onReinitialiser={reinitialiser} />

      {/* États serveur (doc 03 §9) */}
      {isError && (
        <section className="rounded-[var(--radius-panel)] border border-[#b42318]/30 bg-[#b42318]/10 p-6 text-center">
          <AlertTriangle size={24} aria-hidden="true" className="mx-auto mb-2 text-[#b42318]" />
          <p className="font-semibold text-[var(--text-primary)]">Impossible de charger l'annuaire.</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Réessayer
          </Button>
        </section>
      )}

      {isPending && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isPending && !isError && resultats.length === 0 && (
        <section className="rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--bg-panel)] shadow-[var(--shadow-panel)]">
          <EmptyState
            icon={SearchX}
            title="Aucun Aîné ne correspond"
            description="Essaie d'élargir ta recherche : autre filière, autre classe, ou réinitialise les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reinitialiser}
          />
        </section>
      )}

      {/* Grille résultats — stagger au premier rendu ET à chaque page/filtre */}
      {!isPending && !isError && resultats.length > 0 && (
        <>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={`${filtres.page}-${filtres.q}-${filtres.filiere}-${filtres.classe}-${filtres.inclureComplets}`}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {resultats.map((aine) => (
                <li key={aine.id} className="flex min-w-0">
                  <CarteAine aine={aine} />
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>

          <nav className="rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--bg-panel)] px-4 py-4 shadow-[var(--shadow-card)]">
            <Pagination
              page={filtres.page}
              pageCount={data?.totalPages ?? 1}
              totalElements={data?.count ?? null}
              onChange={(p) => changerFiltres({ page: p })}
            />
          </nav>
        </>
      )}
    </div>
  );
}
