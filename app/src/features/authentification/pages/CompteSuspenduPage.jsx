import { motion } from "framer-motion";
import { Sparkles, Lock, AlertCircle, Mail, Clock } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Link } from "react-router-dom";

/**
 * Page Compte suspendu — P07 (doc 16 §4).
 * Affiche le motif et la fin de suspension.
 */
export default function CompteSuspenduPage({ motif = "Non-respect des règles de la communauté", fin = "2025-12-31T23:59:59.000Z" }) {
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
          <Card className="p-6 text-center border-[var(--emsp-gold)]/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto mb-4 rounded-full bg-[var(--emsp-gold)]/10 p-3"
            >
              <Lock size={48} className="text-[var(--emsp-gold)]" aria-hidden="true" />
            </motion.div>

            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Compte suspendu</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Ton accès à EMSP Connect est temporairement suspendu.
            </p>

            <div className="mt-6 p-4 rounded-[var(--radius-card)] bg-[var(--emsp-gold)]/5 border border-[var(--emsp-gold)]/20 text-left">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle size={20} className="text-[var(--emsp-gold)] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Motif</p>
                  <p className="text-sm text-[var(--text-muted)]">{motif}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-[var(--emsp-gold)] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Fin de suspension</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {new Date(fin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-[var(--radius-card)] bg-[var(--bg-panel)] border border-[var(--border-soft)] text-left">
              <p className="font-semibold text-[var(--text-primary)] mb-2">Pendant la suspension :</p>
              <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                <li>• Tu ne peux pas te connecter</li>
                <li>• Tes messages ne sont pas envoyés</li>
                <li>• Tes demandes de parrainage sont en pause</li>
                <li>• Ton profil n'apparaît pas dans l'annuaire</li>
              </ul>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="w-full" onClick={() => window.location.href = "mailto:support@emsp.int"}>
                <Mail size={16} className="mr-2" /> Contacter le support
              </Button>
            </div>

            <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
              <Link to="/connexion" className="text-[var(--accent-green)] hover:underline">Retour à la connexion</Link>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}