import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import MessagerieListPage from "./pages/MessagerieListPage";
import ConversationPage from "./pages/ConversationPage";
import { AuthProvider } from "@app/providers/Auth";
import { server } from "@shared/mocks/server";
import { conversations } from "@shared/mocks/store-t3.js";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const userDemo = { id: 1, prenom: "Ivo", nom: "Abdoul", isAdmin: false };

/** /messagerie rendue avec sa route enfant (split-view desktop / page mobile). */
function renderMessagerie(url = "/messagerie") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <AuthProvider initialUser={userDemo}>
          <Routes>
            <Route path="/messagerie" element={<MessagerieListPage />}>
              <Route path=":conversationId" element={<ConversationPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Messagerie (doc 08)", () => {
  it("garde doc 08 §1 : sans binôme ni conversation → EmptyState + retour annuaire", async () => {
    server.use(
      http.get("*/api/conversations/", () => HttpResponse.json({ results: [] })),
    );
    renderMessagerie();

    expect(
      await screen.findByText(/Ta messagerie s'activera dès qu'un Aîné acceptera ta demande/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Voir l'annuaire/i })).toHaveAttribute(
      "href",
      "/annuaire",
    );
  });

  it("badge 3 non lus sur Awa, puis accusé de lecture à l'ouverture → badge à 0", async () => {
    const coupsLu = vi.fn();
    server.use(
      http.patch("*/api/conversations/101/lu/", async () => {
        coupsLu();
        // même effet que le vrai handler : le badge serveur retombe à 0
        const conv = conversations.find((c) => c.id === 101);
        if (conv) conv.nonLus = 0;
        return HttpResponse.json({ ok: true });
      }),
    );
    renderMessagerie();

    // La conversation binôme affiche le badge de 3 messages non lus
    expect(await screen.findByText(/Awa Kouassi/)).toBeInTheDocument();
    expect(screen.getByLabelText("3 messages non lus")).toBeInTheDocument();

    // Ouverture → le fil charge (1re page paginée : ids 10→3) et l'accusé
    // de lecture part côté serveur
    fireEvent.click(screen.getByText(/Awa Kouassi/));
    expect(await screen.findByText(/Parfait, on fait ça demain à 14h/)).toBeInTheDocument();
    await waitFor(() => expect(coupsLu).toHaveBeenCalled());

    // Invalidation ["conversations"] → refetch → nonLus 0 → badge disparu
    await waitFor(() =>
      expect(screen.queryByLabelText("3 messages non lus")).not.toBeInTheDocument(),
    );
  });

  it("idempotence doc 08 §8 n°2 : même idempotencyKey → même message, zéro doublon", async () => {
    const cle = "test-cle-idempotence-1";
    const corps = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenu: "Message de test idempotent", idempotencyKey: cle }),
    };

    const premiere = await fetch("/api/conversations/101/messages/", corps);
    const deuxieme = await fetch("/api/conversations/101/messages/", corps);

    expect(premiere.status).toBe(201);
    expect(deuxieme.status).toBe(201);
    const message1 = await premiere.json();
    const message2 = await deuxieme.json();

    // Même clé → le serveur renvoie LE MÊME message (pas un nouvel id)
    expect(message2.id).toBe(message1.id);

    // Et le fil n'en contient qu'une copie
    const liste = await fetch("/api/conversations/101/messages/").then((r) => r.json());
    const occurrences = liste.results.filter((m) => m.idempotencyKey === cle);
    expect(occurrences).toHaveLength(1);
  });
});
