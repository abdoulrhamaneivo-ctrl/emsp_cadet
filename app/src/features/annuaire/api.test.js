import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { envoyerDemande, annulerDemande, fetchParrains, fetchParrain } from "./api";
import { server } from "@shared/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("API annuaire sur mocks MSW (contrat doc 04 §2)", () => {
  it("fetchParrains exclut les complets et les L1 par défaut (RG3/RG7)", async () => {
    const data = await fetchParrains({});
    expect(data.count).toBe(7);
    const ids = data.results.map((r) => r.id);
    expect(ids).not.toContain(5); // Serge 5/5 — complet
    expect(ids).not.toContain(10); // Nadia L1 — jamais aînée
  });

  it("inclureComplets=true réintègre l'Aîné complet", async () => {
    const data = await fetchParrains({ inclureComplets: true });
    expect(data.results.map((r) => r.id)).toContain(5);
  });

  it("fetchParrain renvoie la fiche enrichie (badges, score)", async () => {
    const aine = await fetchParrain(2);
    expect(aine.prenom).toBe("Awa");
    expect(aine.scoreFiabilite).toBe(4.6);
    expect(aine.badges.length).toBeGreaterThan(0);
  });

  it("fetchParrain 404 pour un Aîné inexistant", async () => {
    await expect(fetchParrain(999)).rejects.toMatchObject({ response: { status: 404 } });
  });

  it("demande : 201 puis 409 RG1 (attente) puis nouvelle demande après annulation", async () => {
    const reponse = await envoyerDemande(2, "Bonjour, je cherche une aînée réseaux.");
    expect(reponse.status).toBe(201);

    // RG1 : une demande en attente bloque toute nouvelle demande
    await expect(envoyerDemande(6)).rejects.toMatchObject({ response: { status: 409 } });

    // Annulation → la voie est libre à nouveau
    await annulerDemande(reponse.data.id);
    const seconde = await envoyerDemande(6);
    expect(seconde.status).toBe(201);
  });

  it("demande vers un Aîné complet : 409 RG3", async () => {
    await expect(envoyerDemande(5)).rejects.toMatchObject({ response: { status: 409 } });
  });
});
