import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarClock, MessageCircle, SendHorizonal, Ban, XCircle, Hourglass } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import Chip from "@shared/components/Chip";
import Avatar from "@shared/components/Avatar";
import { staggerItem } from "@shared/motion/variants";
import { formatteurDate } from "../utils/dates";

const STEPS = {
  en_attente: {
    icon: Hourglass,
    chip: { tone: "gold", children: "En attente de réponse" },
    suite: "L'Aîné dispose de quelques jours pour répondre — tu recevras une notification.",
  },
  acceptee: {
    icon: MessageCircle,
    chip: { tone: "success", children: "Acceptée" },
    suite: "Retrouve la conversation dans la messagerie.",
  },
  refusee: {
    icon: XCircle,
    chip: { tone: "danger", children: "Refusée" },
  },
  annulee: {
    icon: Ban,
    chip: { tone: "neutral", children: "Annulée" },
  },
  terminee: {
    icon: SendHorizonal,
    chip: { tone: "neutral", children: "Terminée" },
  },
};

/**
 * Carte d'une demande ENVOYÉE — timeline de suivi (doc 05 §4).
 * En attente → action « Annuler » (ConfirmDialog côté page, RG1).
 */
export default function CarteDemandeEnvoyee({ demande, onAnnuler }) {
  const config = STEPS[demande.statut] ?? STEPS.en_attente;
  const ChipIcone = config.icon;
  const aine = demande.aine ?? {};

  return (
    <motion.div variants={staggerItem} className="min-w-0">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar prenom={aine.prenom ?? "?"} nom={aine.nom ?? ""} id={aine.id} size="md" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-[var(--text-primary)]">
                {aine.prenom} {aine.nom}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                {aine.classe} · {aine.filiere}
              </p>
            </div>
          </div>
          <Chip tone={config.chip.tone} className="shrink-0">
            <ChipIcone size={13} aria-hidden="true" className="mr-1" />
            {config.chip.children}
          </Chip>
        </div>

        {demande.motifRefus && (
          <div className="rounded-[var(--radius-chip)] bg-[#b42318]/8 px-3.5 py-2.5">
            <p className="text-xs font-medium text-[#b42318]">Motif du refus</p>
            <p className="mt-0.5 text-sm text-[var(--text-primary)]">{demande.motifRefus}</p>
          </div>
        )}

        <div className="border-t border-[var(--border-soft)] pt-4">
          {demande.statut === "en_attente" && onAnnuler ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[var(--text-muted)]">
                Envoyée le {formatteurDate(demande.dateDemande)} — annulable tant qu'elle attend une réponse.
              </p>
              <Button variant="ghost" size="sm" onClick={onAnnuler}>
                <Ban size={15} aria-hidden="true" className="mr-1.5" />
                Annuler
              </Button>
            </div>
          ) : (
            config.suite && (
              <p className="text-xs text-[var(--text-muted)]">{config.suite}</p>
            )
          )}
        </div>

        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <CalendarClock size={14} aria-hidden="true" />
          <span className="text-xs">
            {demande.statut === "en_attente"
              ? `Envoyée le ${formatteurDate(demande.dateDemande)}`
              : `Réponse le ${formatteurDate(demande.dateReponse ?? demande.dateDemande)}`}
          </span>
        </div>

        <Link
          to={`/annuaire/${aine.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-green)] hover:underline underline-offset-2"
        >
          Voir la fiche
        </Link>
      </Card>
    </motion.div>
  );
}
