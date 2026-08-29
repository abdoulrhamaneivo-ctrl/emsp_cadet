import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, MessageCircle, Calendar, Shield, Target } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import WidgetFAQ from "@shared/components/WidgetFAQ";

/**
 * Page d'accueil EMSP Connect — Hero + KPIs + Widget FAQ IA-4.
 * Documentation : doc 03 §6, doc 09 §1 (feed), doc 17 §2 (FAQ IA-4).
 */
export default function AccueilPage() {
  const [faqOuvert, setFaqOuvert] = useState(false);

  const kpis = [
    { icone: Users, label: "Étudiants connectés", valeur: "1 247" },
    { icone: MessageCircle, label: "Messages cette semaine", valeur: "3 892" },
    { icone: Calendar, label: "Événements à venir", valeur: "12" },
    { icone: Shield, label: "Binômes actifs", valeur: "614" },
  ];

  const fonctionnalites = [
    { icone: Target, titre: "Parrainage", desc: "Trouve ton aîné ou tes cadets en un clic", lien: "/parrainage" },
    { icone: MessageCircle, titre: "Fil d'actualité", desc: "Questions, annonces, succès — échanges publics", lien: "/fil" },
    { icone: Calendar, titre: "Événements", desc: "Inscris-toi, discute, participe", lien: "/evenements" },
    { icone: Users, titre: "Messagerie", desc: "Privée avec ton binôme, groupes Famille/Cercles", lien: "/messagerie" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex items-center justify-center px-4 py-16 md:py-24 overflow-hidden">
        {/* Fond vert kente-pattern */}
        <div className="absolute inset-0 bg-[var(--emsp-green-deep)]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0 36v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 6v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-6V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 36v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-30V6H4v4H0v2h4v4h2v-4h4v-2H6zm0-30V6H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
                  EMSP Connect
                </span>
              </div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--emsp-cream)] leading-tight">
              Ta plateforme de parrainage <br />
              <span className="text-[var(--emsp-gold)]">EMSP Abidjan</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-[var(--emsp-cream)]/90">
              Annuaire, parrainage, fil d'actualité, événements, messagerie temps réel —
              tout pour réussir ton parcours à l'École Multinationale des Postes.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button size="lg" onClick={() => setFaqOuvert(true)} startIcon={<Sparkles size={18} />}>
                Essayer l'assistant IA
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = "/annuaire"}>
                Voir l'annuaire
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* KPIs */}
      <section className="px-4 py-12 bg-[var(--bg-page)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-[var(--emsp-cream)]/10 p-2">
                    <kpi.icone size={20} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-[var(--text-muted)]">{kpi.label}</p>
                <p className="mt-1 font-display text-2xl font-bold text-[var(--text-primary)]">{kpi.valeur}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="px-4 py-12 bg-[var(--bg-page)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              Tout ce qu'il te faut
            </h2>
            <p className="mt-1 text-[var(--text-muted)]">
              Quatre piliers pour ton parcours étudiant
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {fonctionnalites.map((f, i) => (
              <motion.div
                key={f.titre}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -4 }}
                className="group rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-panel)]"
              >
                <div className="rounded-full bg-[var(--emsp-cream)]/10 p-3 mb-3">
                  <f.icone size={24} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)]">{f.titre}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{f.desc}</p>
                <a
                  href={f.lien}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-green)] hover:underline"
                >
                  Découvrir <ArrowRight size={13} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Widget FAQ IA-4 */}
      <WidgetFAQ
        open={faqOuvert}
        onClose={() => setFaqOuvert(false)}
        desactive={false}
      />
    </div>
  );
}