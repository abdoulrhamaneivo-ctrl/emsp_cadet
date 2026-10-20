import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, X, Briefcase, User, Settings, Send, Target, Calendar, Users, Heart } from "lucide-react";
import { cx } from "@shared/utils/cx";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import PanneauCopilot from "@shared/components/PanneauCopilot";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@app/providers/Auth";
import { profilApi } from "@features/profil/api";
import { offresApi } from "@features/offres/api";

/**
 * Page création offre alumni (doc 14 + IA-6 doc 17 §2) — formulaire complet
 * avec copilot IA-6 par section (mission, profil, modalités).
 * 6 types d'offres × 3 sections × copilot 3 propositions.
 */

const TYPES_OFFRES = [
  { valeur: "stage", libelle: "Stage", icone: Briefcase, description: "Étudiant L3/M1/M2 — durée 2-6 mois" },
  { valeur: "alternance", libelle: "Alternance", icone: Users, description: "Contrat apprentissage/pro — 1-3 ans" },
  { valeur: "cdi", libelle: "CDI", icone: Briefcase, description: "Temps plein — expérience requise" },
  { valeur: "cdd", libelle: "CDD", icone: Calendar, description: "Durée déterminée — remplacement/surcroît" },
  { valeur: "freelance", libelle: "Freelance", icone: Settings, description: "Mission ponctuelle — expertise pointue" },
  { valeur: "benevolat", libelle: "Bénévolat", icone: Heart, description: "Engagement associatif — valeurs partagées" },
];

const SECTIONS = [
  { id: "mission", titre: "Mission", icone: Target, hint: "Ce que la personne fera au quotidien", ordre: 1 },
  { id: "profil", titre: "Profil recherché", icone: User, hint: "Compétences, expérience, qualités attendues", ordre: 2 },
  { id: "modalites", titre: "Modalités", icone: Settings, hint: "Durée, rémunération, télétravail, avantages", ordre: 3 },
];

