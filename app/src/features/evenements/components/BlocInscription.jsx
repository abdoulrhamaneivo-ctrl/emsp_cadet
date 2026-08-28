import Button from "@shared/components/Button";
import Card from "@shared/components/Card";
import { PenLine } from "lucide-react";
import JaugeCapacite from "@shared/components/JaugeCapacite";

/** CTA d'inscription contextuel (doc 10 §5) : selon état — inscrit → outline
 * success avec Se désister ; complet → disabled + chip danger ; sinon primary.
 * aria-pressed sur l'état inscrit (doc 10 §7). */
export default function BlocInscription({
  evenement,
  inscrit,
  complet,
  organisateurOuAdmin,
  onToggle,
  chargement,
  onModifier,
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
        Ta participation
      </h2>
      {/* Jauge sur sa PROPRE ligne : à côté du titre elle débordait de la
          carte (12 segments) et repliait le titre (leçon vision t4b). */}
      <JaugeCapacite actifs={evenement.nbInscrits} total={evenement.capaciteMax} />

      {inscrit ? (
        <Button
          variant="outline"
          onClick={onToggle}
          loading={chargement}
          aria-pressed="true"
          className="border-[var(--accent-green)]/50"
        >
          Inscrit — Se désister
        </Button>
      ) : evenement.annule ? (
        <Button variant="outline" disabled>
          Événement annulé
        </Button>
      ) : complet ? (
        <div className="flex flex-col items-center gap-2">
          <Button variant="outline" disabled>
            Événement complet
          </Button>
          <span className="rounded-full border border-[#b42318]/40 bg-[#b42318]/10 px-2 py-0.5 text-[10px] font-bold text-[#b42318]">
            COMPLET
          </span>
        </div>
      ) : (
        <Button onClick={onToggle} loading={chargement} aria-pressed="false">
          Je participe
        </Button>
      )}

      {organisateurOuAdmin && (
        <Button variant="ghost" size="sm" icon={PenLine} onClick={onModifier}>
          Modifier l'événement
        </Button>
      )}
      <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
        Désinscription possible jusqu'à 2 heures avant le début. Après, contacte
        l'organisateur.
      </p>
    </Card>
  );
}
