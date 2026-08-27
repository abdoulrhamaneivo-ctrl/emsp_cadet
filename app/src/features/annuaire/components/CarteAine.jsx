import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Card from "@shared/components/Card";
import Chip from "@shared/components/Chip";
import Avatar from "@shared/components/Avatar";
import JaugeCapacite from "@shared/components/JaugeCapacite";
import ScoreFiabilite from "@shared/components/ScoreFiabilite";
import { estComplet, estAlumni, estDernierePlace } from "../rules";
import { cx } from "@shared/utils/cx";

/**
 * Carte Aîné de l'annuaire (doc 04 §4 anatomy, ~210px) :
 * identité (photo cerclée de blanc) + score · ambition tronquée · points
 * forts (3 max) · pied aligné jauge RG2 + lien. Complète (RG3) : grisée
 * bordure dashed, chip or COMPLET, non cliquable.
 */
export default function CarteAine({ aine, enVedette = false, raison = null }) {
  const complet = estComplet(aine);
  const alumni = estAlumni(aine);

  const corps = (
    <div className="flex h-full flex-col p-5">
      {/* Identité — photo cerclée de blanc : détache l'avatar du fond crème.
          Le nom n'est JAMAIS tronqué (donnée cardinale) ; les badges vivent
          sur la ligne méta, à suite du texte tronquable (filière = secondaire). */}
      <div className="flex items-start gap-3.5">
        <Avatar
          prenom={aine.prenom}
          nom={aine.nom}
          photoUrl={aine.photoUrl}
          id={aine.id}
          size="lg"
          className="shadow-[0_1px_4px_rgba(13,42,24,0.18)] ring-3 ring-white"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-[var(--text-primary)]">
            {aine.prenom} {aine.nom}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[var(--text-muted)]">
            <span className="truncate">{aine.filiere} · {aine.classe}</span>
            {complet && <Chip tone="gold">Complet</Chip>}
            {!complet && estDernierePlace(aine) && <Chip tone="goldSoft">Dernière place</Chip>}
            {enVedette && <Chip tone="info">Suggéré</Chip>}
          </div>
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

      {/* Citation — sans guillemets ni italique (signes IA) ; bloc flex-1 :
          l'espace restant devient intentionnel, le pied reste collé en bas */}
      <p className="mt-3 min-h-0 flex-1 line-clamp-2 break-words text-sm leading-relaxed text-[var(--text-primary)]/90">
        {(aine.ambitions?.[0] ?? "Vitrine en cours de complétion.").replace(/[.\s]+$/, "")}…
      </p>

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

      {/* Raison de la suggestion (IA-2) — DANS la carte : les pieds des cartes
          d'une même grille restent alignés, la note ne flotte pas dessous */}
      {raison && (
        <p className="mt-3 flex items-start gap-1.5 rounded-[var(--radius-chip)] bg-[#175cd3]/8 px-2.5 py-1.5 text-xs leading-snug text-[#175cd3]">
          <Sparkles size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>{raison}</span>
        </p>
      )}

      {/* Pied — jauge à gauche, action à droite : la carte se termine net */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border-soft)] pt-3.5">
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
    <Link
      to={`/annuaire/${aine.id}`}
      className="block h-full min-w-0 rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)] focus-visible:ring-offset-2"
    >
      <Card interactive accent className="h-full">
        {corps}
      </Card>
    </Link>
  );
}
