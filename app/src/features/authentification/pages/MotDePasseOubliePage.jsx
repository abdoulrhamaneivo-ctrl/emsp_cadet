import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { cx } from "@shared/utils/cx";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { Link, useNavigate } from "react-router-dom";

/**
 * Page Mot de passe oublié — P04 (doc 02 §4, doc 16 §4).
 * Demande de réinitialisation par email @emsp.int.
 */
export default function MotDePasseOubliePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [etape, setEtape] = useState("demande"); // demande | envoye
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    if (!email || !email.endsWith("@emsp.int")) {
      setErreur("Utilise ton email @emsp.int");
      return;
    }
    setEnvoi(true);
    try {
      // TODO: appel API demande reset
      await new Promise((r) => setTimeout(r, 800));
      setEtape("envoye");
    } catch {
      setErreur("Erreur serveur — réessaie plus tard");
    } finally {
      setEnvoi(false);
    }
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/connexion")}>
            <ArrowLeft size={16} className="mr-1" /> Connexion
          </Button>
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
                {etape === "demande" ? "Mot de passe oublié" : "Email envoyé"}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {etape === "demande"
                  ? "Entre ton email @emsp.int pour recevoir un lien de réinitialisation"
                  : "Un lien a été envoyé à ton adresse email"}
              </p>
            </div>

            {etape === "demande" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {erreur && (
                  <div className="rounded-[var(--radius-input)] bg-[var(--emsp-gold)]/10 border border-[var(--emsp-gold)]/30 p-3 text-sm text-[var(--emsp-gold)] flex items-center gap-2">
                    <AlertCircle size={16} aria-hidden="true" />
                    {erreur}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Email @emsp.int *</span>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="prenom.nom@emsp.int"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cx(
                          "w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                          erreur ? "border-[var(--emsp-gold)]" : "border-[var(--border-soft)]"
                        )}
                        disabled={envoi}
                        required
                      />
                    </div>
                  </label>
                </div>

                <Button type="submit" size="lg" loading={envoi} className="w-full">
                  Envoyer le lien
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
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Email envoyé !</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Vérifie ta boîte <strong>{email}</strong> et clique sur le lien pour réinitialiser ton mot de passe.
                </p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Le lien expire dans 1 heure. Si tu ne reçois rien, vérifie tes spams.
                </p>
                <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/connexion")}>
                  Retour à la connexion
                </Button>
              </div>
            )}

            <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
              Tu te souviens ? <Link to="/connexion" className="text-[var(--accent-green)] hover:underline font-medium">Connexion</Link>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}