import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Clock3, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { cx } from "@shared/utils/cx";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { useNavigate, useParams } from "react-router-dom";
import { authApi } from "@shared/api/auth";
import { useAuth } from "@app/providers/Auth";
import AuthExperienceLayout from "../components/AuthExperienceLayout";

/** Formulaire sécurisé de réinitialisation du mot de passe. */
export default function ReinitialiserMotDePassePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { uid, token } = useParams();
  const [form, setForm] = useState({ motDePasse: "", confirmerMdp: "" });
  const [etape, setEtape] = useState("verification");
  const [erreur, setErreur] = useState("");
  const [soumission, setSoumission] = useState(false);
  const [voirMdp, setVoirMdp] = useState(false);
  const [nouvelleVerification, setNouvelleVerification] = useState(0);

  useEffect(() => {
    if (!uid || !token) {
      setEtape("invalide");
      return undefined;
    }

    let actif = true;
    setErreur("");
    setEtape("verification");
    authApi.verifierLienReinitialisation({ uid, token })
      .then(() => {
        if (actif) setEtape("formulaire");
      })
      .catch((error) => {
        if (!actif) return;
        if (error?.response?.status === 400) {
          setEtape("invalide");
        } else {
          setErreur(
            error?.response?.status === 429
              ? "Trop de vérifications rapprochées. Patiente quelques minutes avant de réessayer."
              : "Nous ne pouvons pas vérifier ce lien pour le moment. Réessaie dans un instant.",
          );
          setEtape("verificationErreur");
        }
      });

    return () => { actif = false; };
  }, [uid, token, nouvelleVerification]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    if (!form.motDePasse || form.motDePasse.length < 8) {
      setErreur("Utilise au moins 8 caractères.");
      return;
    }
    if (form.motDePasse !== form.confirmerMdp) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (!uid || !token) {
      setErreur("Ce lien est invalide ou expiré. Demande-en un nouveau.");
      return;
    }

    setSoumission(true);
    try {
      await authApi.reinitialiserMotDePasse({ uid, token, password: form.motDePasse });
      await authApi.deconnexion().catch(() => {});
      logout();
      setEtape("succes");
    } catch (error) {
      const detail = error?.response?.data?.detail;
      if (typeof detail === "string" && error?.response?.status === 400 && detail.includes("invalide")) {
        setEtape("invalide");
      } else {
        setErreur(typeof detail === "string" ? detail : "Le lien n'est plus valide. Demande un nouveau lien de réinitialisation.");
      }
    } finally {
      setSoumission(false);
    }
  }

  if (!uid || !token || etape === "invalide") {
    return (
      <AuthExperienceLayout
        eyebrow="LIEN À RENOUVELER"
        storyTitle="On reprend la dernière étape ensemble."
        storyText="Les liens de sécurité sont temporaires. Tu peux demander un nouveau lien et poursuivre sans recommencer ton parcours EMSP Connect."
        image="/images/emsp/atelier.webp"
        imageAlt="Une activité de travail en groupe à l'EMSP"
        highlights={[
          { icon: Clock3, title: "Liens temporaires", text: "Un nouveau lien reste valide pendant une durée limitée." },
          { icon: ShieldCheck, title: "Compte protégé", text: "Le mot de passe ne change qu'après validation du lien." },
        ]}
        caption="Un lien expiré ne modifie pas ton compte."
        actionLabel="Besoin d'un nouveau lien ?"
        actionText="Faire une demande"
        actionTo="/mot-de-passe-oublie"
      >
        <Card className="w-full p-6 text-center sm:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff2bf] text-[#805900]">
            <AlertCircle size={25} aria-hidden="true" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#8a6200]">Sécurité du compte</p>
          <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">Lien invalide ou expiré</h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Ce lien n'est plus utilisable. Demande-en un nouveau pour définir ton mot de passe.
          </p>
          <Button className="mt-6 w-full" size="lg" icon={KeyRound} onClick={() => navigate("/mot-de-passe-oublie")}>
            Demander un nouveau lien
          </Button>
        </Card>
      </AuthExperienceLayout>
    );
  }

  const termine = etape === "succes";
  const verification = etape === "verification";
  const verificationErreur = etape === "verificationErreur";

  return (
    <AuthExperienceLayout
      eyebrow={termine ? "MOT DE PASSE MIS À JOUR" : verification ? "VÉRIFICATION DU LIEN" : "NOUVEAU MOT DE PASSE"}
      storyTitle={termine ? "Tu peux reprendre ton parcours." : verification ? "On vérifie ton lien de sécurité." : "Choisis une clé solide pour ton espace."}
      storyText={termine
        ? "La sécurité de ton compte a été actualisée. Connecte-toi et retrouve ta communauté EMSP."
        : verification
          ? "On contrôle que le lien est encore valide avant de te laisser modifier ton mot de passe."
          : "Le lien t'a conduit ici pour remplacer ton ancien mot de passe. Quelques règles simples protègent ton compte."}
      image="/images/emsp/atelier.webp"
      imageAlt="Des étudiants de l'EMSP travaillent ensemble"
      highlights={termine ? [
        { icon: CheckCircle, title: "Changement confirmé", text: "Ton nouveau mot de passe est actif." },
        { icon: ShieldCheck, title: "Sessions protégées", text: "Les anciennes sessions ont été révoquées." },
      ] : verification ? [
        { icon: ShieldCheck, title: "Contrôle sécurisé", text: "Le mot de passe ne changera qu'après validation du lien." },
        { icon: Clock3, title: "Lien temporaire", text: "Les liens de réinitialisation expirent après une heure." },
      ] : [
        { icon: KeyRound, title: "Au moins 8 caractères", text: "Une phrase longue est facile à retenir et difficile à deviner." },
        { icon: ShieldCheck, title: "Ne le réutilise pas", text: "Choisis un mot de passe différent de celui de ta boîte e-mail." },
      ]}
      caption="Ton compte EMSP Connect reste sous ton contrôle."
    >
      <Card className="p-6 sm:p-8">
        <div className="mb-6 border-b border-[var(--border-soft)] pb-5">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2bf] text-[#805900]">
            {termine ? <CheckCircle size={23} aria-hidden="true" /> : <KeyRound size={23} aria-hidden="true" />}
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--accent-green)]">Sécurité du compte</p>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            {termine ? "C'est fait !" : "Crée ton nouveau mot de passe"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            {termine
              ? "Ton mot de passe a été mis à jour."
              : verification
                ? "Vérification du lien en cours…"
                : verificationErreur
                  ? erreur
                  : "Choisis un mot de passe unique que tu pourras retenir."}
          </p>
        </div>

        {verification && (
          <div role="status" className="flex items-center justify-center gap-3 rounded-xl bg-[#f4f7f1] p-4 text-sm text-[var(--text-muted)]">
            <Loader2 size={19} className="animate-spin text-[var(--accent-green)]" aria-hidden="true" />
            Vérification sécurisée de ton lien…
          </div>
        )}

        {verificationErreur && (
          <div className="space-y-4">
            <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#e6bd62] bg-[#fff8e7] p-3.5 text-sm leading-relaxed text-[#704b00]">
              <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{erreur}</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => setNouvelleVerification((n) => n + 1)}>
              Réessayer la vérification
            </Button>
          </div>
        )}

        {etape === "formulaire" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {erreur && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#d98f86] bg-[#fff0ee] p-3.5 text-sm text-[#8b2d25]">
                <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{erreur}</span>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-xl bg-[#f4f7f1] px-3.5 py-3 text-xs text-[var(--text-muted)]">
              <ShieldCheck size={15} className="shrink-0 text-[#0b7a3b]" aria-hidden="true" />
              Le lien est personnel et expire après une heure.
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Nouveau mot de passe <span className="text-[#8b2d25]">*</span></span>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                <Input
                  type={voirMdp ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="8 caractères minimum"
                  value={form.motDePasse}
                  onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                  className={cx("w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none", erreur ? "border-[#d98f86]" : "border-[var(--border-soft)]")}
                  disabled={soumission}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVoirMdp(!voirMdp)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  aria-label={voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {voirMdp ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span className="text-xs text-[var(--text-muted)]">Évite les mots de passe courants ou contenant ton nom ou ton adresse e-mail.</span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Confirmer le mot de passe <span className="text-[#8b2d25]">*</span></span>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                <Input
                  type={voirMdp ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Répète le mot de passe"
                  value={form.confirmerMdp}
                  onChange={(e) => setForm({ ...form, confirmerMdp: e.target.value })}
                  className={cx("w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none", erreur ? "border-[#d98f86]" : "border-[var(--border-soft)]")}
                  disabled={soumission}
                  required
                />
              </div>
              {form.confirmerMdp && (
                <span className={cx("text-xs font-medium", form.confirmerMdp === form.motDePasse ? "text-[#187144]" : "text-[#8b2d25]")}>
                  {form.confirmerMdp === form.motDePasse ? "Les mots de passe correspondent." : "Les mots de passe ne correspondent pas encore."}
                </span>
              )}
            </label>

            <Button type="submit" size="lg" loading={soumission} icon={ShieldCheck} className="w-full justify-center">
              Mettre à jour le mot de passe
            </Button>
          </form>
        ) : termine ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-2 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7f4e9] text-[#147443]"
            >
              <CheckCircle size={34} aria-hidden="true" />
            </motion.div>
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Mot de passe mis à jour !</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">
              Tu peux maintenant te connecter avec ton nouveau mot de passe.
            </p>
            <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/connexion")}>
              Se connecter à EMSP Connect
            </Button>
          </motion.div>
        ) : null}
        {verification && <p role="status" className="sr-only">Vérification du lien de réinitialisation en cours</p>}
      </Card>
    </AuthExperienceLayout>
  );
}
