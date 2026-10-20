import { Search, RotateCcw, X } from "lucide-react";
import { Input } from "@shared/components/Input";
import Select from "@shared/components/Select";
import Chip from "@shared/components/Chip";
import Button from "@shared/components/Button";
import Switch from "@shared/components/Switch";

const FILIERES = [
  { value: "", label: "Toutes les filières" },
  { value: "Digitalisation des services", label: "Digitalisation des services" },
  { value: "Réseaux et télécommunications", label: "Réseaux et télécommunications" },
  { value: "Gestion des services postaux", label: "Gestion des services postaux" },
];
const CLASSES = [
  { value: "", label: "Toutes les classes" },
  { value: "L2 Digitalisation", label: "L2 Digitalisation" },
  { value: "L3 Réseaux", label: "L3 Réseaux" },
  { value: "L3 Digitalisation", label: "L3 Digitalisation" },
  { value: "M1 Digitalisation", label: "M1 Digitalisation" },
  { value: "M2 Réseaux", label: "M2 Réseaux" },
  { value: "Alumni 2023", label: "Alumni 2023" },
  { value: "Alumni 2024", label: "Alumni 2024" },
];

/**
 * Barre filtres annuaire (doc 04 §4) — TOUJOURS visibles (desktop ET mobile),
 * interrupteur iOS pour RG3, chips actifs retirables. Pas de boîte : les
 * filtres vivent sur la page (leçon iPhone — moins d'emboîtés).
 * @param {object} filtres — { q, filiere, classe, inclureComplets }
 * @param {function} onChanger — patch des filtres
 * @param {function} onReinitialiser
 */
export default function BarreFiltres({ filtres, onChanger, onReinitialiser }) {
  const chipsActifs = [];
  if (filtres.q) chipsActifs.push({ cle: "q", libelle: `« ${filtres.q} »` });
  if (filtres.filiere) chipsActifs.push({ cle: "filiere", libelle: filtres.filiere });
  if (filtres.classe) chipsActifs.push({ cle: "classe", libelle: filtres.classe });
  if (filtres.inclureComplets) chipsActifs.push({ cle: "inclureComplets", libelle: "Complets inclus" });

  const retirer = (cle) => {
    if (cle === "inclureComplets") onChanger({ inclureComplets: false });
    else onChanger({ [cle]: "" });
  };

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-3.5"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_auto] md:items-center">
        <Input
          leadingIcon={Search}
          placeholder="Nom, filière, classe, point fort"
          value={filtres.q}
          onChange={(e) => onChanger({ q: e.target.value })}
          aria-label="Rechercher un Aîné"
        />
        <Select
          label="Filtrer par filière"
          options={FILIERES}
          value={filtres.filiere}
          onChange={(e) => onChanger({ filiere: e.target.value })}
        />
        <Select
          label="Filtrer par classe"
          options={CLASSES}
          value={filtres.classe}
          onChange={(e) => onChanger({ classe: e.target.value })}
        />
        <Button
          variant="ghost-fonce"
          size="sm"
          icon={RotateCcw}
          onClick={onReinitialiser}
          className="justify-self-start md:justify-self-end"
        >
          Réinitialiser
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
        <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-[var(--text-primary)]">
          <Switch
            checked={filtres.inclureComplets}
            onChange={(suivant) => onChanger({ inclureComplets: suivant })}
            label="Inclure les Aînés complets (RG3)"
          />
          Inclure les Aînés complets (RG3)
        </label>

        {chipsActifs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chipsActifs.map((c) => (
              <button
                key={c.cle}
                type="button"
                onClick={() => retirer(c.cle)}
                aria-label={`Retirer le filtre ${c.libelle}`}
                className="group rounded-[var(--radius-chip)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)]"
              >
                <Chip tone="neutral" className="transition-colors group-hover:border-[var(--border-structural)] pr-1.5">
                  {c.libelle}
                  <X size={12} aria-hidden="true" className="ml-1" />
                </Chip>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
