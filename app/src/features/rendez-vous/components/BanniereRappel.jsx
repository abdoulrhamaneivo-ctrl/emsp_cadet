import { motion } from "framer-motion";
import { CalendarClock, MapPin, Video, X } from "lucide-react";
import Button from "@shared/components/Button";
import Card from "@shared/components/Card";
import { useRappelVu } from "../hooks/useRendezVous";
import { ressortStandard } from "@shared/motion/variants";

/**
 * Bannière J-1 (doc 06 §6) : panneau or plein — lecture sur fond saturé =
 * encre foncée #16281c (leçon T1). Rendez-vous confirmé < 48h, fermable
 * (rappelVu persiste côté mock). Discret : une seule bannière, jamais bloquante.
 */
export default function BanniereRappel({ rdv }) {
  const marquerRappelVu = useRappelVu();
  if (!rdv) return null;

  const date = new Date(rdv.dateHeure);
  const dans = date.getTime() - Date.now();
  const heures = Math.floor(dans / 3600000);
  const minutes = Math.floor((dans % 3600000) / 60000);
  const quand = heures >= 1 ? `dans ${heures} h` : `dans ${minutes} min`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ressortStandard}
      role="status"
      className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6"
    >
      <Card className="flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-[#16281c]/20 bg-[var(--emsp-gold)] py-3 pl-4 pr-2">
        <CalendarClock size={20} aria-hidden="true" className="shrink-0 text-[#16281c]" />
        <p className="min-w-0 flex-1 text-sm font-medium text-[#16281c]">
          Rendez-vous {quand} — {rdv.titre}
          <span className="ml-2 inline-flex items-center gap-1 font-normal">
            {rdv.mode === "visio" ? (
              <>
                <Video size={13} aria-hidden="true" /> Visio
              </>
            ) : (
              <>
                <MapPin size={13} aria-hidden="true" /> {rdv.lieu}
              </>
            )}
          </span>
        </p>
        <div className="flex items-center gap-1.5">
          <Button size="sm" to="/rendez-vous">
            Voir le détail
          </Button>
          <button
            type="button"
            aria-label="Masquer ce rappel"
            onClick={() => marquerRappelVu.mutate({ id: rdv.id })}
            className="rounded-full p-1.5 text-[#16281c]/70 hover:bg-[#16281c]/10 hover:text-[#16281c]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
