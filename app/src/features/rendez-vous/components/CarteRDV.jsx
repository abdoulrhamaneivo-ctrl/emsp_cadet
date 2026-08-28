import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Video } from "lucide-react";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import { staggerItem } from "@shared/motion/variants";

const TONS = {
  propose: "info",
  confirme: "success",
  refuse: "danger",
  contre_propose: "gold",
  annule: "neutral",
  passe: "neutral",
};

const LIBELLES = {
  propose: "Proposition",
  confirme: "Confirmé",
  refuse: "Refusé",
  contre_propose: "Contre-proposition",
  annule: "Annulé",
  passe: "Passé",
};

/** Carte compacte de liste (doc 06 §4) — chip statut coloré, date fr, lieu/visio. */
export default function CarteRDV({ rdv }) {
  const date = new Date(rdv.dateHeure);
  const annule = rdv.statut === "annule";

  return (
    <motion.div variants={staggerItem}>
      <Link to={`/rendez-vous/${rdv.id}`} className="block min-w-0">
        <Card interactive className={annule ? "opacity-70" : undefined}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`font-display text-base font-bold text-[var(--text-primary)] ${annule ? "line-through" : ""}`}>
                {rdv.titre}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                <CalendarDays size={14} aria-hidden="true" />
                <span className="tabular-nums">
                  {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
                  {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                {rdv.mode === "visio" ? (
                  <>
                    <Video size={14} aria-hidden="true" /> Visio
                  </>
                ) : (
                  <>
                    <MapPin size={14} aria-hidden="true" /> {rdv.lieu}
                  </>
                )}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {rdv.organisateurMoi ? "Organisé par toi" : `Organisé par ${rdv.organisateur.prenom} ${rdv.organisateur.nom}`}
              </p>
            </div>
            <Chip tone={TONS[rdv.statut] ?? "neutral"}>{LIBELLES[rdv.statut] ?? rdv.statut}</Chip>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
