import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX, UserCheck, AlertTriangle, ArrowRight } from "lucide-react";
import Button from "@shared/components/Button";
import Card from "@shared/components/Card";
import EmptyState from "@shared/components/EmptyState";
import Pagination from "@shared/components/Pagination";
import { SkeletonCard } from "@shared/components/Skeleton";
import { staggerContainer, ressortStandard } from "@shared/motion/variants";
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
      {/* Header page — hero vert profond opaque avec kente (doc 04 §4, barre designer) */}
      <header className="sticky top-0 z-10 -mx-5 -mt-6 lg:-mx-10 lg:-mt-8">
        <div className="relative overflow-hidden border-b border-white/8 bg-[var(--emsp-green-deep)] px-5 py-7 lg:px-10 lg:py-8">
          <div className="kente-pattern absolute inset-0" aria-hidden="true" />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-sm font-semibold text-[var(--emsp-gold)]">
                Trouve ton guide
              </p>
              <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-[var(--emsp-cream)] lg:text-[1.75rem]">
                Annuaire des Aînés
              </h1>
              <p className="mt-1 text-sm text-[var(--emsp-cream)]/90">
                Filière, classe, points forts — choisis celui qui te correspond.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {data && (
                <span
                  className="inline-flex items-center rounded-[var(--radius-chip)] bg-[var(--emsp-cream)] py-1.5 pl-3.5 pr-4"
                  title="Aînés avec au moins une place disponible"
                >
                  <span className="text-2xl font-semibold leading-none tabular-nums text-[var(--accent-green)]">
                    {data.count}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mx-2.5 self-stretch w-px bg-[var(--border-soft)]"
                  />
                  <span className="max-w-[7rem] text-[11px] font-medium leading-tight text-[var(--text-muted)]">
                    Aîné{data.count > 1 ? "s" : ""} disponible{data.count > 1 ? "s" : ""}
                  </span>
                </span>
              )}
              <Button variant="ghost-fonce" size="sm" to="/mes-demandes">
                Mes demandes
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* RG1 : cadet déjà engagé → encart calme (identité de contenu, pas d'alerte) */}
      {engageRG1 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ressortStandard}
          className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-card)] sm:p-5"
          aria-label="Parrainage en cours"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--acc-gold-soft)]">
              <UserCheck size={20} aria-hidden="true" className="text-[var(--accent-gold)]" />
            </span>
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
        <section className="flex flex-col items-center rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6 text-center shadow-[var(--shadow-card)]">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#b42318]/10">
            <AlertTriangle size={22} aria-hidden="true" className="text-[#b42318]" />
          </span>
          <p className="font-semibold text-[var(--text-primary)]">Impossible de charger l'annuaire.</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Réessayer
          </Button>
        </section>
      )}

      {isPending && (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isPending && !isError && resultats.length === 0 && (
        <Card accent>
          <EmptyState
            icon={SearchX}
            title="Aucun Aîné ne correspond"
            description="Essaie d'élargir ta recherche : autre filière, autre classe, ou réinitialise les filtres."
            actionLabel="Réinitialiser les filtres"
            onAction={reinitialiser}
          />
        </Card>
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
              className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {resultats.map((aine) => (
                <li key={aine.id} className="flex min-w-0">
                  <CarteAine aine={aine} />
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>

          {/* Pagination — en volume, sans boîte : le geste porte le contenu */}
          <nav className="pt-1">
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
