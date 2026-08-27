import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkle, Rocket, Send, Info } from "lucide-react";
import { toast } from "sonner";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import Button from "@shared/components/Button";
import Avatar from "@shared/components/Avatar";
import Modal from "@shared/components/Modal";
import ConfirmDialog from "@shared/components/ConfirmDialog";
import JaugeCapacite from "@shared/components/JaugeCapacite";
import ScoreFiabilite from "@shared/components/ScoreFiabilite";
import EmptyState from "@shared/components/EmptyState";
import ScrollReveal from "@shared/motion/ScrollReveal";
import { SkeletonCard } from "@shared/components/Skeleton";
import { useAuth } from "@app/providers/Auth";
import { useParrain, useMonParrainage, useEnvoyerDemande, useAnnulerDemande } from "../hooks/useParrains";
import { canRequest } from "../rules";

const MAX_MESSAGE = 300;

/** Bloc de section de la fiche (ambitions, projets, forts, faibles). */
function Bloc({ titre, children }) {
  return (
    <ScrollReveal>
      <section className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-card)] md:p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{titre}</h2>
        <div className="mt-3">{children}</div>
      </section>
    </ScrollReveal>
  );
}

/**
 * /annuaire/:parrainId — fiche détaillée d'un Aîné (doc 04 §5) :
 * header vert profond, 4 blocs staggerés au scroll, encart CTA sticky
 * piloté par rules.canRequest (RG1/RG3), modale de demande de parrainage.
 */
