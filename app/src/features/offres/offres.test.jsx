import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { AuthProvider } from "@app/providers/Auth";
import { server } from "@shared/mocks/server";
import OffresPage from "./pages/OffresPage";

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
});
