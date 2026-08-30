import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, MessageCircle, Calendar, Shield, Target, Sparkles, Mail, Lock, Eye, CheckCircle } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Input } from "@shared/components/Input";

/**
 * Landing page publique EMSP Connect — P01 (doc 02 §4, doc 03 §6).
 * Adaptation du template Home (doc 09 §5) : hero, KPIs, fonctionnalités,
 * pré-inscription email, preuve sociale, footer.
 */
export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [inscription, setInscription] = useState("idle"); // idle | loading | success | error

  const kpis = [
    { icone: Users, label: "Étudiants connectés", valeur: "1 247" },
    { icone: MessageCircle, label: "Messages cette semaine", valeur: "3 892" },
    { icone: Calendar, label: "Événements à venir", valeur: "12" },
    { icone: Shield, label: "Binômes actifs", valeur: "614" },
  ];

  const fonctionnalites = [
    { icone: Target, titre: "Parrainage intelligent", desc: "Matching IA selon tes attentes et la vitrine de ton aîné", lien: "/annuaire" },
    { icone: MessageCircle, titre: "Fil d'actualité", desc: "Questions, annonces, réussites — échanges publics entre promotions", lien: "/fil" },
    { icone: Calendar, titre: "Événements", desc: "Inscris-toi en un clic, discute avec les participants", lien: "/evenements" },
    { icone: Users, titre: "Messagerie temps réel", desc: "Privée avec ton binôme, groupes Famille & Cercles", lien: "/messagerie" },
  ];

  const preuves = [
    { icone: CheckCircle, texte: "Authentification @emsp.int exclusive — sécurité totale" },
    { icone: CheckCircle, texte: "Parrainage officiel : aîné = promo qui devance (L1→L2, L2→L3…)" },
    { icone: CheckCircle, texte: "Transition annuelle sans casser les binômes (règle Ivo n°1)" },
    { icone: CheckCircle, texte: "IA responsable : modération, matching, copilot, FAQ, détection silence, offres" },
  ];

  async function handlePreInscription(e) {
    e.preventDefault();
    if (!email.includes("@emsp.int")) {
      setInscription("error");
      return;
    }
    setInscription("loading");
    try {
      // TODO: appel API pré-inscription (à créer)
      await new Promise((r) => setTimeout(r, 800));
      setInscription("success");
      setEmail("");
    } catch {
      setInscription("error");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar publique légère */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--emsp-green-deep)]/95 backdrop-blur-sm border-b border-[var(--border-soft)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--emsp-cream)]/10 px-3 py-1">
              <Sparkles size={14} aria-hidden="true" className="text-[var(--emsp-gold)]" />
              <span className="text-xs font-semibold text-[var(--emsp-gold)]">EMSP Connect</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <a href="/connexion" className="text-sm font-medium text-[var(--emsp-cream)]/90 hover:text-[var(--emsp-cream)]">Connexion</a>
            <Button size="sm" onClick={() => document.getElementById("preinscription")?.scrollIntoView({ behavior: "smooth" })}>
              Rejoindre
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex items-center justify-center px-4 pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
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
                  EMSP Connect
                </span>
              </div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--emsp-cream)] leading-tight">
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
              <Button size="lg" onClick={() => document.getElementById("preinscription")?.scrollIntoView({ behavior: "smooth" })} startIcon={<Sparkles size={18} />}>
                Rejoindre la liste d'attente
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = "/connexion"}>
                Déjà un compte ? Connexion
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

      {/* Preuve sociale / Garanties */}
      <section className="px-4 py-12 bg-[var(--bg-page)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
              Pourquoi EMSP Connect ?
            </h2>
            <p className="mt-1 text-[var(--text-muted)]">
              Conçu par et pour les étudiants de l'EMSP — règles métier verrouillées, IA responsable.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {preuves.map((p, i) => (
              <motion.div
                key={p.texte}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="group rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-panel)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-full bg-[var(--emsp-cream)]/10 p-2">
                    <p.icone size={20} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-[var(--text-primary)]">{p.texte}</p>
                </div>
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

      {/* Pré-inscription email */}
      <section id="preinscription" className="px-4 py-16 bg-[var(--emsp-green-deep)] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0 36v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 6v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-6V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 36v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-30V6H4v4H0v2h4v4h2v-4h4v-2H6zm0-30V6H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--emsp-cream)]/10 px-3 py-1">
                <Mail size={14} aria-hidden="true" className="text-[var(--emsp-gold)]" />
                <span className="text-xs font-semibold text-[var(--emsp-gold)]">
                  Accès anticipé
                </span>
              </div>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--emsp-cream)] leading-tight">
              Veux-tu être prévenu à l'ouverture ?
            </h2>
            <p className="max-w-xl mx-auto text-lg text-[var(--emsp-cream)]/90">
              Laisse ton email @emsp.int — on t'avertit dès que ton compte est prêt.
              Pas de spam, juste l'essentiel.
            </p>
            <form onSubmit={handlePreInscription} className="w-full max-w-md mt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="ton.email@emsp.int"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={inscription !== "idle"}
                    aria-label="Email @emsp.int pour pré-inscription"
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  loading={inscription === "loading"}
                  disabled={inscription !== "idle"}
                  className="w-full sm:w-auto min-w-[160px]"
                >
                  {inscription === "success" ? (
                    <>✓ Inscrit !</>
                  ) : inscription === "error" ? (
                    <>Email @emsp.int requis</>
                  ) : (
                    <>Je m'inscris</>
                  )}
                </Button>
              </div>
              {inscription === "success" && (
                <p className="mt-3 text-sm text-[var(--emsp-cream)]/90">
                  Merci ! Tu recevras un email quand ton compte sera activé.
                </p>
              )}
              {inscription === "error" && (
                <p className="mt-3 text-sm text-[var(--emsp-gold)]">
                  Utilise ton email @emsp.int officiel.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--emsp-green-deep)] border-t border-[var(--border-soft)]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1.5">
                <Sparkles size={18} aria-hidden="true" className="text-[var(--emsp-gold)]" />
                <span className="font-display text-xl font-bold text-[var(--emsp-cream)]">EMSP Connect</span>
              </div>
              <p className="text-sm text-[var(--emsp-cream)]/70">
                Plateforme officielle de parrainage de l'École Multinationale des Postes d'Abidjan.
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              <h4 className="font-semibold text-[var(--emsp-cream)]">Plateforme</h4>
              <a href="/annuaire" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Annuaire</a>
              <a href="/fil" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Fil d'actualité</a>
              <a href="/evenements" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Événements</a>
              <a href="/messagerie" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Messagerie</a>
            </nav>
            <nav className="flex flex-col gap-2">
              <h4 className="font-semibold text-[var(--emsp-cream)]">Parrainage</h4>
              <a href="/mes-demandes" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Mes demandes</a>
              <a href="/mon-parrainage" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Mon parrainage</a>
              <a href="/rendez-vous" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Rendez-vous</a>
            </nav>
            <nav className="flex flex-col gap-2">
              <h4 className="font-semibold text-[var(--emsp-cream)]">Légal</h4>
              <a href="#" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Mentions légales</a>
              <a href="#" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Données personnelles</a>
              <a href="#" className="text-sm text-[var(--emsp-cream)]/70 hover:text-[var(--emsp-cream)]">Accessibilité</a>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-[var(--border-soft)] text-center text-sm text-[var(--emsp-cream)]/60">
            © 2025 EMSP Connect — École Multinationale des Postes, Abidjan
          </div>
        </div>
      </footer>
    </div>
  );
}