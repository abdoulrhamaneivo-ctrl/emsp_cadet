import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Flag, AlertTriangle, CheckCircle, X, Clock, MessageSquare, Shield, Sparkles, Filter, MoreHorizontal, User, Loader2, ChevronDown } from "lucide-react";
import { cx } from "@shared/utils/cx";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import Chip from "@shared/components/Chip";
import ChipIA from "@shared/components/ChipIA";
import { useNavigate } from "react-router-dom";

/**
 * Page Modération admin — P24 (doc 12 §5 + IA-1 source).
 * Liste des signalements (humains + IA) avec actions : valider/masquer/rejeter.
 * Garde admin stricte.
 */
const STATUTS = [
  { valeur: "en_attente", libellé: "En attente", couleur: "bg-amber-500/20 text-amber-400" },
  { valeur: "valide", libellé: "Validé (masqué)", couleur: "bg-[var(--emsp-gold)]/20 text-[var(--emsp-gold)]" },
  { valeur: "rejete", libellé: "Rejeté", couleur: "bg-green-500/20 text-green-400" },
];

const SOURCES = [
  { valeur: "humain", libellé: "Signalement humain", icone: Flag },
  { valeur: "ia", libellé: "Signalement IA", icone: Sparkles },
];

const SIGNALEMENTS_DEMO = [
  {
    id: 1,
    type: "publication",
    auteur: { prenom: "Jean", nom: "Kouassi", email: "jean.kouassi@emsp.int" },
    contenu: "Gagnez de l'argent facile ! Bitcoin, crypto, investissement garanti 100% ! Contactez-moi au +225 07 08 09 10",
    date: "2025-01-15T14:32:00Z",
    source: "ia",
    scoreIA: 85,
    raisonIA: "Spam détecté (mots-clés: argent, bitcoin, crypto, garanti) + PII (téléphone)",
    statut: "en_attente",
    signaleur: null,
  },
  {
    id: 2,
    type: "commentaire",
    auteur: { prenom: "Marie", nom: "Traoré", email: "marie.traore@emsp.int" },
    contenu: "Tu es nul, ferme ta gueule. Personne ne t'aime ici. Retourne chez toi.",
    date: "2025-01-14T09:15:00Z",
    source: "humain",
    signaleur: { prenom: "Paul", nom: "Dubois", email: "paul.dubois@emsp.int" },
    motif: "Harcèlement / insulte",
    statut: "en_attente",
  },
  {
    id: 3,
    type: "publication",
    auteur: { prenom: "Ahmed", nom: "Diallo", email: "ahmed.diallo@emsp.int" },
    contenu: "Mon email : ahmed.diallo@perso.com, mon tel +225 05 06 07 08. Contactez-moi pour business.",
    date: "2025-01-13T16:45:00Z",
    source: "ia",
    scoreIA: 72,
    raisonIA: "PII détectées (email personnel + téléphone)",
    statut: "en_attente",
  },
  {
    id: 4,
    type: "commentaire",
    auteur: { prenom: "Fatou", nom: "Bamba", email: "fatou.bamba@emsp.int" },
    contenu: "Super événement hier ! Merci aux organisateurs.",
    date: "2025-01-12T10:20:00Z",
    source: "humain",
    signaleur: { prenom: "Yasmina", nom: "Kouakou", email: "yasmina.kouakou@emsp.int" },
    motif: "Hors sujet",
    statut: "rejete",
  },
  {
    id: 5,
    type: "publication",
    auteur: { prenom: "Koffi", nom: "Yao", email: "koffi.yao@emsp.int" },
    contenu: "Vente de notes d'examen L3 Réseaux. 5000F la matière. MP moi.",
    date: "2025-01-11T22:10:00Z",
    source: "humain",
    signaleur: { prenom: "Admin", nom: "Système", email: "admin@emsp.int" },
    motif: "Fraude académique",
    statut: "valide",
  },
];

