import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, GraduationCap, ShieldCheck, UsersRound } from "lucide-react";
import { cx } from "@shared/utils/cx";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@shared/api/auth";
import AuthExperienceLayout from "../components/AuthExperienceLayout";

/**
 * Page Inscription — P03 (doc 02 §4, doc 16 §4).
 * Création de compte avec une adresse e-mail valide (casquettes).
 */
export default function InscriptionPage() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(1); // 1: email, 2: profil, 3: casquettes, 4: succès
  const [form, setForm] = useState({
    email: "",
    prenom: "",
    nom: "",
    classe: "",
    filiere: "",
    matricule: "",
    promotion: "",
    carteEtudiant: null,
    motDePasse: "",
    confirmerMdp: "",
    casquette: null, // "cadet" | "aine"
    acceptConditions: false,
  });
  const [erreurs, setErreurs] = useState({});
  const [soumission, setSoumission] = useState(false);
  const [voirMdp, setVoirMdp] = useState(false);
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);
  const [messageRenvoi, setMessageRenvoi] = useState("");

  const CLASSES = [
    "L1", "L2", "L3", "M1", "M2"
  ];

  const FILIERES = [
    "Réseaux & Télécoms", "Informatique", "Gestion", "Marketing", "Finance"
  ];

  function validerEtape1() {
    const erreurs = {};
    if (!form.email.trim()) erreurs.email = "Adresse e-mail requise";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      erreurs.email = "Adresse e-mail invalide";
    }
    setErreurs(erreurs);
    return Object.keys(erreurs).length === 0;
  }

  function validerEtape2() {
    const erreurs = {};
    if (!form.prenom.trim()) erreurs.prenom = "Prénom requis";
    if (!form.nom.trim()) erreurs.nom = "Nom requis";
    if (!form.classe) erreurs.classe = "Choisis ta classe";
    if (!form.filiere) erreurs.filiere = "Choisis ta filière";
    const matricule = form.matricule.replace(/[^a-z0-9]/gi, "");
    if (matricule.length < 4 || !/\d/.test(matricule)) {
      erreurs.matricule = "Saisis le matricule inscrit sur ta carte";
    }
    const annee = Number(form.promotion);
    if (!/^\d{4}$/.test(form.promotion) || annee < 2000 || annee > new Date().getFullYear()) {
      erreurs.promotion = "Indique ton année d'entrée à l'EMSP";
    }
    if (!form.carteEtudiant) erreurs.carteEtudiant = "Ajoute une photo lisible de ta carte étudiante";
    else if (form.carteEtudiant.type && !/^image\/(jpeg|png)$/.test(form.carteEtudiant.type)) {
      erreurs.carteEtudiant = "Choisis une image JPEG ou PNG";
    } else if (form.carteEtudiant.size > 5 * 1024 * 1024) {
      erreurs.carteEtudiant = "La carte doit faire 5 Mo maximum";
    }
    if (!form.motDePasse) erreurs.motDePasse = "Mot de passe requis";
    else if (form.motDePasse.length < 8) erreurs.motDePasse = "Au moins 8 caractères";
    if (form.motDePasse !== form.confirmerMdp) erreurs.confirmerMdp = "Les mots de passe ne correspondent pas";
    setErreurs(erreurs);
    return Object.keys(erreurs).length === 0;
  }

  function validerEtape3() {
    const erreurs = {};
    if (!form.casquette) erreurs.casquette = "Choisis ton rôle (cadet ou aîné)";
    if (!form.acceptConditions) erreurs.acceptConditions = "Tu dois accepter les conditions";
    setErreurs(erreurs);
    return Object.keys(erreurs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (etape === 1 && !validerEtape1()) return;
    if (etape === 2 && !validerEtape2()) return;
    if (etape === 3 && !validerEtape3()) return;

    if (etape < 3) {
      setEtape(etape + 1);
      return;
    }

    setSoumission(true);
    try {
      const dossier = new FormData();
      dossier.append("email", form.email.trim().toLowerCase());
      dossier.append("prenom", form.prenom.trim());
      dossier.append("nom", form.nom.trim());
      dossier.append("classe", form.classe);
      dossier.append("filiere", form.filiere);
      dossier.append("matricule", form.matricule);
      dossier.append("promotion", form.promotion);
      dossier.append("carteEtudiant", form.carteEtudiant);
      dossier.append("password", form.motDePasse);
      dossier.append("casquette", form.casquette);
      dossier.append("acceptConditions", String(form.acceptConditions));
      await authApi.inscription(dossier);
      setEtape(4);
    } catch (erreur) {
      const detail = erreur?.response?.data?.detail ?? erreur?.response?.data;
      const premier = detail && typeof detail === "object"
        ? Object.values(detail).flat()[0]
        : detail;
      setErreurs({ global: typeof premier === "string" ? premier : "Inscription impossible — vérifie les informations et réessaie." });
    } finally {
      setSoumission(false);
    }
  }

  async function renvoyerConfirmation() {
    setRenvoiEnCours(true);
    setMessageRenvoi("");
    try {
      const resultat = await authApi.renvoyerConfirmation(form.email.trim());
      setMessageRenvoi(resultat.detail);
    } catch (erreur) {
      setMessageRenvoi(erreur?.response?.data?.detail ?? "Envoi impossible pour le moment. Réessaie plus tard.");
    } finally {
      setRenvoiEnCours(false);
    }
  }

  function handleBack() {
    if (etape > 1) setEtape(etape - 1);
  }

  const etapes = [
    { num: 1, label: "Email" },
    { num: 2, label: "Profil" },
    { num: 3, label: "Rôle" },
    { num: 4, label: "Vérification" },
  ];

  const histoires = {
    1: {
      eyebrow: "BIENVENUE À L'EMSP",
      title: "Le réseau de ta promo continue ici.",
      text: "Crée ton espace pour retrouver les autres promotions, échanger et construire un parrainage qui dure.",
      image: "/images/emsp/cadets-en-cours.webp",
      alt: "Des étudiants de l'EMSP réunis en cours",
      highlights: [
        { icon: Mail, title: "Commence par ton e-mail", text: "On l'utilise pour confirmer ton adresse et te tenir au courant." },
        { icon: ShieldCheck, title: "Accès après vérification", text: "L'administration valide les dossiers étudiants avant l'accès." },
      ],
      caption: "Les liens entre promotions commencent par une rencontre.",
    },
    2: {
      eyebrow: "TON PROFIL ÉTUDIANT",
      title: "On vérifie que chaque compte représente une vraie personne.",
      text: "Tes informations de scolarité et ta carte permettent à l'équipe de prévenir les doublons et de confirmer ta promotion.",
      image: "/images/emsp/mentorat.webp",
      alt: "Une rencontre entre étudiants et aînés de l'EMSP",
      highlights: [
        { icon: ShieldCheck, title: "Justificatif réservé à l'équipe", text: "Ta carte est visible uniquement par l'administration pour la vérification." },
        { icon: GraduationCap, title: "Promotion et matricule", text: "Renseigne-les comme ils apparaissent sur tes documents scolaires." },
      ],
      caption: "Une communauté fiable commence par des profils vérifiés.",
    },
    3: {
      eyebrow: "TON RÔLE DANS LE RÉSEAU",
      title: "Tu peux apprendre, transmettre, ou faire les deux.",
      text: "Choisis la casquette qui correspond à ton parcours aujourd'hui. Tu pourras faire évoluer ton profil ensuite.",
      image: "/images/emsp/rencontre.webp",
      alt: "Une promotion d'étudiants de l'EMSP réunie lors d'une rencontre",
      highlights: [
        { icon: UsersRound, title: "Cadet", text: "Trouve un aîné qui connaît déjà les prochaines étapes." },
        { icon: GraduationCap, title: "Aîné", text: "Partage ton expérience et accompagne un cadet." },
      ],
      caption: "Chaque promotion a quelque chose à transmettre.",
    },
    4: {
      eyebrow: "DERNIÈRE ÉTAPE",
      title: "Ton dossier est parti. On garde le lien.",
      text: "Confirme ton adresse e-mail. L'équipe EMSP vérifiera ensuite ta carte et les informations de ton profil.",
      image: "/images/emsp/evenement.webp",
      alt: "Une activité de la communauté EMSP",
      highlights: [
        { icon: Mail, title: "Confirme ton adresse", text: "Le lien arrive dans ta boîte de réception, parfois dans les courriers indésirables." },
        { icon: ShieldCheck, title: "Validation par l'école", text: "Tu pourras te connecter après la confirmation et l'examen du dossier." },
      ],
      caption: "À bientôt dans la communauté EMSP Connect.",
    },
  };
  const histoire = histoires[etape];

  return (
    <AuthExperienceLayout
      eyebrow={histoire.eyebrow}
      storyTitle={histoire.title}
      storyText={histoire.text}
      image={histoire.image}
      imageAlt={histoire.alt}
      highlights={histoire.highlights}
      caption={histoire.caption}
      actionLabel="Déjà membre ?"
      actionText="Connexion"
    >
        <div className="w-full">
          {/* Indicateur d'étapes */}
          <div className="relative mb-5 px-1">
            <div className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 bg-[var(--border-soft)]" aria-hidden="true">
              <div
                className="h-full bg-[var(--emsp-gold)] transition-[width] duration-300"
                style={{ width: `${((etape - 1) / (etapes.length - 1)) * 100}%` }}
              />
            </div>
            <ol aria-label="Progression de l'inscription" className="relative flex items-start justify-between">
              {etapes.map((e, i) => (
                <li key={e.num} aria-current={etape === e.num ? "step" : undefined} className="flex flex-col items-center">
                  <div
                    className={cx(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      i + 1 < etape
                        ? "bg-[var(--emsp-gold)] text-[var(--emsp-green-deep)]"
                        : i + 1 === etape
                        ? "bg-[var(--emsp-cream)]/10 border-2 border-[var(--emsp-gold)] text-[var(--emsp-gold)]"
                        : "bg-[var(--bg-input)] border-2 border-[var(--border-soft)] text-[var(--text-muted)]"
                    )}
                  >
                    {i + 1 < etape ? <CheckCircle size={16} /> : e.num}
                  </div>
                  <span className="mt-1 text-xs text-[var(--text-muted)] text-center w-20">{e.label}</span>
                </li>
              ))}
            </ol>
          </div>

          <Card className="p-6 sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--accent-green)]">Étape {etape} sur 4</p>
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                {etape === 1 ? "Créer ton compte" : etape === 2 ? "Ton profil" : etape === 3 ? "Ton rôle" : "C'est fait !"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {etape === 1 ? "Utilise une adresse e-mail valide" : etape === 2 ? "Infos étudiantes et justificatif confidentiel" : etape === 3 ? "Cadet = cherche un aîné / Aîné = aide un cadet" : "Ton dossier attend sa validation"}
              </p>
            </div>

            {etape === 4 ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="mx-auto mb-4 rounded-full bg-[var(--emsp-cream)]/10 p-3"
                >
                  <CheckCircle size={48} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                </motion.div>
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Dossier envoyé</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Confirme ton adresse avec le lien envoyé à <strong>{form.email}</strong>. L'administration comparera ensuite ton nom, ta classe, ta promotion et ton matricule à la carte étudiante. Tu pourras te connecter après validation.
                </p>
                <button type="button" onClick={renvoyerConfirmation} disabled={renvoiEnCours} className="mt-4 text-sm font-semibold text-[var(--accent-green)] hover:underline disabled:opacity-60">
                  {renvoiEnCours ? "Envoi…" : "Renvoyer l’e-mail de confirmation"}
                </button>
                {messageRenvoi && <p role="status" className="mt-2 text-xs text-[var(--text-muted)]">{messageRenvoi}</p>}
                <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/connexion")}>
                  Aller à la connexion
                </Button>
              </div>
            ) : (
              <form id="inscription-form" onSubmit={handleSubmit} className="space-y-4">
                {erreurs.global && (
                  <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#d98f86] bg-[#fff0ee] p-3.5 text-sm text-[#8b2d25]">
                    <AlertCircle size={16} aria-hidden="true" />
                    {erreurs.global}
                  </div>
                )}

                {etape === 1 && (
                  <>
                    <div className="space-y-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Adresse e-mail *</span>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                          <input
                            type="email"
                            autoComplete="email"
                            placeholder="prenom.nom@exemple.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className={cx(
                              "w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.email ? "border-[#d98f86]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          />
                        </div>
                        {erreurs.email && <p className="text-xs text-[#8b2d25]">{erreurs.email}</p>}
                      </label>
                    </div>
                  </>
                )}

                {etape === 2 && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">Prénom *</span>
                          <input
                            type="text"
                            autoComplete="given-name"
                            placeholder="Prénom"
                            value={form.prenom}
                            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                            className={cx(
                              "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.prenom ? "border-[#d98f86]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          />
                          {erreurs.prenom && <p className="text-xs text-[#8b2d25]">{erreurs.prenom}</p>}
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">Nom *</span>
                          <input
                            type="text"
                            autoComplete="family-name"
                            placeholder="Nom"
                            value={form.nom}
                            onChange={(e) => setForm({ ...form, nom: e.target.value })}
                            className={cx(
                              "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.nom ? "border-[#d98f86]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          />
                          {erreurs.nom && <p className="text-xs text-[#8b2d25]">{erreurs.nom}</p>}
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">Classe *</span>
                          <select
                            value={form.classe}
                            onChange={(e) => setForm({ ...form, classe: e.target.value })}
                            className={cx(
                              "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.classe ? "border-[#d98f86]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          >
                            <option value="">Choisis ta classe</option>
                            {CLASSES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          {erreurs.classe && <p className="text-xs text-[#8b2d25]">{erreurs.classe}</p>}
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[var(--text-muted)]">Filière *</span>
                          <select
                            value={form.filiere}
                            onChange={(e) => setForm({ ...form, filiere: e.target.value })}
                            className={cx(
                              "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.filiere ? "border-[#d98f86]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          >
                            <option value="">Choisis ta filière</option>
                            {FILIERES.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                          {erreurs.filiere && <p className="text-xs text-[#8b2d25]">{erreurs.filiere}</p>}
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Matricule étudiant *</span>
                        <input
                          type="text"
                          autoComplete="off"
                          maxLength={40}
                          placeholder="Ex. EMSP2024001"
                          value={form.matricule}
                          onChange={(e) => setForm({ ...form, matricule: e.target.value })}
                          className={cx(
                            "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                            erreurs.matricule ? "border-[#d98f86]" : "border-[var(--border-soft)]"
                          )}
                          disabled={soumission}
                          required
                        />
                        {erreurs.matricule && <p className="text-xs text-[#8b2d25]">{erreurs.matricule}</p>}
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Année d'entrée / promotion *</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="2000"
                          max={new Date().getFullYear()}
                          placeholder="2024"
                          value={form.promotion}
                          onChange={(e) => setForm({ ...form, promotion: e.target.value })}
                          className={cx(
                            "rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                            erreurs.promotion ? "border-[#d98f86]" : "border-[var(--border-soft)]"
                          )}
                          disabled={soumission}
                          required
                        />
                        {erreurs.promotion && <p className="text-xs text-[#8b2d25]">{erreurs.promotion}</p>}
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Carte étudiante (recto lisible) *</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                          onChange={(e) => setForm({ ...form, carteEtudiant: e.target.files?.[0] ?? null })}
                          className="block w-full rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--emsp-cream)]/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--emsp-gold)]"
                          disabled={soumission}
                        />
                        <span className="text-xs text-[var(--text-muted)]">
                          Image JPEG ou PNG, 5 Mo maximum. Seule l'administration peut la consulter. Après décision, l'accès est retiré et sa suppression est demandée.
                        </span>
                        {form.carteEtudiant && <span className="text-xs text-[var(--text-muted)]">Fichier choisi : {form.carteEtudiant.name}</span>}
                        {erreurs.carteEtudiant && <p className="text-xs text-[#8b2d25]">{erreurs.carteEtudiant}</p>}
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Mot de passe *</span>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                          <input
                            type={voirMdp ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="8 caractères minimum"
                            value={form.motDePasse}
                            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
                            className={cx(
                              "w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.motDePasse ? "border-[#d98f86]" : "border-[var(--border-soft)]"
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
                        {erreurs.motDePasse && <p className="text-xs text-[#8b2d25]">{erreurs.motDePasse}</p>}
                        <p className="text-xs text-[var(--text-muted)]">Évite un mot de passe courant ou contenant ton nom ou ton adresse e-mail.</p>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Confirmer le mot de passe *</span>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                          <input
                            type={voirMdp ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Répète le mot de passe"
                            value={form.confirmerMdp}
                            onChange={(e) => setForm({ ...form, confirmerMdp: e.target.value })}
                            className={cx(
                              "w-full rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-10 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--emsp-gold)] focus:outline-none",
                              erreurs.confirmerMdp ? "border-[#d98f86]" : "border-[var(--border-soft)]"
                            )}
                            disabled={soumission}
                            required
                          />
                        </div>
                        {erreurs.confirmerMdp && <p className="text-xs text-[#8b2d25]">{erreurs.confirmerMdp}</p>}
                      </label>
                    </div>
                  </>
                )}

                {etape === 3 && (
                  <>
                    <div className="space-y-4">
                      <p className="text-sm text-[var(--text-muted)]">
                        <strong>Cadet :</strong> tu cherches un aîné (promo qui devance la tienne).<br />
                        <strong>Aîné :</strong> tu accompagnes un cadet (tu es L2+).
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => { setForm({ ...form, casquette: "cadet" }); setErreurs({ ...erreurs, casquette: undefined }); }}
                          className={cx(
                            "p-4 rounded-[var(--radius-card)] border-2 text-left transition-all",
                            form.casquette === "cadet"
                              ? "border-[var(--emsp-gold)] bg-[var(--emsp-gold)]/5 shadow-[0_0_0_2px_var(--emsp-gold)]"
                              : "border-[var(--border-soft)] hover:border-[var(--emsp-gold)]/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 rounded-full bg-[var(--emsp-cream)]/10 p-2">
                              <Sparkles size={20} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[var(--text-primary)]">Je suis Cadet</h3>
                              <p className="text-xs text-[var(--text-muted)]">Je cherche mon aîné</p>
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setForm({ ...form, casquette: "aine" }); setErreurs({ ...erreurs, casquette: undefined }); }}
                          className={cx(
                            "p-4 rounded-[var(--radius-card)] border-2 text-left transition-all",
                            form.casquette === "aine"
                              ? "border-[var(--emsp-gold)] bg-[var(--emsp-gold)]/5 shadow-[0_0_0_2px_var(--emsp-gold)]"
                              : "border-[var(--border-soft)] hover:border-[var(--emsp-gold)]/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 rounded-full bg-[var(--emsp-cream)]/10 p-2">
                              <Sparkles size={20} className="text-[var(--emsp-gold)]" aria-hidden="true" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-[var(--text-primary)]">Je suis Aîné</h3>
                              <p className="text-xs text-[var(--text-muted)]">J'accompagne un cadet (L2+)</p>
                            </div>
                          </div>
                        </button>
                      </div>
                      {erreurs.casquette && <p className="text-xs text-[#8b2d25]">{erreurs.casquette}</p>}

                      <label className="flex items-start gap-3 rounded-[var(--radius-input)] border bg-[var(--bg-input)] px-3 py-3">
                        <input
                          type="checkbox"
                          checked={form.acceptConditions}
                          onChange={(e) => setForm({ ...form, acceptConditions: e.target.checked })}
                          className="mt-1 w-4 h-4 rounded border-[var(--border-soft)] text-[var(--emsp-gold)] focus:ring-[var(--emsp-gold)]"
                          required
                        />
                        <div className="text-sm text-[var(--text-muted)]">
                          Je confirme que les informations fournies sont exactes et j'autorise l'administration à les vérifier à partir de ma carte étudiante. J'accepte les conditions d'utilisation et la politique de confidentialité.
                          {erreurs.acceptConditions && <p className="text-xs text-[#8b2d25] mt-1">{erreurs.acceptConditions}</p>}
                        </div>
                      </label>
                    </div>
                  </>
                )}
              </form>
            )}

            {etape < 4 && (
              <div className="mt-6 flex gap-3">
                {etape > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack} disabled={soumission} className="flex-1">
                    Retour
                  </Button>
                )}
                <Button type="submit" form="inscription-form" size="lg" loading={soumission} className="flex-1">
                  {etape === 1 ? "Continuer" : etape === 2 ? "Continuer" : "Envoyer mon dossier"}
                </Button>
              </div>
            )}
          </Card>

          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            Déjà un compte ? <Link to="/connexion" className="text-[var(--accent-green)] hover:underline font-medium">Connexion</Link>
          </p>
        </div>
    </AuthExperienceLayout>
  );
}
