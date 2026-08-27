import { describe, expect, it } from "vitest";
import { canRequest, estComplet, estDernierePlace, estAlumni } from "./rules";

const aineLibre = { id: 2, nbCadetsActifs: 3, niveauEtude: "L3" };
const parrainageLibre = { binomeActif: false, demandeEnAttente: null };

describe("estComplet (RG3)", () => {
  it("5/5 est complet, 4/5 non", () => {
    expect(estComplet({ nbCadetsActifs: 5 })).toBe(true);
    expect(estComplet({ nbCadetsActifs: 4 })).toBe(false);
    expect(estComplet(null)).toBe(false);
  });
});

describe("estDernierePlace (RG2)", () => {
  it("vrai uniquement à 4/5", () => {
    expect(estDernierePlace({ nbCadetsActifs: 4 })).toBe(true);
    expect(estDernierePlace({ nbCadetsActifs: 3 })).toBe(false);
    expect(estDernierePlace({ nbCadetsActifs: 5 })).toBe(false);
  });
});

describe("estAlumni (RG10)", () => {
  it("détecte le niveau alumni", () => {
    expect(estAlumni({ niveauEtude: "alumni" })).toBe(true);
    expect(estAlumni({ niveauEtude: "L3" })).toBe(false);
  });
});

describe("canRequest (RG1 + RG3)", () => {
  it("ok quand cadet libre et Aîné non complet", () => {
    expect(canRequest(aineLibre, parrainageLibre)).toEqual({
      ok: true,
      code: "ok",
      raison: null,
    });
  });

  it("deja_engage quand binôme actif (RG1)", () => {
    const verdict = canRequest(aineLibre, { ...parrainageLibre, binomeActif: true });
    expect(verdict.ok).toBe(false);
    expect(verdict.code).toBe("deja_engage");
  });

  it("attente quand une demande est en attente (une attente compte comme engagement)", () => {
    const verdict = canRequest(aineLibre, {
      ...parrainageLibre,
      demandeEnAttente: { id: 1000 },
    });
    expect(verdict.ok).toBe(false);
    expect(verdict.code).toBe("attente");
  });

  it("plein quand l'Aîné est à 5/5 (RG3) — même si le cadet est libre", () => {
    const verdict = canRequest({ ...aineLibre, nbCadetsActifs: 5 }, parrainageLibre);
    expect(verdict.ok).toBe(false);
    expect(verdict.code).toBe("plein");
  });

  it("introuvable sans Aîné", () => {
    expect(canRequest(null, parrainageLibre).code).toBe("introuvable");
  });

  it("priorise plein (RG3) avant deja_engage (RG1)", () => {
    const verdict = canRequest(
      { ...aineLibre, nbCadetsActifs: 5 },
      { ...parrainageLibre, binomeActif: true },
    );
    expect(verdict.code).toBe("plein");
  });
});
