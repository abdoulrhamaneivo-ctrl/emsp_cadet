import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Users, Settings, Calendar, Heart, Search, Filter, Sparkles, ChevronDown, MapPin, Euro, Clock } from "lucide-react";
import { cx } from "@shared/utils/cx";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import Chip from "@shared/components/Chip";
import { Link, useNavigate } from "react-router-dom";

/**
 * Page Offres alumni — P22 (doc 14 §6 + IA-6).
 * Liste des offres avec filtres + bouton création (si alumni).
 */
const TYPES_OFFRES = [
  { valeur: "stage", libelle: "Stage", icone: Briefcase, couleur: "bg-blue-500/20 text-blue-400" },
  { valeur: "alternance", libelle: "Alternance", icone: Users, couleur: "bg-purple-500/20 text-purple-400" },
  { valeur: "cdi", libelle: "CDI", icone: Briefcase, couleur: "bg-green-500/20 text-green-400" },
  { valeur: "cdd", libelle: "CDD", icone: Calendar, couleur: "bg-amber-500/20 text-amber-400" },
  { valeur: "freelance", libelle: "Freelance", icone: Settings, couleur: "bg-pink-500/20 text-pink-400" },
  { valeur: "benevolat", libelle: "Bénévolat", icone: Heart, couleur: "bg-red-500/20 text-red-400" },
];

const OFFRES_DEMO = [
  {
    id: 1,
    titre: "Développeur Full Stack Junior — Stage 6 mois",
    type: "stage",
    entreprise: "TechCorp Abidjan",
    localisation: "Abidjan, Cocody",
    typeContrat: "stage",
    datePublication: "2025-01-15",
    dateLimite: "2025-03-15",
    salaire: "800 €/mois",
    telework: "Hybride (2j/sem)",
  },
  {
    id: 2,
    titre: "Data Scientist — Alternance 2 ans",
    type: "alternance",
    entreprise: "DataFlow CI",
    localisation: "Abidjan, Plateau",
    typeContrat: "alternance",
    datePublication: "2025-01-10",
    dateLimite: "2025-02-28",
    salaire: "SMIC % selon âge",
    telework: "1j/sem",
  },
  {
    id: 3,
    titre: "Lead DevOps — CDI",
    type: "cdi",
    entreprise: "CloudScale",
    localisation: "Abidjan, Marcory + Télétravail",
    typeContrat: "cdi",
    datePublication: "2025-01-05",
    dateLimite: "2025-03-01",
    salaire: "55k €/an",
    telework: "100% remote possible",
  },
  {
    id: 4,
    titre: "React Native Developer — CDD 12 mois",
    type: "cdd",
    entreprise: "MobileFirst",
    localisation: "Yamoussoukro",
    typeContrat: "cdd",
    datePublication: "2025-01-12",
    dateLimite: "2025-02-15",
    salaire: "45k €/an",
    telework: "Non",
  },
  {
    id: 5,
    titre: "Consultant Cybersécurité — Freelance 3 mois",
    type: "freelance",
    entreprise: "SecureNet",
    localisation: "Abidjan + Remote",
    typeContrat: "freelance",
    datePublication: "2025-01-08",
    dateLimite: "2025-02-20",
    salaire: "500 €/jour",
    telework: "100% remote",
  },
  {
    id: 6,
    titre: "Coordinateur Bénévole — Éducation",
    type: "benevolat",
    entreprise: "ONG EducaCI",
    localisation: "Abidjan, Yopougon",
    typeContrat: "benevolat",
    datePublication: "2025-01-01",
    dateLimite: "2025-06-30",
    salaire: "Bénévolat (frais remboursés)",
    telework: "Sur site",
  },
];