export default function FicheAinePage() {
  const { parrainId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: aine, isPending, isError } = useParrain(parrainId);
  const { data: monParrainage } = useMonParrainage();

  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmationAnnulation, setConfirmationAnnulation] = useState(false);

  const envoyer = useEnvoyerDemande();
  const annuler = useAnnulerDemande();

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <SkeletonCard className="h-44" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </div>
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !aine) {
    return (
      <section className="rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--bg-panel)] shadow-[var(--shadow-panel)]">
        <EmptyState
          icon={Info}
          title="Cet Aîné n'existe plus ou est complet"
          description="Son profil n'est plus visible dans l'annuaire."
          actionLabel="Retour à l'annuaire"
          onAction={() => navigate("/annuaire")}
        />
      </section>
    );
  }

  const verdict = canRequest(aine, monParrainage);
  const consultationAdmin = user?.isAdmin === true;
  const demandeEnAttente = monParrainage?.demandeEnAttente ?? null;

  const soumettre = () => {
    envoyer.mutate(
      { parrainId: aine.id, message: message.trim() },
      {
        onSuccess: () => {
          toast.success(`Demande envoyée à ${aine.prenom} !`);
          setModaleOuverte(false);
          setMessage("");
          navigate("/mes-demandes");
        },
        onError: (erreur) => {
          toast.error(erreur?.response?.data?.detail ?? "Impossible d'envoyer la demande. Réessaie.");
          setModaleOuverte(false);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/annuaire"
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Retour annuaire
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Colonne principale */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* FicheHeader — panel vert profond (doc 04 §5) */}
          <header className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--emsp-green-deep)] p-6 shadow-[var(--shadow-panel)] md:p-8">
            <div className="kente-band" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-5">
              <Avatar prenom={aine.prenom} nom={aine.nom} photoUrl={aine.photoUrl} id={aine.id} size="xl" />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--emsp-cream)] lg:text-3xl">
                  {aine.prenom} {aine.nom}
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--emsp-cream)]/80">
                  <span>{aine.filiere}</span>
                  <span aria-hidden="true">·</span>
                  <span>{aine.classe}</span>
                  {estAlumniChip(aine)}
                </p>
                <div className="mt-3">
                  <ScoreFiabilite score={aine.scoreFiabilite} nbAvis={aine.nbAvis} detail fond="fonce" />
                </div>
              </div>
            </div>
            {(aine.badges?.length ?? 0) > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--emsp-cream)]/15 pt-4">
                {aine.badges.map((badge) => (
                  <Chip key={badge.code} tone="gold" title={`Obtenu le ${badge.dateObtention}`}>
                    {badge.libelle}
                  </Chip>
                ))}
              </div>
            )}
          </header>

          <Bloc titre="Ambitions">
            <ul className="flex flex-col gap-2.5">
              {aine.ambitions?.map((ambition) => (
                <li key={ambition} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                  <Sparkle size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--emsp-gold)]" />
                  {ambition}
                </li>
              ))}
            </ul>
          </Bloc>

          <Bloc titre="Projets">
            {aine.projets?.length ? (
              <ul className="flex flex-col gap-2.5">
                {aine.projets.map((projet) => (
                  <li key={projet} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                    <Rocket size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--accent-green)]" />
                    {projet}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Aucun projet partagé pour le moment.</p>
            )}
          </Bloc>

          <Bloc titre="Points forts">
            <div className="flex flex-wrap gap-2">
              {aine.pointsForts?.map((force) => (
                <Chip key={force} tone="success">{force}</Chip>
              ))}
            </div>
          </Bloc>

          <Bloc titre="Points faibles">
            <ul className="flex flex-col gap-2">
              {aine.pointsFaibles?.map((faiblesse) => (
                <li key={faiblesse} className="text-sm text-[var(--text-muted)]">
                  {faiblesse}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Assumés par l'Aîné lui-même — la transparence fait partie de la vitrine.
            </p>
          </Bloc>
        </div>

        {/* Encart CTA — panneau signature : header or + corps vert profond (barre designer) */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <aside>
          <Card accent className="overflow-hidden p-0">
            <div className="border-b border-[var(--emsp-gold)]/30 bg-[var(--acc-gold-soft)] px-6 py-4">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Parrainage</h2>
            </div>
            <div className="bg-[var(--emsp-green-deep)] p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-[var(--emsp-cream)]/80">Capacité d'accueil</span>
                  <JaugeCapacite actifs={aine.nbCadetsActifs} className="[&>span:last-child]:text-[var(--emsp-cream)]/70" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-[var(--emsp-cream)]/80">Fiabilité</span>
                  <ScoreFiabilite score={aine.scoreFiabilite} nbAvis={aine.nbAvis} fond="fonce" />
                </div>
              </div>

              <div className="mt-5 border-t border-[var(--emsp-cream)]/15 pt-5">
                {verdict.code === "ok" && !consultationAdmin && (
                  <>
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={Send}
                      className="w-full"
                      onClick={() => setModaleOuverte(true)}
                    >
                      Demander ce parrain
                    </Button>
                    <p className="mt-3 text-xs text-[var(--emsp-cream)]/60">
                      Réponse généralement sous quelques jours.
                    </p>
                  </>
                )}

                {consultationAdmin && (
                  <>
                    <Chip tone="info">Consultation administrateur</Chip>
                    <p className="mt-3 text-xs text-[var(--emsp-cream)]/60">
                      Les demandes de parrainage se font depuis un compte étudiant.
                    </p>
                  </>
                )}

                {verdict.code === "deja_engage" && (
                  <>
                    <Chip tone="success">Déjà accompagné(e)</Chip>
                    <p className="mt-3 text-sm text-[var(--emsp-cream)]/75">{verdict.raison}</p>
                    <Link
                      to="/mon-parrainage"
                      className="mt-3 inline-block text-sm font-semibold text-[var(--emsp-gold)] underline-offset-2 hover:underline"
                    >
                      Voir mon parrainage
                    </Link>
                  </>
                )}

                {verdict.code === "attente" && demandeEnAttente && (
                  <>
                    <Chip tone="info">Demande envoyée</Chip>
                    <p className="mt-3 text-sm text-[var(--emsp-cream)]/75">
                      Ta demande est en attente de réponse de {demandeEnAttente.aine?.prenom ?? "l'Aîné"}.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-3 w-full"
                      loading={annuler.isPending}
                      onClick={() => setConfirmationAnnulation(true)}
                    >
                      Annuler ma demande
                    </Button>
                  </>
                )}

                {verdict.code === "plein" && (
                  <>
                    <Chip tone="gold">Complet 5/5</Chip>
                    <p className="mt-3 text-sm text-[var(--emsp-cream)]/75">{verdict.raison}</p>
                  </>
                )}
              </div>
            </div>
          </Card>
          </aside>

          {/* Encart « Comment ça marche » — la colonne droite n'est jamais vide (barre designer) */}
          <Card accent className="p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Comment ça marche
            </h3>
            <ol className="mt-3 flex flex-col gap-2.5">
              {[
                "Choisis ton Aîné dans l'annuaire.",
                "Envoie ta demande avec un petit message.",
                "Il accepte, refuse ou demande plus d'infos.",
                "Accepté : vous formez un binôme pendant 6 mois.",
              ].map((etape, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--acc-gold-soft)] font-mono text-[11px] font-bold text-[var(--accent-gold)]">
                    {i + 1}
                  </span>
                  {etape}
                </li>
              ))}
            </ol>
            <p className="mt-3 border-t border-[var(--border-soft)] pt-3 text-xs text-[var(--text-muted)]">
              Tu ne peux avoir qu'un seul Aîné actif à la fois (RG1).
            </p>
          </Card>
        </div>
      </div>

      {/* Modale de demande (doc 04 §5 flux) */}
      <Modal
        open={modaleOuverte}
        onClose={() => setModaleOuverte(false)}
        title={`Demander ${aine.prenom} comme Aîné ?`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setModaleOuverte(false)} disabled={envoyer.isPending}>
              Annuler
            </Button>
            <Button variant="primary" icon={Send} loading={envoyer.isPending} onClick={soumettre}>
              Envoyer la demande
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)]">
          Tu ne peux avoir qu'un seul Aîné actif à la fois (RG1). Ta demande reste visible par{" "}
          {aine.prenom} jusqu'à acceptation ou refus — une demande en attente bloque les autres.
        </p>
        <label htmlFor="message-demande" className="text-sm font-semibold text-[var(--text-primary)]">
          Message (facultatif)
        </label>
        <textarea
          id="message-demande"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
          rows={4}
          placeholder="Présente-toi en deux lignes : ta filière, ce que tu cherches…"
          className="w-full rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-green)] focus:outline-none focus:ring-2 focus:ring-[var(--emsp-green-luminous)]/20"
        />
        <p className="text-right font-mono text-xs text-[var(--text-muted)]">
          {message.length}/{MAX_MESSAGE}
        </p>
      </Modal>

      {/* Annulation d'une demande en attente */}
      <ConfirmDialog
        open={confirmationAnnulation}
        onClose={() => setConfirmationAnnulation(false)}
        title="Annuler ma demande ?"
        message="Ta demande en attente sera retirée. Tu pourras en envoyer une nouvelle ensuite."
        confirmLabel="Annuler la demande"
        tone="danger"
        loading={annuler.isPending}
        onConfirm={() => {
          annuler.mutate(demandeEnAttente.id, {
            onSuccess: () => {
              toast.success("Demande annulée.");
              setConfirmationAnnulation(false);
            },
            onError: () => toast.error("Impossible d'annuler. Réessaie."),
          });
        }}
      />
    </div>
  );
}

/** Chip alumni (RG10) rendu dans le header sombre. */
function estAlumniChip(aine) {
  if (aine.niveauEtude !== "alumni") return null;
  return (
    <span className="inline-flex items-center rounded-[var(--radius-chip)] bg-[var(--emsp-gold)] px-2 py-0.5 text-[10px] font-bold text-[#16281c]">
      Alumni · Promo {aine.anneePromotion}
    </span>
  );
}
