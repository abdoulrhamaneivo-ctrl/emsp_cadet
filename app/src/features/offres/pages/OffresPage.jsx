import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, Calendar, Filter, Heart, MapPin, Search, Settings, Sparkles, Users } from "lucide-react";
import { useAuth } from "@app/providers/Auth";
import { cx } from "@shared/utils/cx";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import EmptyState from "@shared/components/EmptyState";
import { offresApi } from "../api";

const TYPES_OFFRES = [
  { valeur: "stage", libelle: "Stage", icone: Briefcase, couleur: "bg-[var(--offer-stage-bg)] text-[var(--offer-stage-text)]" },
  { valeur: "alternance", libelle: "Alternance", icone: Users, couleur: "bg-[var(--offer-alternance-bg)] text-[var(--offer-alternance-text)]" },
  { valeur: "cdi", libelle: "CDI", icone: Briefcase, couleur: "bg-[var(--offer-cdi-bg)] text-[var(--offer-cdi-text)]" },
  { valeur: "cdd", libelle: "CDD", icone: Calendar, couleur: "bg-[var(--offer-cdd-bg)] text-[var(--offer-cdd-text)]" },
  { valeur: "freelance", libelle: "Freelance", icone: Settings, couleur: "bg-[var(--offer-freelance-bg)] text-[var(--offer-freelance-text)]" },
  { valeur: "benevolat", libelle: "Bénévolat", icone: Heart, couleur: "bg-[var(--offer-benevolat-bg)] text-[var(--offer-benevolat-text)]" },
];
const OFFRES_VIDES = [];

