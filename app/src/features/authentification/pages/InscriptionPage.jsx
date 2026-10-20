import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { cx } from "@shared/utils/cx";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@shared/api/auth";

/**
 * Page Inscription — P03 (doc 02 §4, doc 16 §4).
 * Création de compte @emsp.int avec validation RG4 (casquettes).
 */
export default function InscriptionPage() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(1); // 1: email, 2: profil, 3: casquettes, 4: succès
  const [form, setForm] = useState({
    email: "",
    prenom: "",
    nom: "",
    classe: "",
    filiere: "",
    motDePasse: "",
    confirmerMdp: "",
    casquette: null, // "cadet" | "aine"
    acceptConditions: false,
  });
  const [erreurs, setErreurs] = useState({});
  const [soumission, setSoumission] = useState(false);
  const [voirMdp, setVoirMdp] = useState(false);
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);
  const [messageRenvoi, setMessageRenvoi] = useState("");

  const CLASSES = [
    "L1", "L2", "L3", "M1", "M2"
  ];

  const FILIERES = [
    "Réseaux & Télécoms", "Informatique", "Gestion", "Marketing", "Finance"
  ];

  function validerEtape1() {
    const erreurs = {};
    if (!form.email) erreurs.email = "Email requis";
    else if (!form.email.endsWith("@emsp.int")) erreurs.email = "Utilise ton email @emsp.int";
    setErreurs(erreurs);
    return Object.keys(erreurs).length === 0;
  }

  function validerEtape2() {
    const erreurs = {};
    if (!form.prenom.trim()) erreurs.prenom = "Prénom requis";
    if (!form.nom.trim()) erreurs.nom = "Nom requis";
    if (!form.classe) erreurs.classe = "Choisis ta classe";
    if (!form.filiere) erreurs.filiere = "Choisis ta filière";
    if (!form.motDePasse) erreurs.motDePasse = "Mot de passe requis";
    else if (form.motDePasse.length < 8) erreurs.motDePasse = "Au moins 8 caractères";
    if (form.motDePasse !== form.confirmerMdp) erreurs.confirmerMdp = "Les mots de passe ne correspondent pas";
    setErreurs(erreurs);
    return Object.keys(erreurs).length === 0;
  }

  function validerEtape3() {
    const erreurs = {};
    if (!form.casquette) erreurs.casquette = "Choisis ton rôle (cadet ou aîné)";
    if (!form.acceptConditions) erreurs.acceptConditions = "Tu dois accepter les conditions";
    setErreurs(erreurs);
    return Object.keys(erreurs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (etape === 1 && !validerEtape1()) return;
    if (etape === 2 && !validerEtape2()) return;
    if (etape === 3 && !validerEtape3()) return;

    if (etape < 3) {
      setEtape(etape + 1);
      return;
    }

    setSoumission(true);
    try {
      await authApi.inscription({
        email: form.email.trim(),
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        classe: form.classe,
        filiere: form.filiere,
        password: form.motDePasse,
        casquette: form.casquette,
        acceptConditions: form.acceptConditions,
      });
      setEtape(4);
    } catch (erreur) {
      const detail = erreur?.response?.data?.detail ?? erreur?.response?.data;
      const premier = detail && typeof detail === "object"
        ? Object.values(detail).flat()[0]
        : detail;
      setErreurs({ global: typeof premier === "string" ? premier : "Inscription impossible — vérifie les informations et réessaie." });
    } finally {
      setSoumission(false);
    }
  }

  async function renvoyerConfirmation() {
    setRenvoiEnCours(true);
    setMessageRenvoi("");
    try {
      const resultat = await authApi.renvoyerConfirmation(form.email.trim());
      setMessageRenvoi(resultat.detail);
    } catch (erreur) {
      setMessageRenvoi(erreur?.response?.data?.detail ?? "Envoi impossible pour le moment. Réessaie plus tard.");
    } finally {
      setRenvoiEnCours(false);
    }
  }

  function handleBack() {
    if (etape > 1) setEtape(etape - 1);
  }

  const etapes = [
    { num: 1, label: "Email" },
    { num: 2, label: "Profil" },
    { num: 3, label: "Rôle" },
    { num: 4, label: "Validé" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--emsp-green-deep)]/95 backdrop-blur-sm border-b border-[var(--border-soft)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--emsp-cream)]/10 px-3 py-1">
              <Sparkles size={14} aria-hidden="true" className="text-[var(--emsp-gold)]" />
              <span className="text-xs font-semibold text-[var(--emsp-gold)]">EMSP Connect</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/connexion")}>
            <ArrowLeft size={16} className="mr-1" /> Connexion
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Indicateur d'étapes */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {etapes.map((e, i) => (
                <div key={e.num} className="flex flex-col items-center">
                  <div
                    className={cx(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      i + 1 < etape
                        ? "bg-[var(--emsp-gold)] text-[var(--emsp-green-deep)]"
                        : i + 1 === etape
                        ? "bg-[var(--emsp-cream)]/10 border-2 border-[var(--emsp-gold)] text-[var(--emsp-gold)]"
                        : "bg-[var(--bg-input)] border-2 border-[var(--border-soft)] text-[var(--text-muted)]"
                    )}
                  >
                    {i + 1 < etape ? <CheckCircle size={16} /> : e.num}
                  </div>
                  <span className="mt-1 text-xs text-[var(--text-muted)] text-center w-20">{e.label}</span>
                  {i < etapes.length - 1 && (
                    <div
                      className={cx(
                        "absolute top-5 left-1/2 w-full h-1 -ml-1/2",
                        i + 1 < etape
                          ? "bg-[var(--emsp-gold)]"
                          : "bg-[var(--border-soft)]"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 rounded-full bg-[var(--emsp-cream)]/10 px-3 py-1">
                  <Sparkles size={14} aria-hidden="true" className="text-[var(--emsp-gold)]" />
                  <span className="text-xs font-semibold text-[var(--emsp-gold)]">EMSP Connect</span>
                </div>
              </div>
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                {etape === 1 ? "Créer ton compte" : etape === 2 ? "Ton profil" : etape === 3 ? "Ton rôle" : "C'est fait !"}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {etape === 1 ? "Utilise ton email @emsp.int officiel" : etape === 2 ? "Infos visibles par ton futur aîné" : etape === 3 ? "Cadet = cherche un aîné / Aîné = aide un cadet" : "Ton compte est prêt"}
              </p>
            </div>

            {etape === 4 ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mx-auto mb-4 rounded-full bg-[var(--emsp-cream)]/10 p-3"
                >
                  <CheckCircle size={48} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                </motion.div>
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Compte créé !</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Un e-mail de confirmation a été envoyé à <strong>{form.email}</strong>. Clique sur le lien reçu avant de te connecter.
                </p>
                <button type="button" onClick={renvoyerConfirmation} disabled={renvoiEnCours} className="mt-4 text-sm font-semibold text-[var(--accent-green)] hover:underline disabled:opacity-60">
                  {renvoiEnCours ? "Envoi…" : "Renvoyer l’e-mail de confirmation"}
                </button>
                {messageRenvoi && <p role="status" className="mt-2 text-xs text-[var(--text-muted)]">{messageRenvoi}</p>}
                <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/connexion")}>
                  Aller à la connexion
                </Button>
              </div>
            ) : (
              <form id="inscription-form" onSubmit={handleSubmit} className="space-y-4">
                {erreurs.global && (
                  <div className="rounded-[var(--radius-input)] bg-[var(--emsp-gold)]/10 border border-[var(--emsp-gold)]/30 p-3 text-sm text-[var(--emsp-gold)] flex items-center gap-2">
                    <AlertCircle size={16} aria-hidden="true" />
                    {erreurs.global}
                  </div>
                )}

                {etape === 1 && (
                  <>
                    <div className="space-y-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Email @emsp.int *</span>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                          <input
                            type="email"
                            autoComplete="email"
                            placeholder="prenom.nom@emsp.int"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className={cx(
                              "w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.email ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          />
                        </div>
                        {erreurs.email && <p className="text-xs text-[var(--emsp-gold)]">{erreurs.email}</p>}
                      </label>
                    </div>
                  </>
                )}

                {etape === 2 && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">Prénom *</span>
                          <input
                            type="text"
                            autoComplete="given-name"
                            placeholder="Prénom"
                            value={form.prenom}
                            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                            className={cx(
                              "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.prenom ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          />
                          {erreurs.prenom && <p className="text-xs text-[var(--emsp-gold)]">{erreurs.prenom}</p>}
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">Nom *</span>
                          <input
                            type="text"
                            autoComplete="family-name"
                            placeholder="Nom"
                            value={form.nom}
                            onChange={(e) => setForm({ ...form, nom: e.target.value })}
                            className={cx(
                              "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.nom ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          />
                          {erreurs.nom && <p className="text-xs text-[var(--emsp-gold)]">{erreurs.nom}</p>}
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">Classe *</span>
                          <select
                            value={form.classe}
                            onChange={(e) => setForm({ ...form, classe: e.target.value })}
                            className={cx(
                              "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.classe ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          >
                            <option value="">Choisis ta classe</option>
                            {CLASSES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          {erreurs.classe && <p className="text-xs text-[var(--emsp-gold)]">{erreurs.classe}</p>}
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">Filière *</span>
                          <select
                            value={form.filiere}
                            onChange={(e) => setForm({ ...form, filiere: e.target.value })}
                            className={cx(
                              "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.filiere ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          >
                            <option value="">Choisis ta filière</option>
                            {FILIERES.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          {erreurs.filiere && <p className="text-xs text-[var(--emsp-gold)]">{erreurs.filiere}</p>}
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Mot de passe *</span>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                          <input
                            type={voirMdp ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Min. 8 caractères"
                            value={form.motDePasse}
                            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                            className={cx(
                              "w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.motDePasse ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setVoirMdp(!voirMdp)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            aria-label={voirMdp ? "Masquer" : "Afficher"}
                          >
                            {voirMdp ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {erreurs.motDePasse && <p className="text-xs text-[var(--emsp-gold)]">{erreurs.motDePasse}</p>}
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Confirmer le mot de passe *</span>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                          <input
                            type={voirMdp ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Répète le mot de passe"
                            value={form.confirmerMdp}
                            onChange={(e) => setForm({ ...form, confirmerMdp: e.target.value })}
                            className={cx(
                              "w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.confirmerMdp ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          />
                        </div>
                        {erreurs.confirmerMdp && <p className="text-xs text-[var(--emsp-gold)]">{erreurs.confirmerMdp}</p>}
                      </label>
                    </div>
                  </>
                )}

                {etape === 3 && (
                  <>
                    <div className="space-y-4">
                      <p className="text-sm text-[var(--text-muted)]">
                        <strong>Cadet :</strong> tu cherches un aîné (promo qui devance la tienne).<br />
                        <strong>Aîné :</strong> tu accompagnes un cadet (tu es L2+).
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => { setForm({ ...form, casquette: "cadet" }); setErreurs({ ...erreurs, casquette: undefined }); }}
                          className={cx(
                            "p-4 rounded-[var(--radius-card)] border-2 text-left transition-all",
                            form.casquette === "cadet"
                              ? "border-[var(--emsp-gold)] bg-[var(--emsp-gold)]/5 shadow-[0_0_0_2px_var(--emsp-gold)]"
                              : "border-[var(--border-soft)] hover:border-[var(--emsp-gold)]/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 rounded-full bg-[var(--emsp-cream)]/10 p-2">
                              <Sparkles size={20} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[var(--text-primary)]">Je suis Cadet</h3>
                              <p className="text-xs text-[var(--text-muted)]">Je cherche mon aîné</p>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setForm({ ...form, casquette: "aine" }); setErreurs({ ...erreurs, casquette: undefined }); }}
                          className={cx(
                            "p-4 rounded-[var(--radius-card)] border-2 text-left transition-all",
                            form.casquette === "aine"
                              ? "border-[var(--emsp-gold)] bg-[var(--emsp-gold)]/5 shadow-[0_0_0_2px_var(--emsp-gold)]"
                              : "border-[var(--border-soft)] hover:border-[var(--emsp-gold)]/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 rounded-full bg-[var(--emsp-cream)]/10 p-2">
                              <Sparkles size={20} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[var(--text-primary)]">Je suis Aîné</h3>
                              <p className="text-xs text-[var(--text-muted)]">J'accompagne un cadet (L2+)</p>
                            </div>
                          </div>
                        </button>
                      </div>
                      {erreurs.casquette && <p className="text-xs text-[var(--emsp-gold)]">{erreurs.casquette}</p>}

                      <label className="flex items-start gap-3 rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-3">
                        <input
                          type="checkbox"
                          checked={form.acceptConditions}
                          onChange={(e) => setForm({ ...form, acceptConditions: e.target.checked })}
                          className="mt-1 w-4 h-4 rounded border-[var(--border-soft)] text-[var(--emsp-gold)] focus:ring-[var(--emsp-gold)]"
                          required
                        />
                        <div className="text-sm text-[var(--text-muted)]">
                          J'accepte les <a href="#" className="text-[var(--accent-green)] hover:underline">conditions d'utilisation</a> et la <a href="#" className="text-[var(--accent-green)] hover:underline">politique de confidentialité</a>.
                          {erreurs.acceptConditions && <p className="text-xs text-[var(--emsp-gold)] mt-1">{erreurs.acceptConditions}</p>}
                        </div>
                      </label>
                    </div>
                  </>
                )}
              </form>
            )}

            <div className="mt-6 flex gap-3">
              {etape > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} disabled={soumission} className="flex-1">
                  Retour
                </Button>
              )}
              <Button type="submit" form="inscription-form" size="lg" loading={soumission} className="flex-1">
                {etape === 1 ? "Continuer" : etape === 2 ? "Continuer" : "Valider mon inscription"}
              </Button>
            </div>
          </Card>

          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            Déjà un compte ? <Link to="/connexion" className="text-[var(--accent-green)] hover:underline font-medium">Connexion</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