export default function CreerOffrePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const peutPublier = user?.niveauEtude === "alumni" || user?.isAdmin;
  const [typeOffre, setTypeOffre] = useState("stage");
  const [form, setForm] = useState({
    titre: "",
    entreprise: "",
    localisation: "",
    dateLimite: "",
    typeOffre: "stage",
    equipe: "",
    projet: "",
    taches_principales: "",
    domaine: "",
    formation: "",
    competences_requises: "",
    competences: "",
    duree: "",
    modalites: "",
    mois: "",
    montant: "",
    tuteur: "",
    annees: "",
    salaire: "",
    telework: "",
    rythme: "",
    tj: "",
    dispo: "",
    association: "",
    cause: "",
  });
  const [copilots, setCopilots] = useState({
    mission: { ouvert: false, motsCles: "" },
    profil: { ouvert: false, motsCles: "" },
    modalites: { ouvert: false, motsCles: "" },
  });
  const [soumission, setSoumission] = useState(false);
  const [erreur, setErreur] = useState("");

  const { data: prefsIA } = useQuery({
    queryKey: ["preferences-ia"],
    queryFn: () => profilApi.preferencesIA().then((r) => r.data ?? {}),
  });

  const copilotActif = prefsIA?.copilot === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setSoumission(true);
    try {
      await offresApi.creer({
        titre: form.titre,
        typeOffre,
        entreprise: form.entreprise,
        localisation: form.localisation,
        mission: form.taches_principales,
        profil: form.competences_requises,
        modalites: form.modalites,
        salaire: form.salaire || form.montant,
        telework: form.telework,
        dateLimite: form.dateLimite || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["offres"] });
      navigate("/offres");
    } catch (error) {
      const donnees = error?.response?.data ?? {};
      const message = donnees.detail ?? Object.values(donnees).flat().find((valeur) => typeof valeur === "string");
      setErreur(typeof message === "string" ? message : "L'offre n'a pas pu être publiée. Vérifie les champs et réessaie.");
    } finally {
      setSoumission(false);
    }
  };

  if (!peutPublier) {
    return (
      <Card className="mx-auto mt-8 max-w-xl p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-panel-alt)] text-[var(--accent-green)]"><Briefcase size={23} aria-hidden="true" /></div>
        <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">Publication réservée aux alumni</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Les offres sont publiées par les alumni et l'administration EMSP.</p>
        <Button className="mt-5" variant="outline" to="/offres">Retour aux offres</Button>
      </Card>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative flex items-center justify-center px-4 py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--emsp-green-deep)]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0 36v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 6v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-6V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 36v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-30V6H4v4H0v2h4v4h2v-4h4v-2H6zm0-30V6H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--emsp-cream)]/10 px-3 py-1">
                <Sparkles size={14} aria-hidden="true" className="text-[var(--emsp-gold)]" />
                <span className="text-xs font-semibold text-[var(--emsp-gold)]">
                  EMSP Connect — Alumni
                </span>
              </div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--emsp-cream)] leading-tight">
              Publier une offre
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-[var(--emsp-cream)]/90">
              Remplis le formulaire — le copilot IA t'aide à rédiger chaque section.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6 max-w-3xl mx-auto w-full"
        >
          {/* Type d'offre */}
          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)] mb-4">
              Type d'offre
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TYPES_OFFRES.map((t) => (
                <button
                  key={t.valeur}
                  type="button"
                  onClick={() => setTypeOffre(t.valeur)}
                  className={cx(
                    "relative p-4 rounded-[var(--radius-card)] border-2 text-left transition-all",
                    typeOffre === t.valeur
                      ? "border-[var(--emsp-gold)] bg-[var(--emsp-gold)]/5 shadow-[0_0_0_2px_var(--emsp-gold)]"
                      : "border-[var(--border-soft)] hover:border-[var(--emsp-gold)]/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-full bg-[var(--bg-panel-alt)] p-2">
                      <t.icone size={20} className="text-[var(--accent-green)]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">{t.libelle}</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.description}</p>
                    </div>
                  </div>
                  {typeOffre === t.valeur && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--emsp-gold)] flex items-center justify-center"
                    >
                      <X size={12} className="text-[var(--emsp-green-deep)]" aria-hidden="true" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Formulaire principal */}
          <Card className="p-5">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)] mb-4">
              Détails de l'offre
            </h2>

            {/* Titre */}
            <label className="flex flex-col gap-1 mb-4">
              <span className="text-xs font-semibold text-[var(--text-muted)]">Titre de l'offre *</span>
              <input
                type="text"
                maxLength={120}
                className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                placeholder="ex: Développeur Full Stack Junior — Stage 6 mois"
                required
              />
            </label>

            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Entreprise / organisation *</span>
                <input type="text" maxLength={120} required value={form.entreprise} onChange={(e) => setForm({ ...form, entreprise: e.target.value })} placeholder="Nom de la structure" className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-green)] focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Lieu de travail *</span>
                <input type="text" maxLength={160} required value={form.localisation} onChange={(e) => setForm({ ...form, localisation: e.target.value })} placeholder="Ville, quartier ou télétravail" className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-green)] focus:outline-none" />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-semibold text-[var(--text-muted)]">Date limite de candidature <span className="font-normal">(facultatif)</span></span>
                <input type="date" value={form.dateLimite} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, dateLimite: e.target.value })} className="w-full rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-green)] focus:outline-none sm:max-w-xs" />
              </label>
            </div>

            {/* Type d'offre (hidden, géré par les cartes) */}
            <input type="hidden" name="typeOffre" value={typeOffre} />

            {/* Variables pour le copilot */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                Contexte (pour le copilot IA-6)
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Équipe / Service</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.equipe}
                    onChange={(e) => setForm({ ...form, equipe: e.target.value })}
                    placeholder="ex: Équipe Data, Pôle Tech, Marketing"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Nom du projet</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.projet}
                    onChange={(e) => setForm({ ...form, projet: e.target.value })}
                    placeholder="ex: Refonte API, Migration Cloud, Appli Mobile"
                  />
                </label>
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Tâches principales (mots-clés pour le copilot)</span>
                  <textarea
                    rows={2}
                    className="resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.taches_principales}
                    onChange={(e) => setForm({ ...form, taches_principales: e.target.value })}
                    placeholder="ex: API REST, React, PostgreSQL, CI/CD, tests unitaires"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Domaine technique</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.domaine}
                    onChange={(e) => setForm({ ...form, domaine: e.target.value })}
                    placeholder="ex: Backend, Frontend, Data, DevOps, Mobile"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Formation visée</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.formation}
                    onChange={(e) => setForm({ ...form, formation: e.target.value })}
                    placeholder="ex: L3 Informatique, M1 Data Science, M2 IA"
                  />
                </label>
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Compétences requises (mots-clés)</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.competences_requises}
                    onChange={(e) => setForm({ ...form, competences_requises: e.target.value })}
                    placeholder="ex: Python, React, SQL, Docker, AWS"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Compétences appréciées (bonus)</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.competences}
                    onChange={(e) => setForm({ ...form, competences: e.target.value })}
                    placeholder="ex: GraphQL, Kubernetes, Tests, Agile"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Durée (mois)</span>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                    placeholder="6"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Mois de début</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.mois}
                    onChange={(e) => setForm({ ...form, mois: e.target.value })}
                    placeholder="ex: Septembre, Janvier, Mars"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Rémunération (€/mois ou k€/an)</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.montant}
                    onChange={(e) => setForm({ ...form, montant: e.target.value })}
                    placeholder="ex: 800 (stage), 35k (CDI), 400€/jour (freelance)"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Tuteur / Référent</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.tuteur}
                    onChange={(e) => setForm({ ...form, tuteur: e.target.value })}
                    placeholder="ex: Jean Dupont, Lead Dev"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Années d'expérience requises</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.annees}
                    onChange={(e) => setForm({ ...form, annees: e.target.value })}
                    placeholder="ex: 0 (stage), 3 (CDI senior)"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Salaire (k€/an)</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.salaire}
                    onChange={(e) => setForm({ ...form, salaire: e.target.value })}
                    placeholder="ex: 35, 45, 55"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Télétravail</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.telework}
                    onChange={(e) => setForm({ ...form, telework: e.target.value })}
                    placeholder="ex: 2j/sem, 100%, hybride"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Rythme alternance</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.rythme}
                    onChange={(e) => setForm({ ...form, rythme: e.target.value })}
                    placeholder="ex: 3j école / 2j entreprise, semaine alternée"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">TJM freelance (€/jour)</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.tj}
                    onChange={(e) => setForm({ ...form, tj: e.target.value })}
                    placeholder="ex: 400, 500, 600"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Disponibilité</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.dispo}
                    onChange={(e) => setForm({ ...form, dispo: e.target.value })}
                    placeholder="ex: 2j/sem, weekends, temps plein"
                  />
                </label>
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Association / Cause</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.association}
                    onChange={(e) => setForm({ ...form, association: e.target.value })}
                    placeholder="ex: Emmaüs, Croix-Rouge, École locale"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Cause soutenue</span>
                  <input
                    className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                    value={form.cause}
                    onChange={(e) => setForm({ ...form, cause: e.target.value })}
                    placeholder="ex: Insertion, Éducation, Environnement"
                  />
                </label>
              </div>
            </div>

            {/* Sections avec copilot IA-6 */}
            {SECTIONS.map((s) => (
              <div key={s.id} className="mt-6 p-4 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)]">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-[var(--emsp-cream)]/10 p-2">
                      <s.icone size={16} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{s.titre}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{s.hint}</p>
                    </div>
                  </div>
                  {/* Bouton copilot IA-6 */}
                  {copilotActif && (
                    <button
                      type="button"
                      onClick={() => setCopilots((c) => ({ ...c, [s.id]: { ouvert: true, motsCles: "" } }))}
                      className="flex items-center gap-1.5 rounded-full border border-[var(--border-structural)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-green)] hover:bg-[var(--hover-bg)]"
                    >
                      <Sparkles size={13} aria-hidden="true" />
                      <span>M'aider à rédiger</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {s.id === "mission" && (
                    <>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Description de la mission *</span>
                        <textarea
                          rows={4}
                          maxLength={2000}
                          className="resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                          value={form.taches_principales}
                          onChange={(e) => setForm({ ...form, taches_principales: e.target.value })}
                          placeholder="Décris la mission, les livrables, l'équipe, l'impact..."
                          required
                        />
                      </label>
                      {/* Copilot IA-6 - Mission */}
                      <PanneauCopilot
                        section="mission"
                        motsCles={copilots.mission?.motsCles || form.taches_principales}
                        surInsertion={(texte) => setForm((f) => ({ ...f, taches_principales: texte }))}
                        surFermeture={() => setCopilots((c) => ({ ...c, mission: { ouvert: false, motsCles: "" } }))}
                        desactive={!copilotActif}
                      />
                    </>
                  )}

                  {s.id === "profil" && (
                    <>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Profil recherché *</span>
                        <textarea
                          rows={4}
                          maxLength={2000}
                          className="resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                          value={form.competences_requises}
                          onChange={(e) => setForm({ ...form, competences_requises: e.target.value })}
                          placeholder="Compétences techniques, soft skills, expérience, formation..."
                          required
                        />
                      </label>
                      {/* Copilot IA-6 - Profil */}
                      <PanneauCopilot
                        section="profil"
                        motsCles={copilots.profil?.motsCles || form.competences_requises}
                        surInsertion={(texte) => setForm((f) => ({ ...f, competences_requises: texte }))}
                        surFermeture={() => setCopilots((c) => ({ ...c, profil: { ouvert: false, motsCles: "" } }))}
                        desactive={!copilotActif}
                      />
                    </>
                  )}

                  {s.id === "modalites" && (
                    <>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Modalités *</span>
                        <textarea
                          rows={4}
                          maxLength={2000}
                          className="resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                          value={form.modalites}
                          onChange={(e) => setForm({ ...form, modalites: e.target.value })}
                          placeholder="Durée, rémunération, télétravail, avantages, dates, processus de recrutement..."
                          required
                        />
                      </label>
                      {/* Copilot IA-6 - Modalités */}
                      <PanneauCopilot
                        section="modalites"
                        motsCles={copilots.modalites?.motsCles || form.modalites}
                        surInsertion={(texte) => setForm((f) => ({ ...f, modalites: texte }))}
                        surFermeture={() => setCopilots((c) => ({ ...c, modalites: { ouvert: false, motsCles: "" } }))}
                        desactive={!copilotActif}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </Card>

          {/* Bouton soumission */}
          {erreur && <p role="alert" className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">{erreur}</p>}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              loading={soumission}
              icon={Send}
              className="min-w-[280px]"
            >
              Publier l'offre
            </Button>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
