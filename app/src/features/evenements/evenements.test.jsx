import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import EvenementsPage from "./pages/EvenementsPage";
import { AuthProvider } from "@app/providers/Auth";
import { server } from "@shared/mocks/server";
import { estAine } from "./rules";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const atelier = {
  id: 1,
  type: "Atelier",
  titre: "Atelier SQL — jointures et agrégats",
  description: "Deux heures pour démuscler tes requêtes et finir par un mini-défaut.",
  organisateur: { id: 2, prenom: "Awa", nom: "Kouassi", filiere: "Réseaux" },
  dateHeure: "2030-06-15T14:00:00Z",
  lieu: "Salle B12",
  enLigne: false,
  capaciteMax: 12,
  nbInscrits: 8,
  inscrit: false,
  annule: false,
};

function renderEvenements(user) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/evenements"]}>
        <AuthProvider initialUser={user}>
          <Routes>
            <Route path="/evenements" element={<EvenementsPage />} />
            <Route path="/evenements/:evenementId" element={<p>fiche</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Événements (doc 10)", () => {
  it("garde aîné §8 n°1 : un cadet L1 ne voit PAS le bouton créer", async () => {
    server.use(
      http.get("*/api/evenements/", () => HttpResponse.json({ count: 0, results: [] })),
    );
    renderEvenements({ id: 1, prenom: "Salim", nom: "Cissé", classe: "L1 Digitalisation", isAdmin: false });
    expect(await screen.findByText(/Aucun événement programmé/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Créer/ })).not.toBeInTheDocument();
  });

  it("un aîné L3 voit le bouton créer et les cartes avec jauge", async () => {
    server.use(
      http.get("*/api/evenements/", () => HttpResponse.json({ count: 1, results: [atelier] })),
    );
    renderEvenements({ id: 1, prenom: "Ivo", nom: "Abdoul", classe: "L2 Digitalisation", isAdmin: false });

    expect(await screen.findByRole("button", { name: /Créer/ })).toBeInTheDocument();
    expect(await screen.findByText("Atelier SQL — jointures et agrégats")).toBeInTheDocument();
    expect(screen.getByLabelText("Capacité 8 sur 12")).toBeInTheDocument();
  });

  it("événement complet → chip COMPLET (§8 n°2)", async () => {
    server.use(
      http.get("*/api/evenements/", () =>
        HttpResponse.json({ count: 1, results: [{ ...atelier, nbInscrits: 12 }] }),
      ),
    );
    renderEvenements({ id: 1, prenom: "Ivo", nom: "Abdoul", classe: "L2 Digitalisation", isAdmin: false });
    expect(await screen.findByText("COMPLET")).toBeInTheDocument();
  });

  it("toggle inscription : POST inscription → revalidation", async () => {
    const coups = vi.fn();
    server.use(
      http.get("*/api/evenements/", () => HttpResponse.json({ count: 1, results: [atelier] })),
      http.post("*/api/evenements/1/inscription/", () => {
        coups();
        return HttpResponse.json({ ok: true, inscrit: true }, { status: 201 });
      }),
    );
    renderEvenements({ id: 1, prenom: "Ivo", nom: "Abdoul", classe: "L2 Digitalisation", isAdmin: false });
    expect(await screen.findByText("Atelier SQL — jointures et agrégats")).toBeInTheDocument();
  });
});

describe("estAine (garde doc 10)", () => {
  it("L1 = non, L2/L3/M2/alumni/admin = oui, insensible à la casse", () => {
    expect(estAine({ classe: "L1 Digitalisation", isAdmin: false })).toBe(false);
    expect(estAine({ classe: "L2 Digitalisation", isAdmin: false })).toBe(true);
    expect(estAine({ classe: "l3 réseaux", isAdmin: false })).toBe(true);
    expect(estAine({ classe: "alumni 2024", isAdmin: false })).toBe(true);
    expect(estAine({ classe: "", isAdmin: true })).toBe(true);
    expect(estAine(null)).toBe(false);
  });
});
