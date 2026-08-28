import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Card from "@shared/components/Card";
import Button from "@shared/components/Button";
import Chip from "@shared/components/Chip";
import Avatar from "@shared/components/Avatar";
import { staggerItem } from "@shared/motion/variants";
import { formatteurDate } from "../utils/dates";

/**
 * Carte d'une demande REÇUE — actions aîné (doc 05 §4).
 * `peutAccepter=false` (5/5 RG2) → bouton désactivé + chip or explicite.
 */
export default function CarteDemandeRecue({ demande, peutAccepter, onAccepter, onRefuser }) {
  const cadet = demande.cadet ?? {};

  return (
    <motion.div variants={staggerItem} className="min-w-0">
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar prenom={cadet.prenom ?? "?"} nom={cadet.nom ?? ""} id={cadet.id} size="md" />
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                {cadet.prenom} {cadet.nom}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {cadet.classe} · {cadet.filiere}
              </p>
            </div>
          </div>
          {!peutAccepter && <Chip tone="goldSoft">Complet — libère une place</Chip>}
        </div>

        {demande.message && (
          <blockquote className="rounded-[var(--radius-chip)] bg-[var(--bg-panel-alt)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]">
            « {demande.message} »
          </blockquote>
        )}

        <p className="text-xs text-[var(--text-muted)]">
          Reçue le {formatteurDate(demande.dateDemande)}
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm" disabled={!peutAccepter} onClick={onAccepter}>
            <MessageCircle size={15} aria-hidden="true" className="mr-1.5" />
            Accepter
          </Button>
          <Button variant="outline" size="sm" onClick={onRefuser}>
            Refuser
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
