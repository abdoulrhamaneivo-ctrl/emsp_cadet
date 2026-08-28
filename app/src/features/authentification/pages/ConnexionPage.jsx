import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AtSign, CalendarCheck, Eye, EyeOff, GraduationCap, KeyRound, LogIn, MessageSquareText, MousePointerClick, TriangleAlert } from "lucide-react";
import { authApi } from "@shared/api/auth";
import { useAuth } from "@app/providers/Auth";
import Button from "@shared/components/Button";
import { FormField, Input } from "@shared/components/Input";
import { schemaConnexion } from "../schemas";

const ressorts = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };

const points = [
  {
    icone: GraduationCap,
    titre: "Ton binôme t'attend",
    texte: "Cadet ou Aîné : retrouve la personne qui fait avancer ton parcours.",
  },
  {
    icone: MessageSquareText,
    titre: "La conversation continue",
    texte: "Messagerie privée du binôme, familles et cercles au même endroit.",
  },
  {
    icone: CalendarCheck,
    titre: "Jamais une séance manquée",
    texte: "Rendez-vous confirmés et rappel 48 h avant, sans y penser.",
  },
];

/** Comptes seedés par `uv run manage.py seed_demo` (doc 21 §8) — un clic remplit le formulaire. */
const comptesDemo = [
  { email: "ivo.abdoul@emsp.int", role: "Cadet & Aîné — L2 Digitalisation" },
  { email: "awa.kouassi@emsp.int", role: "Aînée — L3 Réseaux" },
];

