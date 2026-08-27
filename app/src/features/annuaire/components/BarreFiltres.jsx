import { useState } from "react";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@shared/components/Input";
import Select from "@shared/components/Select";
import Chip from "@shared/components/Chip";
import Button from "@shared/components/Button";
import { cx } from "@shared/utils/cx";

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
 * Barre filtres annuaire (doc 04 §4) — recherche + selects + toggle RG3.
 * Mobile : repliée en accordéon (doc 04 §8 critère 8). Chips actifs cliquables.
 * @param {object} filtres — { q, filiere, classe, inclureComplets }
 * @param {function} onChanger — patch des filtres
 * @param {function} onReinitialiser
 */
export default function BarreFiltres({ filtres, onChanger, onReinitialiser }) {
  const [ouvertMobile, setOuvertMobile] = useState(false);

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
      className="rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4 shadow-[var(--shadow-card)] md:p-5"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 md:hidden">
          <Input
            leadingIcon={Search}
            placeholder="Rechercher un Aîné…"
            value={filtres.q}
            onChange={(e) => onChanger({ q: e.target.value })}
            aria-label="Rechercher un Aîné"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={SlidersHorizontal}
          className="md:hidden"
          aria-expanded={ouvertMobile}
          onClick={() => setOuvertMobile((v) => !v)}
        >
          Filtres
        </Button>
      </div>

      <div className={cx("mt-0 hidden gap-3 md:grid md:grid-cols-[1fr_220px_220px] md:items-center", !ouvertMobile && "md:grid")}>
        <Input
          leadingIcon={Search}
          placeholder="Rechercher par nom, filière, classe, point fort…"
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
      </div>

      <AnimatePresence initial={false}>
        {ouvertMobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden md:hidden"
          >
            <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border-soft)] pt-3">
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
              <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  checked={filtres.inclureComplets}
                  onChange={(e) => onChanger({ inclureComplets: e.target.checked })}
                  className="h-4 w-4 accent-[var(--accent-green)]"
                />
                Inclure les Aînés complets (RG3)
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle RG3 desktop */}
      <label className="mt-3 hidden items-center gap-2 text-sm text-[var(--text-primary)] md:flex">
        <input
          type="checkbox"
          checked={filtres.inclureComplets}
          onChange={(e) => onChanger({ inclureComplets: e.target.checked })}
          className="h-4 w-4 accent-[var(--accent-green)]"
        />
        Inclure les Aînés complets
      </label>

      {chipsActifs.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--border-soft)] pt-3">
          {chipsActifs.map((c) => (
            <button
              key={c.cle}
              type="button"
              onClick={() => retirer(c.cle)}
              aria-label={`Retirer le filtre ${c.libelle}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emsp-green-luminous)] rounded-[var(--radius-chip)]"
            >
              <Chip tone="neutral" className="pr-1.5">
                {c.libelle}
                <X size={12} aria-hidden="true" className="ml-1" />
              </Chip>
            </button>
          ))}
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReinitialiser}>
            Réinitialiser
          </Button>
        </div>
      )}
    </form>
  );
}
