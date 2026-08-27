import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import Avatar from "@shared/components/Avatar";
import JaugeCapacite from "@shared/components/JaugeCapacite";
import ScoreFiabilite from "@shared/components/ScoreFiabilite";
import { estComplet, estAlumni, estDernierePlace } from "../rules";
import { cx } from "@shared/utils/cx";

/**
 * Carte Aîné de l'annuaire (doc 04 §4 anatomy, ~210px) :
 * identité + score · ambition tronquée · points forts (3 max) · jauge RG2 + lien.
 * Liseré or + hover-lift renforcé (barre designer-senior). Complète (RG3) :
 * grisée bordure dashed, chip or COMPLET, non cliquable.
 */
export default function CarteAine({ aine }) {
  const complet = estComplet(aine);
  const alumni = estAlumni(aine);

  const corps = (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-start gap-3">
        <Avatar
          prenom={aine.prenom}
          nom={aine.nom}
          photoUrl={aine.photoUrl}
          id={aine.id}
          size="lg"
          className="ring-2 ring-[var(--bg-panel-alt)]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-lg font-semibold leading-snug text-[var(--text-primary)]">
              {aine.prenom} {aine.nom}
            </h3>
            {complet ? (
              <Chip tone="gold">Complet</Chip>
            ) : (
              estDernierePlace(aine) && <Chip tone="goldSoft">Dernière place</Chip>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-[var(--text-muted)]">
            {aine.filiere} · {aine.classe}
          </p>
          <div className="mt-1.5">
            <ScoreFiabilite score={aine.scoreFiabilite} nbAvis={aine.nbAvis} />
          </div>
        </div>
      </div>

      {alumni && (
        <p className="mt-3">
          <Chip tone="goldSoft">Alumni · Promo {aine.anneePromotion}</Chip>
        </p>
      )}

      {/* Citation — bloc flex-1 stylé (filet or) : comble le creux, l'espace devient intentionnel */}
      <div className="mt-3 min-h-0 flex-1">
        <p className="line-clamp-2 break-words border-l-2 border-[var(--emsp-gold)] pl-3 text-sm italic leading-relaxed text-[var(--text-primary)]/90">
          «&nbsp;{(aine.ambitions?.[0] ?? "Vitrine en cours de complétion.").replace(/\.$/, "")}&nbsp;…&nbsp;»
        </p>
      </div>

      {(aine.pointsForts?.length ?? 0) > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {aine.pointsForts.slice(0, 3).map((force) => (
            <Chip key={force} tone="neutral">{force}</Chip>
          ))}
          {aine.pointsForts.length > 3 && (
            <span className="font-mono text-xs text-[var(--text-muted)]">+{aine.pointsForts.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-soft)] pt-3">
        <JaugeCapacite actifs={aine.nbCadetsActifs} />
        <span
          className={cx(
            "inline-flex items-center gap-1 text-sm font-semibold",
            complet ? "text-[var(--text-muted)]" : "text-[var(--accent-green)]",
          )}
        >
          Voir <ArrowRight size={15} aria-hidden="true" />
        </span>
      </div>
    </div>
  );

  if (complet) {
    return <Card className="border-dashed opacity-75">{corps}</Card>;
  }

  return (
    <motion.div className="h-full min-w-0" whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <Link
        to={`/annuaire/${aine.id}`}
        className="block h-full rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)] focus-visible:ring-offset-2"
      >
        <Card interactive accent className="h-full">
          {corps}
        </Card>
      </Link>
    </motion.div>
  );
}
