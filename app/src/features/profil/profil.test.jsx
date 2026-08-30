import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { Toaster } from "sonner";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider } from "@app/providers/Auth";
import { server } from "@shared/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const moiBase = {
  id: 1,
  email: "ivo.abdoul@emsp.int",
  prenom: "Ivo",
  nom: "Abdoul",
  classe: "L2 Digitalisation",
  filiere: "Digitalisation des services",
  niveauEtude: "L2",
  candidatureAineOuverte: false,
  attentes: "",
  ambitions: ["a", "b", "c"],
  projets: ["un projet"],
  pointsForts: ["fort 1", "fort 2"],
  pointsFaibles: ["faible 1"],
  photoUrl: null,
};

function renderProfil(user) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AuthProvider initialUser={user}>
          <Toaster position="top-center" />
          <ProfilePage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockMoi(overrides = {}, visibilite = { visible: false, motifs: ["photo"] }) {
  server.use(
    http.get("*/api/me/", () => HttpResponse.json({ ...moiBase, ...overrides })),
    http.get("*/api/me/visibilite-annuaire/", () => HttpResponse.json(visibilite)),
  );
}

describe("Profil (doc 11)", () => {
  it("affiche l'interrupteur RG8 et le pipeline si incomplet", async () => {
    mockMoi();
    renderProfil({ id: 1, prenom: "Ivo", nom: "Abdoul", classe: "L2", isAdmin: false });

    expect(
      await screen.findByRole("switch", { name: /Ouvrir ma candidature Aîné/ }),
    ).not.toBeChecked();
    expect(await screen.findByText(/Il manque encore/)).toBeInTheDocument();
    expect(screen.getByText("Photo de profil ajoutée")).toBeInTheDocument();
  });

  it("L1 : interrupteur physiquement disabled + texte doux (CA §8 n°1)", async () => {
    mockMoi({ niveauEtude: "L1" }, { visible: false, motifs: ["photo"] });
    renderProfil({ id: 3, prenom: "Salim", nom: "Cissé", classe: "L1", isAdmin: false });

    const interrupteur = await screen.findByRole("switch", { name: /Ouvrir ma candidature/ });
    expect(interrupteur).toBeDisabled();
    expect(screen.getByText(/ce sera ton tour/i)).toBeInTheDocument();
  });

  it("bascule RG8 : confirmation modale → PATCH {candidatureAineOuverte:true}", async () => {
    let recu = null;
    mockMoi();
    server.use(
      http.patch("*/api/me/", async ({ request }) => {
        recu = await request.json();
        return HttpResponse.json({ ...moiBase, candidatureAineOuverte: recu.candidatureAineOuverte });
      }),
    );
    renderProfil({ id: 1, prenom: "Ivo", nom: "Abdoul", classe: "L2", isAdmin: false });

    fireEvent.click(await screen.findByRole("switch", { name: /Ouvrir ma candidature/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Ouvrir ma candidature/ }));
    await waitFor(() => expect(recu).toMatchObject({ candidatureAineOuverte: true }));
  });

  it("sauvegarde explicite : bouton Enregistrer apparaît si dirty, PATCH complet", async () => {
    let recu = null;
    mockMoi();
    server.use(
      http.patch("*/api/me/", async ({ request }) => {
        recu = await request.json();
        return HttpResponse.json({ ...moiBase, attentes: recu.attentes });
      }),
    );
    renderProfil({ id: 1, prenom: "Ivo", nom: "Abdoul", classe: "L2", isAdmin: false });

    expect(await screen.findByText(/Parcours académique/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Enregistrer/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Tes attentes/), {
      target: { value: "Apprendre le subnetting et la config réseau." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Enregistrer/ }));
    await waitFor(() =>
      expect(recu).toMatchObject({ attentes: "Apprendre le subnetting et la config réseau." }),
    );
  });

  it("RG4 : l'email est affiché verrouillé et ne part JAMAIS dans le PATCH", async () => {
    let recu = null;
    mockMoi();
    server.use(
      http.patch("*/api/me/", async ({ request }) => {
        recu = await request.json();
        return HttpResponse.json(moiBase);
      }),
    );
    renderProfil({ id: 1, prenom: "Ivo", nom: "Abdoul", classe: "L2", isAdmin: false });

    expect(await screen.findByText("ivo.abdoul@emsp.int")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Ivone" } });
    fireEvent.click(screen.getByRole("button", { name: /Enregistrer/ }));
    await waitFor(() => expect(recu).not.toHaveProperty("email"));
  });

  it("RG5 : aucun champ rôle/isAdmin exposé dans le DOM (CA §8 n°5)", async () => {
    mockMoi();
    const { container } = renderProfil({ id: 1, prenom: "Ivo", nom: "Abdoul", classe: "L2", isAdmin: false });
    await screen.findByText(/Parcours académique/);
    expect(container.textContent).not.toContain("isAdmin");
    expect(container.textContent).not.toContain("Administrateur");
  });
});
