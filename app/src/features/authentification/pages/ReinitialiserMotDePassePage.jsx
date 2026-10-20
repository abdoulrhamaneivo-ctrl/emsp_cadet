import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { cx } from "@shared/utils/cx";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "@shared/api/auth";

/**
 * Page Réinitialisation mot de passe — P05 (doc 02 §4, doc 16 §4).
 * Formulaire avec token uid/token dans l'URL.
 */
export default function ReinitialiserMotDePassePage() {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [form, setForm] = useState({ motDePasse: "", confirmerMdp: "" });
  const [etape, setEtape] = useState("formulaire"); // formule | succes
  const [erreur, setErreur] = useState("");
  const [soumission, setSoumission] = useState(false);
  const [voirMdp, setVoirMdp] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    if (!form.motDePasse || form.motDePasse.length < 8) {
      setErreur("Au moins 8 caractères");
      return;
    }
    if (form.motDePasse !== form.confirmerMdp) {
      setErreur("Les mots de passe ne correspondent pas");
      return;
    }
    if (!uid || !token) {
      setErreur("Lien invalide ou expiré");
      return;
    }
    setSoumission(true);
    try {
      await authApi.reinitialiserMotDePasse({ uid, token, password: form.motDePasse });
      setEtape("succes");
    } catch (erreur) {
      const detail = erreur?.response?.data?.detail ?? erreur?.response?.data?.password;
      setErreur(Array.isArray(detail) ? detail[0] : detail ?? "Erreur — lien invalide ou expiré");
    } finally {
      setSoumission(false);
    }
  }

  if (!uid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-[var(--emsp-gold)]" />
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Lien invalide</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate("/mot-de-passe-oublie")}>
            Demander un nouveau lien
          </Button>
        </Card>
      </div>
    );
  }

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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 rounded-full bg-[var(--emsp-cream)]/10 px-3 py-1">
                  <Sparkles size={14} aria-hidden="true" className="text-[var(--emsp-gold)]" />
                  <span className="text-xs font-semibold text-[var(--emsp-gold)]">EMSP Connect</span>
                </div>
              </div>
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                {etape === "formulaire" ? "Nouveau mot de passe" : "C'est fait !"}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {etape === "formulaire" ? "Choisis un mot de passe fort (min. 8 caractères)" : "Ton mot de passe a été mis à jour"}
              </p>
            </div>

            {etape === "formulaire" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {erreur && (
                  <div className="rounded-[var(--radius-input)] bg-[var(--emsp-gold)]/10 border border-[var(--emsp-gold)]/30 p-3 text-sm text-[var(--emsp-gold)] flex items-center gap-2">
                    <AlertCircle size={16} aria-hidden="true" />
                    {erreur}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Nouveau mot de passe *</span>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                      <Input
                        type={voirMdp ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Min. 8 caractères"
                        value={form.motDePasse}
                        onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                        className={cx(
                          "w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                          erreur ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
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
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Confirmer le mot de passe *</span>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                      <Input
                        type={voirMdp ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Répète le mot de passe"
                        value={form.confirmerMdp}
                        onChange={(e) => setForm({ ...form, confirmerMdp: e.target.value })}
                        className={cx(
                          "w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                          erreur ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
                        )}
                        disabled={soumission}
                        required
                      />
                    </div>
                  </label>
                </div>

                <Button type="submit" size="lg" loading={soumission} className="w-full">
                  Valider
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mx-auto mb-4 rounded-full bg-[var(--emsp-cream)]/10 p-3"
                >
                  <CheckCircle size={48} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                </motion.div>
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Mot de passe mis à jour !</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Tu peux maintenant te connecter avec ton nouveau mot de passe.
                </p>
                <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/connexion")}>
                  Aller à la connexion
                </Button>
              </div>
            )}

            <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
              <Link to="/connexion" className="text-[var(--accent-green)] hover:underline font-medium">Connexion</Link>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
