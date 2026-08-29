import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Modal from "@shared/components/Modal";
import Button from "@shared/components/Button";
import { SkeletonCard } from "@shared/components/Skeleton";
import { useAuth } from "@app/providers/Auth";
import {
  useBasculeCandidature,
  useEnvoyerPhoto,
  useModifierProfil,
  useMoi,
  useSupprimerCompte,
  useVisibilite,
} from "../hooks/useProfil";
import { schemaIdentite } from "../schemas";
import SectionIdentite from "../components/SectionIdentite";
import SectionAcademique from "../components/SectionAcademique";
import SectionCandidatureAine from "../components/SectionCandidatureAine";
import SectionVitrineAine from "../components/SectionVitrineAine";
import PipelineCompletude from "../components/PipelineCompletude";
import SectionIntention from "../components/SectionIntention";
import ZoneDanger from "../components/ZoneDanger";

/**
 * /profil (doc 11 §4) — vitrine ET centre de contrôle des casquettes.
 * Sauvegarde explicite (bouton sticky si dirty, JAMAIS d'autosave) ; bascule
 * RG8 via modales de conséquences ; ZoneDanger collapsée en bas.
 */
export default function ProfilePage() {
  const { logout } = useAuth();
  const { data: moiCharge, isLoading } = useMoi();
  const { data: visibilite } = useVisibilite();
  const [form, setForm] = useState(null); // null = reflète le serveur
  const [basculeDemandee, setBasculeDemandee] = useState(null); // true|false|null
  const modifier = useModifierProfil();
  const basculer = useBasculeCandidature();
  const photo = useEnvoyerPhoto();
  const supprimer = useSupprimerCompte(logout);

  // Le formulaire local (dirty) ou le serveur — useMemo pour référence stable.
  const moi = useMemo(() => {
    if (form) return form;
    if (!moiCharge) return null;
    return {
      ...moiCharge,
      ambitions: moiCharge.ambitions ?? [],
      projets: moiCharge.projets ?? [],
      pointsForts: moiCharge.pointsForts ?? [],
      pointsFaibles: moiCharge.pointsFaibles ?? [],
    };
  }, [form, moiCharge]);

  if (isLoading || !moi) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const surChamp = (champ, valeur) => setForm({ ...moi, [champ]: valeur });

  const dirty = Boolean(form);
  const enregistrer = () => {
    const payload = {
      prenom: moi.prenom,
      nom: moi.nom,
      classe: moi.classe,
      filiere: moi.filiere,
      niveauEtude: moi.niveauEtude,
      attentes: moi.attentes,
      ambitions: (moi.ambitions ?? []).map((s) => s.trim()).filter(Boolean),
      projets: (moi.projets ?? []).map((s) => s.trim()).filter(Boolean),
      pointsForts: (moi.pointsForts ?? []).map((s) => s.trim()).filter(Boolean),
      pointsFaibles: (moi.pointsFaibles ?? []).map((s) => s.trim()).filter(Boolean),
    };
    const resultat = schemaIdentite.safeParse(payload);
    if (!resultat.success) {
      // Le message 422 le plus parlant reste celui du serveur (RG7 francisé) ;
      // ici on bloque avant le réseau pour les longueurs.
      modifier.mutate(payload);
      return;
    }
    modifier.mutate(payload, {
      onSuccess: () => setForm(null), // resynchronisé → non-dirty
    });
  };

  const demanderBascule = (ouverte) => {
    if (ouverte === moi.candidatureAineOuverte) return;
    setBasculeDemandee(ouverte); // modale de conséquences d'abord
  };

  const confirmerBascule = () => {
    basculer.mutate(basculeDemandee, { onSettled: () => setBasculeDemandee(null) });
  };

  return (
    <div className="flex flex-col gap-5 pb-16">
      <header>
        <p className="text-xs font-semibold text-[var(--emsp-gold)]">Ton espace personnel</p>
        <h1 className="font-display text-2xl font-bold text-[var(--emsp-cream)]">Mon profil</h1>
        <p className="mt-0.5 text-sm text-[var(--emsp-cream)]/90">
          Ta vitrine et ton interrupteur de visibilité — tout ce que voient les autres.
        </p>
      </header>

      <PipelineCompletude visibilite={visibilite} />

      <SectionIdentite
        moi={moi}
        surPrenom={(valeur) => surChamp("prenom", valeur)}
        surNom={(valeur) => surChamp("nom", valeur)}
        surPhoto={(fichier) => photo.mutate(fichier)}
        chargementPhoto={photo.isPending}
      />

      <SectionAcademique moi={moi} surChamp={surChamp} />

      <SectionCandidatureAine
        ouvert={moi.candidatureAineOuverte}
        niveau={moi.niveauEtude}
        surBascule={demanderBascule}
      />

      <SectionVitrineAine moi={moi} surChamp={surChamp} />

      {(moi.niveauEtude === "L3" || moi.niveauEtude === "M2") && (
        <SectionIntention
          valeur={moi.intentionAnneeSuivante ?? "inconnu"}
          niveau={moi.niveauEtude}
          surChamp={(v) => surChamp("intentionAnneeSuivante", v)}
        />
      )}

      <ZoneDanger
        prenom={moi.prenom}
        surSupprimer={() => supprimer.mutate(moi.prenom)}
        chargement={supprimer.isPending}
      />

      {/* Sauvegarde explicite (doc 11 §5) : bouton sticky quand le form est dirty */}
      {dirty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-0 bottom-16 z-30 flex justify-center px-4 lg:bottom-6"
        >
          <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] px-4 py-2.5 shadow-[var(--shadow-panel)]">
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Modifications non enregistrées
            </span>
            <Button variant="ghost" size="sm" onClick={() => setForm(null)} disabled={modifier.isPending}>
              Annuler
            </Button>
            <Button size="sm" onClick={enregistrer} loading={modifier.isPending}>
              Enregistrer
            </Button>
          </div>
        </motion.div>
      )}

      {/* Modale de conséquences RG8 (doc 11 §4) — activation ET désactivation */}
      <Modal
        open={basculeDemandee === true}
        onClose={() => setBasculeDemandee(null)}
        title="Ouvrir ta candidature Aîné ?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setBasculeDemandee(null)}>
              Pas maintenant
            </Button>
            <Button onClick={confirmerBascule} loading={basculer.isPending}>
              Ouvrir ma candidature
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)]">
          Ton profil deviendra visible dans l'annuaire dès qu'il est complet. Tu pourras
          accueillir des cadets — jusqu'à ton quota. Fermer la candidature plus tard ne
          cassera jamais les binômes en cours.
        </p>
      </Modal>
      <Modal
        open={basculeDemandee === false}
        onClose={() => setBasculeDemandee(null)}
        title="Fermer ta candidature Aîné ?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setBasculeDemandee(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmerBascule} loading={basculer.isPending}>
              Fermer ma candidature
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)]">
          Tes cadets actifs restent accompagnés. Tu disparais simplement de l'annuaire et
          tu ne reçois plus de nouvelles demandes.
        </p>
      </Modal>
    </div>
  );
}
