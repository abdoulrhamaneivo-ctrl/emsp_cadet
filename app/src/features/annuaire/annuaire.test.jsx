import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AnnuairePage from "./pages/AnnuairePage";
import { server } from "@shared/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderPage(url = "/annuaire") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <AnnuairePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AnnuairePage (doc 04)", () => {
  it("affiche le header, les Aînés éligibles, et MASQUE complets (RG3) + L1 (RG7)", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: /annuaire des aînés/i }),
    ).toBeInTheDocument();

    // Cadet libre → bandeau suggestions présent (critère 4 : suggestions seulement si libre)
    expect(await screen.findByText(/Awa Kouassi/)).toBeInTheDocument();
    expect(await screen.findByText(/Suggérés pour toi/i)).toBeInTheDocument();

    // RG3 : Serge 5/5 absent par défaut ; RG7 : Nadia L1 absente
    expect(screen.queryByText(/Serge Kouadio/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nadia Traoré/)).not.toBeInTheDocument();

    // Compteur : 7 éligibles non complets
    expect(await screen.findByText(/7 Aînés disponibles/i)).toBeInTheDocument();
  });

  it("le toggle « Inclure les Aînés complets » fait réapparaître l'Aîné à 5/5", async () => {
    renderPage();

    const toggle = await screen.findByLabelText(/inclure les aînés complets/i);
    fireEvent.click(toggle);

    expect(await screen.findByText(/Serge Kouadio/)).toBeInTheDocument();
    // Chip COMPLET sur la carte (le label du toggle contient aussi le mot)
    expect(await screen.findByText("Complet", { selector: "span" })).toBeInTheDocument();
  });

  it("la pagination pagine côté serveur (7 résultats → 2 pages)", async () => {
    renderPage();

    // Page 1 = ids [2,3,4,6,7,8] — Grace (8) n'est PAS dans le bandeau suggestions
    expect(await screen.findByText(/Grace Adjoua/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));

    // Page 2 = [9] : Grace a disparu de la grille, Ibrahim y figure
    // (aussi présent dans le bandeau suggestions → getAllByText)
    await waitFor(() => expect(screen.queryByText(/Grace Adjoua/)).not.toBeInTheDocument());
    expect(screen.getAllByText(/Ibrahim Ouattara/).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });
});
