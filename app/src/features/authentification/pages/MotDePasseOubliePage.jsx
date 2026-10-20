import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, AtSign, CheckCircle2, Clock3, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { FormField, Input } from "@shared/components/Input";
import { authApi } from "@shared/api/auth";
import AuthExperienceLayout from "../components/AuthExperienceLayout";

/** Demande de réinitialisation de mot de passe par e-mail. */
export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [etape, setEtape] = useState("demande");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    if (!email.trim()) {
      setErreur("Saisis l'adresse e-mail associée à ton compte.");
      return;
    }

    setEnvoi(true);
    try {
      await authApi.demanderReinitialisation(email.trim());
      setEtape("envoye");
    } catch (error) {
      const status = error?.response?.status;
      setErreur(
        status === 429
          ? "Trop de demandes rapprochées. Patiente quelques minutes avant de réessayer."
          : "L'envoi n'a pas abouti. Vérifie ta connexion puis réessaie. Si le problème continue, contacte le support.",
      );
    } finally {
      setEnvoi(false);
    }
  }

  const envoye = etape === "envoye";

  return (
    <AuthExperienceLayout
      eyebrow={envoye ? "TON LIEN EST EN ROUTE" : "RÉCUPÉRATION DE COMPTE"}
      storyTitle={envoye ? "On t'aide à retrouver ton espace." : "Ton parcours peut reprendre."}
      storyText={envoye
        ? "Le lien de réinitialisation a été demandé. Garde cette page ouverte pendant que tu consultes ta boîte e-mail."
        : "Quelques secondes suffisent pour recevoir un lien sécurisé et retrouver l'accès à ton compte EMSP Connect."}
      image="/images/emsp/mentorat.webp"
      imageAlt="Un moment d'échange entre étudiants et aînés de l'EMSP"
      highlights={envoye ? [
        { icon: MailCheck, title: "Regarde dans ta boîte", text: "Vérifie aussi les courriers indésirables et l'onglet Promotions." },
        { icon: Clock3, title: "Le lien est temporaire", text: "Pour ta sécurité, il expire après une heure." },
      ] : [
        { icon: ShieldCheck, title: "Demande confidentielle", text: "La réponse ne révèle pas si une adresse possède un compte." },
        { icon: Clock3, title: "Lien à durée limitée", text: "Le lien reçu expire après une heure." },
      ]}
      caption="Ton compte reste protégé à chaque étape."
      actionLabel="Tu as retrouvé ton mot de passe ?"
      actionText="Connexion"
    >
      <Card className="overflow-hidden p-6 sm:p-8">
        <div className="mb-6 border-b border-[var(--border-soft)] pb-5">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2bf] text-[#805900]">
            {envoye ? <MailCheck size={23} aria-hidden="true" /> : <KeyRound size={23} aria-hidden="true" />}
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--accent-green)]">Compte EMSP Connect</p>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] sm:text-[1.75rem]">
            {envoye ? "Vérifie ta boîte e-mail" : "On te renvoie un accès"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            {envoye
              ? "Si cette adresse correspond à un compte, tu recevras les instructions de réinitialisation."
              : "Entre l'adresse liée à ton compte. Nous t'enverrons un lien pour choisir un nouveau mot de passe."}
          </p>
        </div>

        {envoye ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-start gap-3 rounded-2xl border border-[#b7dec3] bg-[#eff8f1] p-4">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#187144]" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-[#17452c]">Demande prise en compte</p>
                <p className="mt-1 break-all text-sm text-[#456454]">{email.trim()}</p>
              </div>
            </div>
            <ol className="space-y-3">
              {[
                "Ouvre le message envoyé par EMSP Connect.",
                "Clique sur le lien de réinitialisation dans l'heure.",
                "Choisis un mot de passe que tu n'utilises pas ailleurs.",
              ].map((texte, index) => (
                <li key={texte} className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e5f0e7] text-xs font-bold text-[#075b2b]">{index + 1}</span>
                  {texte}
                </li>
              ))}
            </ol>
            <Button size="lg" className="w-full" onClick={() => setEtape("demande")}>Renvoyer ou changer d'adresse</Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {erreur && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#e6bd62] bg-[#fff8e7] p-3.5 text-sm leading-relaxed text-[#704b00]">
                <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{erreur}</span>
              </div>
            )}

            <FormField label="Adresse e-mail" htmlFor="mot-de-passe-oublie-email" required>
              <Input
                id="mot-de-passe-oublie-email"
                type="email"
                autoComplete="email"
                placeholder="prenom.nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={envoi}
                leadingIcon={AtSign}
              />
            </FormField>

            <Button type="submit" size="lg" loading={envoi} icon={MailCheck} className="w-full justify-center">
              Envoyer le lien sécurisé
            </Button>

            <div className="flex items-start gap-2 rounded-xl bg-[#f4f7f1] px-3.5 py-3 text-xs leading-relaxed text-[var(--text-muted)]">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#0b7a3b]" aria-hidden="true" />
              <p>Pour protéger les comptes, le message de confirmation reste identique quelle que soit l'adresse saisie.</p>
            </div>
          </form>
        )}

        <p className="mt-6 border-t border-[var(--border-soft)] pt-4 text-center text-sm text-[var(--text-muted)]">
          Tu te souviens ? <Link to="/connexion" className="font-semibold text-[var(--accent-green)] hover:underline">Retour à la connexion</Link>
        </p>
      </Card>
    </AuthExperienceLayout>
  );
}