export default function OffresPage() {
  const navigate = useNavigate();
  const [filtres, setFiltres] = useState({
    recherche: "",
    type: "",
    localisation: "",
    telework: "",
  });
  const [offresFiltrees, setOffresFiltrees] = useState(OFFRES_DEMO);
  const [tri, setTri] = useState("date"); // date | salaire | titre
  const [voirFiltres, setVoirFiltres] = useState(false);

  useEffect(() => {
    let resultat = [...OFFRES_DEMO];
    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase();
      resultat = resultat.filter(
        (o) =>
          o.titre.toLowerCase().includes(q) ||
          o.entreprise.toLowerCase().includes(q) ||
          o.localisation.toLowerCase().includes(q)
      );
    }
    if (filtres.type) resultat = resultat.filter((o) => o.typeContrat === filtres.type);
    if (filtres.localisation) {
      const q = filtres.localisation.toLowerCase();
      resultat = resultat.filter((o) => o.localisation.toLowerCase().includes(q));
    }
    if (filtres.telework) {
      if (filtres.telework === "oui") resultat = resultat.filter((o) => o.telework.toLowerCase().includes("remote") || o.telework.toLowerCase().includes("hybride"));
      else if (filtres.telework === "non") resultat = resultat.filter((o) => !o.telework.toLowerCase().includes("remote") && !o.telework.toLowerCase().includes("hybride"));
    }
    // Tri
    if (tri === "date") resultat.sort((a, b) => new Date(b.datePublication) - new Date(a.datePublication));
    else if (tri === "salaire") resultat.sort((a, b) => b.salaire.localeCompare(a.salaire));
    else if (tri === "titre") resultat.sort((a, b) => a.titre.localeCompare(b.titre));
    setOffresFiltrees(resultat);
  }, [filtres, tri]);

  function handleFiltreChange(champ, valeur) {
    setFiltres((f) => ({ ...f, [champ]: valeur }));
  }

  function resetFiltres() {
    setFiltres({ recherche: "", type: "", localisation: "", telework: "" });
  }

  const aFiltresActifs = filtres.recherche || filtres.type || filtres.localisation || filtres.telework;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
      {/* Header avec filtres */}
      <header className="sticky top-16 z-30 bg-[var(--bg-page)]/95 backdrop-blur-sm border-b border-[var(--border-soft)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--emsp-cream)]/10 px-3 py-1">
                <Sparkles size={14} aria-hidden="true" className="text-[var(--emsp-gold)]" />
                <span className="text-xs font-semibold text-[var(--emsp-gold)]">EMSP Connect — Alumni</span>
              </div>
              <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">Offres d'emploi & stages</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
              {/* Barre recherche */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Rechercher un poste, une entreprise, un lieu..."
                  value={filtres.recherche}
                  onChange={(e) => handleFiltreChange("recherche", e.target.value)}
                  className="w-full pl-10"
                />
              </div>

              {/* Filtres avancés */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoirFiltres(!voirFiltres)}
                className={cx("flex items-center gap-2", aFiltresActifs && "border-[var(--emsp-gold)] text-[var(--emsp-gold)]")}
              >
                <Filter size={16} />
                <span>Filtres</span>
                {aFiltresActifs && <Chip tone="gold" className="ml-1">{Object.values(filtres).filter(Boolean).length}</Chip>}
              </Button>

              {/* Bouton création offre */}
              <Button
                size="sm"
                onClick={() => navigate("/offres/creer")}
                className="flex items-center gap-2"
              >
                <Sparkles size={16} aria-hidden="true" />
                <span>Créer une offre</span>
              </Button>
            </div>
          </div>

          {/* Filtres avancés expansibles */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: voirFiltres ? "auto" : 0, opacity: voirFiltres ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-4 lg:hidden"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-4 bg-[var(--bg-panel)] rounded-[var(--radius-card)] border border-[var(--border-soft)]">
              <div className="space-y-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Type d'offre</span>
                  <select
                    value={filtres.type}
                    onChange={(e) => handleFiltreChange("type", e.target.value)}
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                  >
                    <option value="">Tous les types</option>
                    {TYPES_OFFRES.map((t) => (
                      <option key={t.valeur} value={t.valeur}>{t.libelle}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Localisation</span>
                  <Input
                    type="text"
                    placeholder="Ville, quartier..."
                    value={filtres.localisation}
                    onChange={(e) => handleFiltreChange("localisation", e.target.value)}
                  />
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Télétravail</span>
                  <select
                    value={filtres.telework}
                    onChange={(e) => handleFiltreChange("telework", e.target.value)}
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                  >
                    <option value="">Tous</option>
                    <option value="oui">Oui (remote/hybride)</option>
                    <option value="non">Non (sur site uniquement)</option>
                  </select>
                </label>
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={resetFiltres} className="w-full">
                  Réinitialiser
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Barre tri + compteur (desktop) */}
      <div className="hidden lg:block sticky top-64 z-20 bg-[var(--bg-page)]/95 backdrop-blur-sm border-b border-[var(--border-soft)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            {offresFiltrees.length} offre{offresFiltrees.length > 1 ? "s" : ""} trouvée{offresFiltrees.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span>Trier par :</span>
              <select
                value={tri}
                onChange={(e) => setTri(e.target.value)}
                className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
              >
                <option value="date">Date (récentes d'abord)</option>
                <option value="salaire">Salaire (décroissant)</option>
                <option value="titre">Titre (A-Z)</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Liste des offres */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {offresFiltrees.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase size={64} className="mx-auto mb-4 text-[var(--text-muted)]/30" aria-hidden="true" />
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Aucune offre ne correspond</h2>
              <p className="mt-2 text-[var(--text-muted)]">Essaie d'élargir tes critères de recherche</p>
              <Button variant="outline" className="mt-4" onClick={resetFiltres}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {offresFiltrees.map((offre) => {
                const typeInfo = TYPES_OFFRES.find((t) => t.valeur === offre.typeContrat);
                return (
                  <motion.article
                    key={offre.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <Card className="p-5 h-full flex flex-col shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-panel)] transition-shadow border-[var(--border-soft)]">
                      {/* Header offre */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cx("rounded-full p-2", typeInfo?.couleur)}>
                            {typeInfo && <typeInfo.icone size={16} aria-hidden="true" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--emsp-gold)] uppercase tracking-wide">{typeInfo?.libelle}</p>
                            <p className="text-xs text-[var(--text-muted)]">{offre.entreprise}</p>
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">
                          {new Date(offre.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                      </div>

                      {/* Titre */}
                      <h3 className="font-semibold text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--accent-green)] transition-colors">
                        {offre.titre}
                      </h3>

                      {/* Métadonnées */}
                      <div className="flex flex-col gap-2 mb-4 text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} aria-hidden="true" />
                          <span>{offre.localisation}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Euro size={14} aria-hidden="true" />
                          <span>{offre.salaire}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} aria-hidden="true" />
                          <span>{offre.telework}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} aria-hidden="true" />
                          <span>Jusqu'au {new Date(offre.dateLimite).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="mt-auto flex gap-2 pt-3 border-t border-[var(--border-soft)]">
                        <Link to={`/offres/${offre.id}`}>
                          <Button variant="outline" size="sm" className="flex-1">
                            Voir détails
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/offres/${offre.id}/postuler`)}
                          className="flex-1"
                        >
                          Postuler
                        </Button>
                      </div>
                    </Card>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}