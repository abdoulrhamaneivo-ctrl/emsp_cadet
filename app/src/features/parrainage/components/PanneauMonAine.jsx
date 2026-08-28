import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarClock, Compass, MessageCircle } from "lucide-react";
import Button from "@shared/components/Button";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import Avatar from "@shared/components/Avatar";
import EmptyState from "@shared/components/EmptyState";
import ScoreFiabilite from "@shared/components/ScoreFiabilite";
import { ressortStandard } from "@shared/motion/variants";
import { useMesRendezVous } from "../hooks/useDemandes";
import { formatteurMoisAnnee, formatteurDateHeure } from "../utils/dates";

/**
 * PANNEAU MON AÎNÉ — facette cadette (doc 05 §5).
 * Actif : identité + note + actions binôme + aperçu RDV.
 * Vide : EmptyState Compass « Trouve ton Aîné ».
 */
export default function PanneauMonAine({ monAine }) {
  const naviguer = useNavigate();
  const { data: dataRdv } = useMesRendezVous();
  const rdvProchain = dataRdv?.results?.[0];
  const aine = monAine?.autre;

  if (!aine) {
    return (
      <Card className="flex min-h-[280px] flex-col justify-center p-6">
        <EmptyState
          icon={Compass}
          title="Pas encore d'Aîné"
          description="L'annuaire présente les Aînés ouverts à l'accompagnement — choisis celui qui te correspond."
          actionLabel="Vers l'annuaire"
          onAction={() => naviguer("/annuaire")}
        />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold text-[var(--accent-gold)]">TON AÎNÉ</p>
          <div className="mt-2 flex items-center gap-3.5">
            <Avatar prenom={aine.prenom} nom={aine.nom} id={aine.id} size="xl" />
            <div>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {aine.prenom} {aine.nom}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {aine.classe} · {aine.filiere}
              </p>
            </div>
          </div>
        </div>
        <ScoreFiabilite score={aine.scoreFiabilite} nbAvis={aine.nbAvis ?? 0} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-[var(--border-soft)] py-3 text-sm text-[var(--text-muted)]">
        <span>Binôme depuis {formatteurMoisAnnee(monAine.dateDebut)}</span>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--border-structural)]" />
        <span>Accompagnement en cours</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="sm" to="/messagerie">
          <MessageCircle size={15} aria-hidden="true" className="mr-1.5" />
          Messagerie
        </Button>
        <Button variant="outline" size="sm" to="/rendez-vous">
          <CalendarClock size={15} aria-hidden="true" className="mr-1.5" />
          Rendez-vous
        </Button>
      </div>

      {rdvProchain && (
        <motion.div
          transition={ressortStandard}
          className="rounded-[var(--radius-panel)] bg-[var(--bg-panel-alt)] p-4"
        >
          <p className="text-xs font-semibold text-[var(--accent-gold)]">Prochain rendez-vous</p>
          <p className="mt-1 font-semibold text-[var(--text-primary)]">{rdvProchain.titre}</p>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            {formatteurDateHeure(rdvProchain.dateHeure)} · {rdvProchain.lieu} ·{" "}
            {rdvProchain.mode === "presentiel" ? "En présentiel" : "En visio"}
          </p>
        </motion.div>
      )}

      {monAine.avisDonne === false && (
        <Chip tone="goldSoft">Revue du binôme à donner en fin d'accompagnement</Chip>
      )}
    </Card>
  );
}