export default function ConnexionPage() {
  const { user, login, statut } = useAuth();
  const naviguer = useNavigate();
  const location = useLocation();
  const destination = location.state?.from ?? "/messagerie";

  const [champs, setChamps] = useState({ email: "", motDePasse: "" });
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);

  // Déjà connecté (ou auto-connexion démo) : pas de formulaire.
  if (statut === "authentifie" && user) {
    return <Navigate to={destination} replace />;
  }

  const poser = (champ) => (evenement) => {
    setChamps((c) => ({ ...c, [champ]: evenement.target.value }));
    setErreurs((e) => ({ ...e, [champ]: undefined }));
    setErreurServeur(null);
  };

  const remplirDemo = (email) => {
    setChamps({ email, motDePasse: "demo" });
    setErreurs({});
    setErreurServeur(null);
  };

  const soumettre = async (evenement) => {
    evenement.preventDefault();
    const analyse = schemaConnexion.safeParse(champs);
    if (!analyse.success) {
      const plat = {};
      // Zod v4 rapporte TOUTES les issues : la PREMIÈRE par champ est la plus
      // utile (requis > format > domaine) — jamais le message du refine sur un
      // champ vide.
      for (const probleme of analyse.error.issues) {
        if (plat[probleme.path[0]] === undefined) plat[probleme.path[0]] = probleme.message;
      }
      setErreurs(plat);
      return;
    }
    setEnCours(true);
    setErreurServeur(null);
    try {
      await authApi.connexion({ email: champs.email.trim(), password: champs.motDePasse });
      const utilisateur = await authApi.session();
      login(utilisateur);
      naviguer(destination, { replace: true });
    } catch (erreur) {
      setErreurServeur(
        erreur?.response?.status === 401
          ? (erreur.response.data?.detail ?? "E-mail ou mot de passe incorrect.")
          : "Connexion impossible pour le moment — réessaie dans un instant.",
      );
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_1fr]">
      {/* Panneau institutionnel — vert profond opaque + kente (jamais translucide).
          Recette annuaire (T1) : le motif vit sur une couche absolute DÉDIÉE —
          posé sur la section, opacity+mask masqueraient aussi le texte. */}
      <motion.section
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={ressorts}
        className="relative hidden overflow-hidden rounded-[var(--radius-panel)] bg-[var(--emsp-green-deep)] p-10 text-[var(--emsp-cream)] lg:flex lg:flex-col"
        aria-label="À propos du parrainage EMSP"
      >
        <div className="kente-pattern absolute inset-0" aria-hidden="true" />
        <div className="relative flex-1">
          <p className="text-sm font-semibold text-[var(--emsp-gold)]">École Multinationale des Postes</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight">
            Le parrainage qui va
            <br />
            au bout du parcours.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--emsp-cream)]/90">
            Cadets et Aînés de l'EMSP d'Abidjan : une mise en relation qui devient
            une vraie habitude de travail — séances, devoirs, conseils de filière.
          </p>

          <ul className="mt-10 flex flex-col gap-6">
            {points.map(({ icone: Icone, titre, texte }, index) => (
              <motion.li
                key={titre}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...ressorts, delay: 0.15 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-chip)] bg-[var(--emsp-gold)] text-[#16281c]">
                  <Icone size={20} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{titre}</span>
                  <span className="mt-0.5 block text-sm text-[var(--emsp-cream)]/80">{texte}</span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative mt-10 border-t border-white/15 pt-5 text-xs font-semibold text-[var(--emsp-cream)]/85">
          Plateforme interne — réservée aux comptes @emsp.int.
        </p>
      </motion.section>

      {/* Formulaire — Card crème opaque, pleine hauteur. */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ressorts, delay: 0.08 }}
        className="flex"
      >
        <div className="flex w-full flex-col rounded-[var(--radius-panel)] border border-[var(--border-structural)] bg-[var(--bg-panel)] p-8 shadow-[var(--shadow-card)] lg:justify-center lg:p-10">
          <div className="mb-8 lg:hidden">
            <p className="text-xs font-semibold text-[var(--accent-gold)]">École Multinationale des Postes</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-[var(--text-primary)]">
              Le parrainage qui va au bout du parcours.
            </h1>
          </div>

          <p className="text-sm font-semibold text-[var(--accent-gold)]">Connexion</p>
          <h2 className="mt-1 font-display text-3xl font-bold text-[var(--text-primary)]">
            Entre dans ton espace.
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Une seule adresse : ton e-mail institutionnel @emsp.int.
          </p>

          {erreurServeur && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-[var(--radius-chip)] border border-[#b42318]/30 bg-[#b42318]/5 px-4 py-3 text-sm text-[#b42318]"
            >
              <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {erreurServeur}
            </motion.div>
          )}

          <form onSubmit={soumettre} noValidate className="mt-6 flex flex-col gap-5">
            <FormField label="E-mail institutionnel" htmlFor="connexion-email" required error={erreurs.email}>
              <Input
                id="connexion-email"
                type="email"
                autoComplete="email"
                placeholder="prenom.nom@emsp.int"
                value={champs.email}
                onChange={poser("email")}
                invalid={Boolean(erreurs.email)}
                leadingIcon={AtSign}
              />
            </FormField>

            <FormField label="Mot de passe" htmlFor="connexion-mot-de-passe" required error={erreurs.motDePasse}>
              <Input
                id="connexion-mot-de-passe"
                type={motDePasseVisible ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Ton mot de passe"
                value={champs.motDePasse}
                onChange={poser("motDePasse")}
                invalid={Boolean(erreurs.motDePasse)}
                leadingIcon={KeyRound}
                trailingSlot={
                  <button
                    type="button"
                    onClick={() => setMotDePasseVisible((v) => !v)}
                    aria-label={motDePasseVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    {motDePasseVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                }
              />
            </FormField>

            <Button type="submit" size="lg" loading={enCours} icon={LogIn} className="mt-1 w-full justify-center">
              Se connecter
            </Button>
          </form>

          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel-alt)] p-4">
            <p className="text-xs font-bold text-[var(--text-primary)]">Comptes de démonstration</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Un clic remplit le formulaire (mot de passe <code className="font-mono">demo</code>).
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              {comptesDemo.map(({ email, role }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => remplirDemo(email)}
                  className="group flex flex-1 items-center justify-between gap-2 rounded-[var(--radius-chip)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-left transition-[border-color,box-shadow] hover:border-[var(--accent-gold)] hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span>
                    <span className="block text-xs font-bold text-[var(--text-primary)]">{email.split("@")[0]}</span>
                    <span className="block text-[11px] text-[var(--text-muted)]">{role}</span>
                  </span>
                  <MousePointerClick
                    size={15}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent-gold)]"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
