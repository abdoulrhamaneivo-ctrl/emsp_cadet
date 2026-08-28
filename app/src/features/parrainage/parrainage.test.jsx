import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import MesDemandesPage from "./pages/MesDemandesPage";
import MonParrainagePage from "./pages/MonParrainagePage";
import { AuthProvider } from "@app/providers/Auth";
import { server } from "@shared/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * User démo : L2, candidature aîné OUVERTE (double facette, RG8).
 * État parrainage global du mock = cadet LIBRE (contrat T1 : suggestions
 * seulement si libre) — le binôme s'obtient via le flux réel POST demande.
 */
const userAineOuverte = {
  id: 1,
  prenom: "Ivo",
  nom: "Abdoul",
  isAdmin: false,
  niveauEtude: "L2",
  classe: "L2 Digitalisation",
  candidatureAineOuverte: true,
};

const userL1 = { ...userAineOuverte, niveauEtude: "L1", candidatureAineOuverte: false };

function renderPage(ui, user = userAineOuverte, url = "/mes-demandes") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <AuthProvider initialUser={user}>
          <Toaster position="bottom-right" />
          {ui}
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Passe le mock en « demande en attente » via le vrai flux (RG1). */
async function envoyerDemandeDemo() {
  await fetch("/api/parrains/2/demande/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Bonjour !" }),
  });
}

describe("MesDemandesPage (doc 05 §4)", () => {
  it("onglet Reçues visible si candidature ouverte (RG8), avec les demandes reçues", async () => {
    renderPage(<MesDemandesPage />, userAineOuverte);

    expect(await screen.findByRole("tab", { name: "Envoyées" })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("tab", { name: /reçues/i }));

    expect(await screen.findByText(/Nadia Traoré/)).toBeInTheDocument();
    expect(await screen.findByText(/Chloé Aka/)).toBeInTheDocument();
  });

  it("onglet Reçues ABSENT pour un L1 sans candidature (RG7/RG8)", async () => {
    renderPage(<MesDemandesPage />, userL1);

    expect(await screen.findByRole("tab", { name: "Envoyées" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /reçues/i })).not.toBeInTheDocument();
    // Mention RG7 explicite plutôt qu'un onglet qui disparaît sans explication
    expect(await screen.findByText(/à partir du L2/i)).toBeInTheDocument();
  });

  it("accepter une demande → toast de confirmation (cadet ajouté côté serveur)", async () => {
    renderPage(<MesDemandesPage />, userAineOuverte);

    fireEvent.click(await screen.findByRole("tab", { name: /reçues/i }));
    const boutons = await screen.findAllByRole("button", { name: /accepter/i });
    fireEvent.click(boutons[0]);

    await waitFor(() => {
      expect(screen.getByText(/rejoint tes cadets/i)).toBeInTheDocument();
    });
  });

  it("annuler une demande envoyée en attente (RG1)", async () => {
    await envoyerDemandeDemo(); // crée l'attente via le flux réel
    renderPage(<MesDemandesPage />, userAineOuverte);

    fireEvent.click(await screen.findByRole("button", { name: /annuler/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Annuler la demande" }));

    await waitFor(() => {
      expect(screen.getByText(/tu peux en envoyer une nouvelle/i)).toBeInTheDocument();
    });
  });
});

describe("MonParrainagePage (doc 05 §5)", () => {
  it("cadet libre : panneau Aîné vide + facette aînée complète (cadets, famille)", async () => {
    renderPage(<MonParrainagePage />, userAineOuverte, "/mon-parrainage");

    // Facette cadette sans binôme → EmptyState avec CTA annuaire
    expect(await screen.findByText(/Pas encore d'Aîné/)).toBeInTheDocument();
    // Facette aînée (candidature ouverte) : cadets démo + famille + historique
    expect(await screen.findByText(/Mes cadets/)).toBeInTheDocument();
    expect(await screen.findByText(/Yann Gbagbo/)).toBeInTheDocument();
    expect(await screen.findByText(/Salim Cissé/)).toBeInTheDocument();
    expect(await screen.findByText(/Ta famille — toi & tes cadets/)).toBeInTheDocument();
    expect(await screen.findByText(/Historique des parrainages/)).toBeInTheDocument();
  });

  it("RG6 : binôme clos sans avis → CTA « Donner mon avis » + modale étoiles", async () => {
    renderPage(<MonParrainagePage />, userAineOuverte, "/mon-parrainage");

    expect(await screen.findByText(/Historique des parrainages/)).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: /donner mon avis/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: /note de 1 à 5/i })).toBeInTheDocument();
  });
});