export default function ModerationPage() {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [signalements, setSignalements] = useState(SIGNALEMENTS_DEMO);
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreSource, setFiltreSource] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [modal, setModal] = useState(null); // {signalement, action: "valider"|"rejeter"}

  const signalementsFiltres = signalements.filter((s) => {
    if (filtreStatut && s.statut !== filtreStatut) return false;
    if (filtreSource && s.source !== filtreSource) return false;
    return true;
  });

  const compteurs = {
    en_attente: signalements.filter((s) => s.statut === "en_attente").length,
    valide: signalements.filter((s) => s.statut === "valide").length,
    rejete: signalements.filter((s) => s.statut === "rejete").length,
    total: signalements.length,
  };

  function ouvrirModal(signalement, action) {
      setModal({ signalement, action });
    }

    function demanderConfirmation(signalement, action) {
      ouvrirModal(signalement, action);
    }

    return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">
      {/* Header admin */}
      <header className="sticky top-0 z-40 bg-[var(--emsp-green-deep)]/95 backdrop-blur-sm border-b border-[var(--border-soft)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/administration")}>
              <ArrowLeft size={16} className="mr-1" /> Administration
            </Button>
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--emsp-cream)]/10 px-3 py-1">
              <Shield size={14} aria-hidden="true" className="text-[var(--emsp-gold)]" />
              <span className="text-xs font-semibold text-[var(--emsp-gold)]">Modération</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">{compteurs.en_attente} en attente</span>
          </div>
        </div>
      </header>

      {/* Filtres + compteurs */}
      <div className="sticky top-16 z-30 bg-[var(--bg-page)]/95 backdrop-blur-sm border-b border-[var(--border-soft)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">File de modération</h1>
              <div className="flex items-center gap-1 rounded-full bg-[var(--emsp-cream)]/10 px-2 py-1">
                <Sparkles size={10} aria-hidden="true" className="text-[var(--emsp-gold)]" />
                <span className="text-xs font-semibold text-[var(--emsp-gold)]">IA-1 active</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filtre statut */}
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[var(--text-muted)]" />
                <select
                  value={filtreStatut}
                  onChange={(e) => setFiltreStatut(e.target.value)}
                  className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                >
                  <option value="">Tous les statuts</option>
                  <option value="en_attente">En attente ({compteurs.en_attente})</option>
                  <option value="valide">Validés ({compteurs.valide})</option>
                  <option value="rejete">Rejetés ({compteurs.rejete})</option>
                </select>
              </div>

              {/* Filtre source */}
              <div className="flex items-center gap-2">
                <select
                  value={filtreSource}
                  onChange={(e) => setFiltreSource(e.target.value)}
                  className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none"
                >
                  <option value="">Toutes les sources</option>
                  <option value="humain">Humains</option>
                  <option value="ia">IA</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste signalements */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {signalementsFiltres.length === 0 ? (
            <div className="text-center py-16">
              <Shield size={64} className="mx-auto mb-4 text-[var(--text-muted)]/30" aria-hidden="true" />
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Aucun signalement</h2>
              <p className="mt-2 text-[var(--text-muted)]">Tout est propre pour ces filtres</p>
            </div>
          ) : (
            <div className="space-y-4">
              {signalementsFiltres.map((s) => {
                const sourceInfo = SOURCES.find((src) => src.valeur === s.source);
                return (
                  <motion.article
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cx(
                      "rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-card)]",
                      s.statut === "valide"
                        ? "border-[var(--emsp-gold)]/30 bg-[var(--emsp-gold)]/5"
                        : s.statut === "rejete"
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-[var(--border-soft)]"
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Chip variant={s.source === "ia" ? "gold" : "neutral"} className="flex items-center gap-1">
                            {sourceInfo && <sourceInfo.icone size={10} aria-hidden="true" />}
                            {sourceInfo?.libellé}
                            {s.source === "ia" && s.scoreIA && (
                              <span className="text-xs bg-[var(--emsp-gold)]/20 text-[var(--emsp-gold)] px-1.5 py-0.5 rounded">
                                {s.scoreIA}%
                              </span>
                            )}
                          </Chip>
                          <Chip
                            className={cx(
                              s.statut === "en_attente"
                                ? "bg-amber-500/20 text-amber-400"
                                : s.statut === "valide"
                                ? "bg-[var(--emsp-gold)]/20 text-[var(--emsp-gold)]"
                                : "bg-green-500/20 text-green-400"
                            )}
                          >
                            {STATUTS.find((st) => st.valeur === s.statut)?.libellé}
                          </Chip>
                          <span className="text-xs text-[var(--text-muted)]">
                            {s.type === "publication" ? "Publication" : "Commentaire"}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {new Date(s.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="font-medium text-[var(--text-primary)]">
                            {s.auteur?.prenom} {s.auteur?.nom} <span className="font-normal text-[var(--text-muted)]">({s.auteur?.email})</span>
                          </p>
                        </div>

                        <div className="mb-3 p-3 rounded-[var(--radius-input)] bg-[var(--bg-input)] border border-[var(--border-soft)]">
                          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap line-clamp-3">{s.contenu}</p>
                        </div>

                        {s.source === "ia" && s.raisonIA && (
                          <div className="mb-3 p-3 rounded-[var(--radius-input)] bg-[var(--emsp-gold)]/5 border border-[var(--emsp-gold)]/20">
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles size={14} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                              <span className="text-xs font-semibold text-[var(--emsp-gold)]">Analyse IA (score: {s.scoreIA}%)</span>
                            </div>
                            <p className="text-xs text-[var(--emsp-gold)]">{s.raisonIA}</p>
                          </div>
                        )}

                        {s.source === "humain" && s.signaleur && s.motif && (
                          <div className="mb-3 p-3 rounded-[var(--radius-input)] bg-[var(--bg-panel)] border border-[var(--border-soft)]">
                            <div className="flex items-center gap-2 mb-1">
                              <Flag size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
                              <span className="text-xs font-semibold text-[var(--text-muted)]">Signalé par {s.signaleur.prenom} {s.signaleur.nom}</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">Motif : {s.motif}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:w-auto">
                        {s.statut === "en_attente" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => demanderConfirmation(s, "rejeter")}
                              className="flex-1 lg:flex-none"
                            >
                              <X size={14} className="mr-1" /> Rejeter
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => demanderConfirmation(s, "valider")}
                              className="flex-1 lg:flex-none"
                            >
                              <CheckCircle size={14} className="mr-1" /> Valider (masquer)
                            </Button>
                          </>
                        ) : s.statut === "valide" ? (
                          <Chip className="bg-[var(--emsp-gold)]/20 text-[var(--emsp-gold)]">
                            <CheckCircle size={12} className="mr-1" /> Masqué par modération
                          </Chip>
                        ) : (
                          <Chip className="bg-green-500/20 text-green-400">
                            <X size={12} className="mr-1" /> Signalement rejeté
                          </Chip>
                        )}
                      </div>
                    </div>

                    {s.source === "ia" && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-soft)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <Sparkles size={10} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                        <ChipIA className="ml-1" />
                        <span>Signalement généré automatiquement par l'IA — l'humain décide (RG12.1)</span>
                      </div>
                    )}
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