import { niveauDe, promoDevancante, peutDemander } from "./rules";

/** Règles parrainage — RÈGLE IVO n°2 : l'aîné doit être de la promo qui
 * devance DIRECTEMENT (L1→L2, L2→L3, L3→M1, M1→M2 ; M2/alumni : personne).
 * Miroir exact de backend/parrainage/rules.py. */

const DEVANCANT = {
  L1: "L2",
  L2: "L3",
  L3: "M1",
  M1: "M2",
  M2: null,
  alumni: null,
};

describe("règles promo devançante (règle Ivo n°2)", () => {
  it("chaque niveau n'a QUE son devançant direct", () => {
    expect(promoDevancante("L1")).toBe("L2");
    expect(promoDevancante("L2")).toBe("L3");
    expect(promoDevancante("L3")).toBe("M1");
    expect(promoDevancante("M1")).toBe("M2");
    expect(promoDevancante("M2")).toBeNull();
    expect(promoDevancante("alumni")).toBeNull();
  });

  it("peutDemander : L1→L2 ✓, L1→L3 ✗ (trop loin)", () => {
    expect(peutDemander("L1", "L2")).toBe(true);
    expect(peutDemander("L1", "L3")).toBe(false);
    expect(peutDemander("L1", "M2")).toBe(false);
    expect(peutDemander("L2", "L3")).toBe(true);
    expect(peutDemander("L3", "M1")).toBe(true);
    expect(peutDemander("M2", "L3")).toBe(false);
  });

  it("niveauDe lit le champ réel, repli préfixe classe", () => {
    expect(niveauDe({ niveauEtude: "L3" })).toBe("L3");
    expect(niveauDe({ niveauEtude: undefined, classe: "L2 Digitalisation" })).toBe("L2");
    expect(niveauDe({ classe: "L1 Digitalisation" })).toBe("L1");
  });
});
