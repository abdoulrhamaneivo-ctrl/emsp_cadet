import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { AuthProvider } from "@app/providers/Auth";
import { server } from "@shared/mocks/server";
import OffresPage from "./pages/OffresPage";
import CreerOffrePage from "@features/alumni/pages/CreerOffrePage";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderOffres(user = { id: 1, niveauEtude: "L2", isAdmin: false }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={user}>
        <MemoryRouter initialEntries={["/offres"]}>
          <OffresPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

function renderCreationOffre() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/offres/creer"]}>
        <AuthProvider initialUser={{ id: 9, niveauEtude: "alumni", isAdmin: false }}>
          <Routes>
            <Route path="/offres/creer" element={<CreerOffrePage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Offres", () => {
  it("n'invente aucune annonce quand la base ne contient pas encore d'offre", async () => {
    server.use(http.get("*/api/offres/", () => HttpResponse.json({ count: 0, results: [] })));

    renderOffres();

    expect(await screen.findByText("Aucune offre publiée pour le moment")).toBeInTheDocument();
    expect(screen.queryByText(/TechCorp|DataFlow|CloudScale/)).toBeNull();
    expect(screen.queryByRole("link", { name: "Créer une offre" })).toBeNull();
  });

  it("ouvre les filtres de type, localisation et télétravail", async () => {
    server.use(http.get("*/api/offres/", () => HttpResponse.json({ count: 0, results: [] })));

    renderOffres();
    await screen.findByText("Aucune offre publiée pour le moment");
    fireEvent.click(screen.getByRole("button", { name: "Filtres" }));

    expect(screen.getByLabelText("Type d'offre")).toBeInTheDocument();
    expect(screen.getByLabelText("Localisation")).toBeInTheDocument();
    expect(screen.getByLabelText("Télétravail")).toBeInTheDocument();
  });

  it("génère et insère une suggestion IA-6 quand le copilot est activé", async () => {
    let requete;
    server.use(
      http.get("*/api/me/preferences-ia/", () => HttpResponse.json({ copilot: true })),
      http.post("*/api/offres/generer/", async ({ request }) => {
        requete = await request.json();
        return HttpResponse.json({
          mission: ["Mission adaptée aux réseaux du campus"],
          profil: ["Profil adapté aux réseaux du campus"],
          modalites: ["Modalités adaptées au stage"],
        });
      }),
    );

    renderCreationOffre();
    const boutonsCopilot = await screen.findAllByRole("button", { name: /M'aider à rédiger/ });
    fireEvent.click(boutonsCopilot[0]);
    fireEvent.change(screen.getByLabelText("Mots-clés pour l'assistant"), {
      target: { value: "réseaux campus" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Générer des idées" }));

    const proposition = await screen.findByRole("button", {
      name: /Mission adaptée aux réseaux du campus/,
    });
    expect(requete).toMatchObject({
      typeOffre: "stage",
      variables: { taches_principales: "réseaux campus" },
    });
    fireEvent.click(proposition);
    expect(screen.getByLabelText(/Description de la mission/).value).toBe(
      "Mission adaptée aux réseaux du campus",
    );
  });
});
