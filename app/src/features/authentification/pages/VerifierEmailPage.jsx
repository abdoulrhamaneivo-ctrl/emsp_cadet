import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock3, Loader2, MailCheck, ShieldCheck, UsersRound } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "@shared/api/auth";
import AuthExperienceLayout from "../components/AuthExperienceLayout";

/** Vérifie le lien reçu par e-mail puis explique la suite du parcours. */
export default function VerifierEmailPage() {
  const navigate = useNavigate();
  const { uid, token } = useParams();
  const [etat, setEtat] = useState("verification");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!uid || !token) {
      setEtat("erreur");
      setMessage("Ce lien est incomplet ou invalide. Ouvre le lien depuis le dernier e-mail reçu.");
      return;
    }

    let actif = true;
    const verifier = async () => {
      setEtat("verification");
      try {
        const resultat = await authApi.verifierEmail(uid, token);
        if (!actif) return;
        setEtat("succes");
        setMessage(resultat.detail ?? "Ton adresse e-mail a été confirmée.");
      } catch (error) {
        if (!actif) return;
        setEtat("erreur");
        setMessage(error?.response?.data?.detail ?? "Ce lien n'est plus valide ou a déjà été utilisé.");
      }
    };
    verifier();
    return () => { actif = false; };
  }, [uid, token]);

  const enCours = etat === "verification";
  const succes = etat === "succes";

  return (
    <AuthExperienceLayout
      eyebrow={enCours ? "VÉRIFICATION EN COURS" : succes ? "ADRESSE CONFIRMÉE" : "VÉRIFICATION À REPRENDRE"}
      storyTitle={enCours
        ? "On vérifie ton adresse e-mail."
        : succes
          ? "Bienvenue dans le réseau EMSP."
          : "Le lien peut être renouvelé avec l'équipe."}
      storyText={enCours
        ? "On s'assure que le lien provient bien de ta boîte de réception et qu'il est encore valide."
        : succes
          ? "Ton adresse est confirmée. L'équipe EMSP examine ensuite les informations étudiantes de ton dossier."
          : "Un lien peut expirer ou avoir déjà été utilisé. Le support peut t'aider à relancer la vérification."}
      image="/images/emsp/evenement.webp"
      imageAlt="Des étudiants de l'EMSP réunis lors d'un événement"
      highlights={enCours ? [
        { icon: ShieldCheck, title: "Contrôle sécurisé", text: "Cette étape confirme que tu as accès à l'adresse e-mail." },
        { icon: Clock3, title: "Ça ne devrait pas durer", text: "Garde cet onglet ouvert pendant la vérification." },
      ] : succes ? [
        { icon: MailCheck, title: "E-mail confirmé", text: "La boîte liée à ton compte est maintenant vérifiée." },
        { icon: UsersRound, title: "Prochaine étape", text: "L'administration vérifie ton profil et ta carte étudiante." },
      ] : [
        { icon: Clock3, title: "Lien temporaire", text: "Les liens de confirmation ne restent actifs qu'un temps limité." },
        { icon: ShieldCheck, title: "Compte protégé", text: "Un lien expiré ne donne pas accès à ton compte." },
      ]}
      caption="Une communauté de confiance, promo après promo."
      actionLabel="Tu as déjà un compte ?"
      actionText="Connexion"
    >
      <Card className="overflow-hidden p-6 text-center sm:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff2bf] text-[#805900]">
          {enCours
            ? <Loader2 size={25} className="animate-spin" aria-hidden="true" />
            : succes
              ? <CheckCircle2 size={25} aria-hidden="true" />
              : <AlertCircle size={25} aria-hidden="true" />}
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--accent-green)]">E-mail EMSP Connect</p>
        <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          {enCours ? "Confirmation en cours" : succes ? "Ton adresse est confirmée" : "Lien invalide ou expiré"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
          {enCours ? "Nous validons le lien. Cela ne prend habituellement que quelques secondes." : message}
        </p>

        {succes && (
          <motion.ol initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3 rounded-2xl bg-[#f4f7f1] p-4 text-left">
            <li className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dceee0] text-xs font-bold text-[#075b2b]">1</span>
              Adresse e-mail confirmée
            </li>
            <li className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffedaa] text-xs font-bold text-[#705100]">2</span>
              Vérification de ton dossier par l'administration
            </li>
          </motion.ol>
        )}

        {!enCours && (
          <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/connexion")}>
            {succes ? "Continuer vers la connexion" : "Aller à la connexion"}
          </Button>
        )}
        {etat === "erreur" && (
          <Link to="/inscription" className="mt-4 inline-flex text-sm font-semibold text-[var(--accent-green)] hover:underline">
            Retour à l'inscription
          </Link>
        )}
        {enCours && <p role="status" className="sr-only">Vérification de l'adresse en cours</p>}
      </Card>
    </AuthExperienceLayout>
  );
}
