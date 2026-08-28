import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import FilPage from "./pages/FilPage";
import { AuthProvider } from "@app/providers/Auth";
import { server } from "@shared/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const userDemo = { id: 1, prenom: "Ivo", nom: "Abdoul", isAdmin: false };

const pubA = {
  id: 11,
  type: "succes",
  auteur: { id: 2, prenom: "Awa", nom: "Kouassi", filiere: "Réseaux et télécommunications" },
  contenu: "Lab Packet Tracer réussi\nOn a tout couvert du modèle OSI en deux séances.",
  dateCreation: new Date(Date.now() - 3600_000).toISOString(),
  reactions: { bravo: 3, merci: 0, utile: 1 },
  maReaction: null,
  nbCommentaires: 2,
  masquee: false,
};
const pubB = {
  id: 12,
  type: "question",
  auteur: { id: 3, prenom: "Yann", nom: "Gbagbo", filiere: "Digitalisation des services" },
  contenu: "Comment bien choisir sa filière en L2 ?",
  dateCreation: new Date(Date.now() - 7200_000).toISOString(),
  reactions: { bravo: 0, merci: 0, utile: 0 },
  maReaction: null,
  nbCommentaires: 0,
  masquee: false,
};

/** /fil rendue avec providers (Query, Router, Auth figé). */
function renderFil() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/fil"]}>
        <AuthProvider initialUser={userDemo}>
          <FilPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockFeed(publications) {
  server.use(
    http.get("*/api/publications/questions-restantes/", () =>
      HttpResponse.json({ restantes: 1 }),
    ),
    http.get("*/api/publications/", () =>
      HttpResponse.json({ count: publications.length, results: publications }),
    ),
  );
}

describe("Fil (doc 09)", () => {
  it("affiche le feed : titre implicite en gras, auteur, compteur commentaires", async () => {
    mockFeed([pubA, pubB]);
    renderFil();

    expect(await screen.findByText("Lab Packet Tracer réussi")).toBeInTheDocument();
    expect(screen.getByText(/Awa Kouassi/)).toBeInTheDocument();
    expect(screen.getByText(/Comment bien choisir sa filière/)).toBeInTheDocument();
    expect(screen.getByLabelText("Bravo (3)")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // compteur commentaires
  });

  it("publication masquée → panneau discret de modération, pas de contenu", async () => {
    mockFeed([{ ...pubA, masquee: true }]);
    renderFil();

    expect(
      await screen.findByText(/Publication retirée — en attente de modération/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Lab Packet Tracer réussi")).not.toBeInTheDocument();
  });

  it("composeur : publier une annonce → POST /api/publications/ puis revalidation", async () => {
    const coupsPost = vi.fn();
    mockFeed([pubA]);
    server.use(
      http.post("*/api/publications/", async ({ request }) => {
        coupsPost(await request.json());
        return HttpResponse.json(
          { ...pubA, id: 99, type: "annonce", contenu: "Nouvelle annonce du test automatisé" },
          { status: 201 },
        );
      }),
    );
    renderFil();

    fireEvent.click(await screen.findByText(/Partage une annonce, pose une question/));
    fireEvent.change(screen.getByLabelText(/Contenu de la publication/), {
      target: { value: "Session de révision algorithmique samedi matin, amphi B." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Publier/ }));

    await waitFor(() => expect(coupsPost).toHaveBeenCalled());
    expect(coupsPost.mock.calls[0][0]).toMatchObject({
      type: "annonce",
      contenu: "Session de révision algorithmique samedi matin, amphi B.",
    });
  });

  it("réaction fermée : clic Bravo → POST toggle {code:'bravo'}", async () => {
    const corps = vi.fn();
    mockFeed([pubA]);
    server.use(
      http.post("*/api/publications/11/reactions/", async ({ request }) => {
        corps(await request.json());
        return HttpResponse.json({ ok: true, maReaction: "bravo" }, { status: 201 });
      }),
    );
    renderFil();

    fireEvent.click(await screen.findByLabelText("Bravo (3)"));
    await waitFor(() => expect(corps).toHaveBeenCalledWith({ code: "bravo" }));
  });

  it("filtre par type : le feed est re-consulté avec ?type=question", async () => {
    const urls = [];
    server.use(
      http.get("*/api/publications/questions-restantes/", () =>
        HttpResponse.json({ restantes: 1 }),
      ),
      http.get("*/api/publications/", ({ request }) => {
        urls.push(request.url);
        return HttpResponse.json({ count: 1, results: [pubB] });
      }),
    );
    renderFil();

    fireEvent.click(await screen.findByRole("radio", { name: "Questions" }));
    await waitFor(() => expect(urls.some((u) => u.includes("type=question"))).toBe(true));
  });
});