function dateLisible(valeur) {
  if (!valeur) return "Date à convenir";
  const date = new Date(valeur);
  return Number.isNaN(date.getTime())
    ? "Date à convenir"
    : date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function OffresPage() {
  const { user } = useAuth();
  const [filtres, setFiltres] = useState({ recherche: "", type: "", localisation: "", telework: "" });
  const [tri, setTri] = useState("date");
  const [voirFiltres, setVoirFiltres] = useState(false);
  const peutPublier = user?.niveauEtude === "alumni" || user?.isAdmin;
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["offres"],
    queryFn: () => offresApi.lister(),
  });

  const offres = Array.isArray(data?.results) ? data.results : OFFRES_VIDES;
  const offresFiltrees = useMemo(() => {
    const recherche = filtres.recherche.trim().toLocaleLowerCase("fr");
    const localisation = filtres.localisation.trim().toLocaleLowerCase("fr");
    const resultats = offres.filter((offre) => {
      const correspondRecherche = !recherche || [offre.titre, offre.entreprise, offre.localisation]
        .some((champ) => (champ || "").toLocaleLowerCase("fr").includes(recherche));
      const correspondType = !filtres.type || offre.typeContrat === filtres.type;
      const correspondLieu = !localisation || (offre.localisation || "").toLocaleLowerCase("fr").includes(localisation);
      const teletravail = (offre.telework || "").toLocaleLowerCase("fr");
      const possibleTeletravail = /remote|hybride|télétravail/.test(teletravail);
      const correspondTeletravail = !filtres.telework || (filtres.telework === "oui" ? possibleTeletravail : !possibleTeletravail);
      return correspondRecherche && correspondType && correspondLieu && correspondTeletravail;
    });
    return resultats.sort((a, b) => tri === "titre"
      ? a.titre.localeCompare(b.titre, "fr")
      : new Date(b.datePublication) - new Date(a.datePublication));
  }, [offres, filtres, tri]);

  const aFiltresActifs = Object.values(filtres).some(Boolean);
  const resetFiltres = () => setFiltres({ recherche: "", type: "", localisation: "", telework: "" });

  return (
    <div className="flex min-h-full flex-col">
      <header className="relative z-10 border-b border-[var(--border-soft)] bg-[var(--bg-page)]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--bg-panel-alt)] px-3 py-1">
                <Sparkles size={14} aria-hidden="true" className="text-[var(--accent-green)]" />
                <span className="text-xs font-semibold text-[var(--accent-green)]">EMSP Connect — Alumni</span>
              </div>
              <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">Offres d'emploi &amp; stages</h1>
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] lg:w-auto">
              <div className="relative min-w-0 sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Poste, entreprise, lieu…"
                  aria-label="Rechercher une offre"
                  value={filtres.recherche}
                  onChange={(e) => setFiltres((actuels) => ({ ...actuels, recherche: e.target.value }))}
                  className="w-full pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoirFiltres((ouvert) => !ouvert)}
                aria-expanded={voirFiltres}
                className={cx("flex items-center gap-2", aFiltresActifs && "border-[var(--accent-green)] text-[var(--accent-green)]")}
              >
                <Filter size={16} aria-hidden="true" />
                <span>Filtres</span>
              </Button>
              {peutPublier && (
                <Button size="sm" to="/offres/creer" icon={Sparkles}>
                  Créer une offre
                </Button>
              )}
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: voirFiltres ? "auto" : 0, opacity: voirFiltres ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            aria-hidden={!voirFiltres}
            inert={!voirFiltres}
          >
            <div className="mt-4 grid gap-3 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Type d'offre</span>
                <select value={filtres.type} onChange={(e) => setFiltres((f) => ({ ...f, type: e.target.value }))} className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)]">
                  <option value="">Tous les types</option>
                  {TYPES_OFFRES.map((type) => <option key={type.valeur} value={type.valeur}>{type.libelle}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Localisation</span>
                <Input value={filtres.localisation} onChange={(e) => setFiltres((f) => ({ ...f, localisation: e.target.value }))} placeholder="Ville, quartier…" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Télétravail</span>
                <select value={filtres.telework} onChange={(e) => setFiltres((f) => ({ ...f, telework: e.target.value }))} className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)]">
                  <option value="">Tous</option>
                  <option value="oui">Télétravail ou hybride</option>
                  <option value="non">Sur site</option>
                </select>
              </label>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={resetFiltres} className="w-full">Réinitialiser</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
          {isPending ? "Chargement des offres…" : `${offresFiltrees.length} offre${offresFiltrees.length > 1 ? "s" : ""} trouvée${offresFiltrees.length > 1 ? "s" : ""}`}
        </p>
        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span>Trier :</span>
          <select value={tri} onChange={(e) => setTri(e.target.value)} className="max-w-[13rem] rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-2.5 py-1.5 text-sm text-[var(--text-primary)]">
            <option value="date">Plus récentes</option>
            <option value="titre">Titre (A–Z)</option>
          </select>
        </label>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8">
        {isError ? (
          <Card className="p-6 text-center" role="alert">
            <p className="font-semibold text-[var(--text-primary)]">Les offres ne sont pas disponibles pour le moment.</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Vérifie ta connexion et réessaie.</p>
            <Button className="mt-4" variant="outline" onClick={() => refetch()} loading={isFetching}>Réessayer</Button>
          </Card>
        ) : isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Chargement des offres">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)]" />)}
          </div>
        ) : offresFiltrees.length === 0 ? (
          <Card>
            <EmptyState
              icon={Briefcase}
              title={offres.length === 0 ? "Aucune offre publiée pour le moment" : "Aucune offre ne correspond"}
              description={offres.length === 0
                ? "Les offres publiées par les alumni apparaîtront ici. Tu peux revenir consulter cette page plus tard."
                : "Essaie d'élargir ta recherche ou de réinitialiser les filtres."}
              actionLabel={aFiltresActifs ? "Réinitialiser les filtres" : undefined}
              onAction={aFiltresActifs ? resetFiltres : undefined}
            >
              {offres.length === 0 && peutPublier && <Button to="/offres/creer" icon={Sparkles}>Publier la première offre</Button>}
            </EmptyState>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offresFiltrees.map((offre) => {
              const typeInfo = TYPES_OFFRES.find((type) => type.valeur === offre.typeContrat);
              const IconeType = typeInfo?.icone ?? Briefcase;
              return (
                <motion.article key={offre.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="h-full">
                  <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className={cx("rounded-full p-2", typeInfo?.couleur ?? "bg-[var(--bg-panel-alt)] text-[var(--accent-green)]")}>
                          <IconeType size={17} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-green)]">{typeInfo?.libelle ?? offre.typeContrat}</p>
                          <p className="truncate text-xs text-[var(--text-muted)]">{offre.entreprise}</p>
                        </div>
                      </div>
                      <time className="shrink-0 text-xs text-[var(--text-muted)]" dateTime={offre.datePublication}>{dateLisible(offre.datePublication)}</time>
                    </div>
                    <h2 className="mb-2 line-clamp-2 font-semibold text-[var(--text-primary)]">{offre.titre}</h2>
                    <div className="mb-4 flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                      <p className="flex items-center gap-1.5"><MapPin size={14} aria-hidden="true" /><span>{offre.localisation}</span></p>
                      {offre.salaire && <p>{offre.salaire}</p>}
                      {offre.telework && <p>{offre.telework}</p>}
                      <p className="flex items-center gap-1.5"><Calendar size={14} aria-hidden="true" /><span>Fin des candidatures : {dateLisible(offre.dateLimite)}</span></p>
                    </div>
                    <div className="mt-auto flex gap-2 border-t border-[var(--border-soft)] pt-3">
                      <Button variant="outline" size="sm" to={`/offres/${offre.id}`} className="flex-1">Voir l'offre</Button>
                      <Button size="sm" to={`/offres/${offre.id}`} className="flex-1">Postuler</Button>
                    </div>
                  </Card>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
