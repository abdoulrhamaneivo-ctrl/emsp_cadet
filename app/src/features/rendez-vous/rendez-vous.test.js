import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { peutRepondre } from "./rules";
import { schemaPropositionRDV } from "./schemas";
import { server } from "@shared/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterAll(() => server.close());

const ivo = { id: 1, prenom: "Ivo", nom: "Abdoul" };
const awa = { id: 2, prenom: "Awa", nom: "Koné" };
const base = { id: 400, organisateur: awa, invite: ivo, statut: "propose" };

describe("peutRepondre (matrice doc 06 §2)", () => {
  it("propose → seul l'invité répond", () => {
    expect(peutRepondre(base, ivo).ok).toBe(true);
    expect(peutRepondre(base, awa).ok).toBe(false);
  });

  it("contre_propose → seul l'organisateur tranche", () => {
    const rdv = { ...base, statut: "contre_propose" };
    expect(peutRepondre(rdv, awa).ok).toBe(true);
    expect(peutRepondre(rdv, ivo).ok).toBe(false);
  });

  it("statut final ou rdv absent → plus aucune action", () => {
    expect(peutRepondre({ ...base, statut: "confirme" }, ivo).ok).toBe(false);
    expect(peutRepondre({ ...base, statut: "refuse" }, ivo).ok).toBe(false);
    expect(peutRepondre(null, ivo).ok).toBe(false);
  });
});

describe("schemaPropositionRDV (doc 06 §3)", () => {
  const candidatValide = () => ({
    inviteId: 2,
    titre: "Séance sous-réseaux",
    dateHeure: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    mode: "presentiel",
    lieu: "Salle B12",
  });

  it("date passée → erreur « 5 minutes dans le futur » (§9 n°6)", () => {
    const res = schemaPropositionRDV.safeParse({
      ...candidatValide(),
      dateHeure: new Date(Date.now() - 60_000).toISOString(),
    });
    expect(res.success).toBe(false);
    expect(res.error.issues.some((i) => /5 minutes/.test(i.message))).toBe(true);
  });

  it("présentiel sans lieu → requis (superRefine)", () => {
    const res = schemaPropositionRDV.safeParse({ ...candidatValide(), lieu: "   " });
    expect(res.success).toBe(false);
    expect(res.error.issues.some((i) => i.path.includes("lieu"))).toBe(true);
  });

  it("visio sans lieu → accepté (le lieu n'est requis qu'en présentiel)", () => {
    const res = schemaPropositionRDV.safeParse({ ...candidatValide(), mode: "visio", lieu: "" });
    expect(res.success).toBe(true);
  });

  it("titre trop court → 3 caractères minimum", () => {
    const res = schemaPropositionRDV.safeParse({ ...candidatValide(), titre: "ok" });
    expect(res.success).toBe(false);
  });
});

describe("POST /api/rendez-vous/ (contrat mock doc 06 §2)", () => {
  it("proposition valide → 201, statut propose, organisateurMoi", async () => {
    const reponse = await fetch("/api/rendez-vous/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inviteId: 2,
        titre: "Révision subnetting",
        description: "",
        dateHeure: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        mode: "visio",
        lieu: "",
      }),
    });
    expect(reponse.status).toBe(201);
    const rdv = await reponse.json();
    expect(rdv.statut).toBe("propose");
    expect(rdv.organisateurMoi).toBe(true);
    expect(rdv.invite.id).toBe(2);
  });
});
