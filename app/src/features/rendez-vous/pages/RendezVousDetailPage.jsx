import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, MapPin, Video } from "lucide-react";
import Button from "@shared/components/Button";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import EmptyState from "@shared/components/EmptyState";
import ConfirmDialog from "@shared/components/ConfirmDialog";
import { useAuth } from "@app/providers/Auth";
import { peutRepondre } from "../rules";
import { useAnnulerRdv, useRepondreRdv, useRendezVousDetail } from "../hooks/useRendezVous";
import FormulaireContreProposition from "../components/FormulaireContreProposition";
import { pageTransition } from "@shared/motion/variants";

const TONS = { propose: "info", confirme: "success", refuse: "danger", contre_propose: "gold", annule: "neutral", passe: "neutral" };
const LIBELLES = { propose: "Proposition", confirme: "Confirmé", refuse: "Refusé", contre_propose: "Contre-proposition", annule: "Annulé", passe: "Passé" };

/**
 * /rendez-vous/:rdvId (doc 06 §5) — détail + actions de la machine à états.
 * La matrice peutRepondre (doc 06 §9 n°3) décide qui peut agir et pourquoi.
 */
export default function RendezVousDetailPage() {
  const { rdvId } = useParams();
  const { user } = useAuth();
  const naviguer = useNavigate();
  const [contreOuverte, setContreOuverte] = useState(false);
  const [annulationOuverte, setAnnulationOuverte] = useState(false);
  const repondre = useRepondreRdv();
  const annuler = useAnnulerRdv();
  const { data: rdv, isPending } = useRendezVousDetail(rdvId);

  if (isPending) {
    return <Card className="p-6 text-center text-sm text-[var(--text-muted)]">Chargement…</Card>;
  }
  if (!rdv) {
    return (
      <Card className="p-6">
        <EmptyState
          title="Rendez-vous introuvable"
          description="Ce rendez-vous n'existe pas ou tu n'en fais pas partie."
        >
          <Button to="/rendez-vous" variant="ghost">Retour aux rendez-vous</Button>
        </EmptyState>
      </Card>
    );
  }

  const date = new Date(rdv.dateHeure);
  const verdict = peutRepondre(rdv, user);

  return (
    <motion.div {...pageTransition} className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => naviguer(-1)}
          aria-label="Retour"
          className="rounded-full border border-white/15 p-2 text-[var(--emsp-cream)] hover:bg-white/10"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <p className="text-xs font-medium text-[var(--emsp-cream)]/90">
          {rdv.organisateurMoi
            ? "Organisé par toi"
            : `Proposé par ${rdv.organisateur.prenom} ${rdv.organisateur.nom}`}
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">{rdv.titre}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <CalendarDays size={15} aria-hidden="true" />
              <span className="tabular-nums">
                {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {" · "}
                {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              {rdv.mode === "visio" ? (
                <span className="inline-flex items-center gap-1.5">
                  <Video size={15} aria-hidden="true" /> Visio
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} aria-hidden="true" /> {rdv.lieu}
                </span>
              )}
            </p>
          </div>
          <Chip tone={TONS[rdv.statut] ?? "neutral"}>{LIBELLES[rdv.statut] ?? rdv.statut}</Chip>
        </div>

        {rdv.description && (
          <p className="mt-4 border-t border-[var(--border-soft)] pt-3 text-sm leading-relaxed text-[var(--text-primary)]">
            {rdv.description}
          </p>
        )}

        {rdv.contreProposition && (
          <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--emsp-gold)] bg-[var(--emsp-gold)]/10 p-3.5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Créneau alternatif proposé</p>
            <p className="mt-1 text-sm text-[var(--text-muted)] tabular-nums">
              {new Date(rdv.contreProposition.dateHeure).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              {" · "}
              {new Date(rdv.contreProposition.dateHeure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              {" — "}
              {rdv.contreProposition.lieu}
            </p>
            {verdict.ok && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => repondre.mutate({ id: rdv.id, decision: "confirme" })}>
                  Confirmer ce créneau
                </Button>
                <Button size="sm" variant="ghost" onClick={() => repondre.mutate({ id: rdv.id, decision: "refuse" })}>
                  Refuser
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-[var(--border-soft)] pt-4">
          {!user ? (
            <p className="text-sm text-[var(--text-muted)]">Session inconnue.</p>
          ) : verdict.ok ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => repondre.mutate({ id: rdv.id, decision: "confirme" })}>Confirmer</Button>
              <Button variant="ghost" onClick={() => setContreOuverte(true)}>Proposer un autre créneau</Button>
              <Button variant="danger" onClick={() => setAnnulationOuverte(true)}>Refuser / Annuler</Button>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">{verdict.raison}</p>
          )}
        </div>
      </Card>

      <FormulaireContreProposition rdv={rdv} open={contreOuverte} onClose={() => setContreOuverte(false)} />
      <ConfirmDialog
        open={annulationOuverte}
        onClose={() => setAnnulationOuverte(false)}
        tone="danger"
        title="Annuler ce rendez-vous ?"
        message="Le créneau sera libéré — l'autre personne le verra comme annulé."
        confirmLabel="Annuler le rendez-vous"
        onConfirm={() => {
          annuler.mutate({ id: rdv.id });
          setAnnulationOuverte(false);
        }}
      />
    </motion.div>
  );
}

