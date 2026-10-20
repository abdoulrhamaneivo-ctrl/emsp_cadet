import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "@shared/api/auth";

/**
 * Page Vérification email — P06 (doc 02 §4, doc 16 §4).
 * Vérification avec token uid/token dans l'URL.
 */
export default function VerifierEmailPage() {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [etat, setEtat] = useState("verification"); // verification | succes | erreur
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!uid || !token) {
      setEtat("erreur");
      setMessage("Lien invalide ou manquant");
      return;
    }
    const verifier = async () => {
      setEtat("verification");
      try {
        const resultat = await authApi.verifierEmail(uid, token);
        setEtat("succes");
        setMessage(resultat.detail ?? "Ton adresse e-mail a été confirmée.");
      } catch (erreur) {
        setEtat("erreur");
        setMessage(erreur?.response?.data?.detail ?? "Lien invalide ou expiré");
      }
    };
    verifier();
  }, [uid, token]);

  if (etat === "verification") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 text-center">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4 rounded-full bg-[var(--emsp-cream)]/10 p-3"
          >
            <Loader2 size={48} className="text-[var(--emsp-gold)]" aria-hidden="true" />
          </motion.div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Vérification en cours...</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Merci de patienter</p>
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
          <Card className="p-6 text-center">
            {etat === "succes" ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mx-auto mb-4 rounded-full bg-[var(--emsp-cream)]/10 p-3"
                >
                  <CheckCircle size={48} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                </motion.div>
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Email vérifié !</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{message}</p>
                <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/connexion")}>
                  Aller à la connexion
                </Button>
              </>
            ) : (
              <>
                <AlertCircle size={48} className="mx-auto mb-4 text-[var(--emsp-gold)]" />
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Lien invalide</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{message}</p>
                <Button className="mt-6 w-full" onClick={() => navigate("/inscription")}>
                  Recommencer l'inscription
                </Button>
              </>
            )}
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              <button onClick={() => navigate("/connexion")} className="text-[var(--accent-green)] hover:underline font-medium">Connexion</button>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
