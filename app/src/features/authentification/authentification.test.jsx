import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import ConnexionPage from "./pages/ConnexionPage";
import { AuthProvider } from "@app/providers/Auth";
import { server } from "@shared/mocks/server";
import InscriptionPage from "./pages/InscriptionPage";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** Page rendue en invité figé (initialUser={null}) + destination de sondage. */
function renderConnexion() {
  return render(
    <MemoryRouter initialEntries={["/connexion"]}>
      <AuthProvider initialUser={null}>
        <Routes>
          <Route path="/connexion" element={<ConnexionPage />} />
          <Route path="/messagerie" element={<p>DESTINATION-ATTEINTE</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

function renderInscription() {
  return render(
    <MemoryRouter initialEntries={["/inscription"]}>
      <Routes>
        <Route path="/inscription" element={<InscriptionPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function remplir(email, motDePasse) {
  fireEvent.change(screen.getByLabelText(/Adresse e-mail/), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/Mot de passe/), {
    target: { value: motDePasse },
  });
  fireEvent.click(screen.getByRole("button", { name: /Se connecter/ }));
}

describe("Connexion (doc 02 §5)", () => {
  it("laisse le serveur vérifier une adresse externe pour le compte administrateur", async () => {
    let emailRecu;
    server.use(
      http.post("*/api/auth/connexion/", async ({ request }) => {
        emailRecu = (await request.json()).email;
        return HttpResponse.json(
          { detail: "E-mail ou mot de passe incorrect." },
          { status: 401 },
        );
      }),
    );
    renderConnexion();
    remplir("abdoulivo5@gmail.com", "mot-de-passe-invalide");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "E-mail ou mot de passe incorrect",
    );
    expect(emailRecu).toBe("abdoulivo5@gmail.com");
    expect(screen.queryByText("DESTINATION-ATTEINTE")).toBeNull();
  });

  it("champ requis : e-mail vide → erreur zod, pas de requête", async () => {
    renderConnexion();
    fireEvent.click(screen.getByRole("button", { name: /Se connecter/ }));
    // Première issue par champ : « requis » prime sur le message du refine.
    expect(await screen.findByText(/L'e-mail est requis/)).toBeTruthy();
    expect(screen.getByText(/Le mot de passe est requis/)).toBeTruthy();
  });

  it("401 : message du serveur affiché, le formulaire reste en place", async () => {
    server.use(
      http.post("*/api/auth/connexion/", () =>
        HttpResponse.json({ detail: "E-mail ou mot de passe incorrect." }, { status: 401 }),
      ),
    );
    renderConnexion();
    remplir("ivo.abdoul@emsp.int", "faux");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "E-mail ou mot de passe incorrect",
    );
    expect(screen.getByLabelText(/Adresse e-mail/).value).toBe("ivo.abdoul@emsp.int");
  });

  it("succès : session résolue puis redirection vers la destination demandée", async () => {
    renderConnexion();
    remplir("ivo.abdoul@emsp.int", "demo");
    await waitFor(() => {
      expect(screen.queryByText("DESTINATION-ATTEINTE")).not.toBeNull();
    });
  });

  it("redirige vers state.from (page d'origine demandée avant la garde)", async () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/connexion", state: { from: "/annuaire" } }]}
      >
        <AuthProvider initialUser={null}>
          <Routes>
            <Route path="/connexion" element={<ConnexionPage />} />
            <Route path="/annuaire" element={<p>RETOUR-ANNUAIRE</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
    remplir("ivo.abdoul@emsp.int", "demo");
    await waitFor(() => {
      expect(screen.queryByText("RETOUR-ANNUAIRE")).not.toBeNull();
    });
  });

  it("ne propose aucun compte de démonstration prérempli", () => {
    renderConnexion();
    expect(screen.queryByRole("button", { name: /ivo\.abdoul/ })).toBeNull();
  });
});

describe("Inscription", () => {
  it("accepte une adresse valide en dehors du domaine emsp.int", async () => {
    renderInscription();
    fireEvent.change(screen.getByLabelText(/Adresse e-mail/), {
      target: { value: "personne@gmail.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));

    expect(await screen.findByRole("heading", { name: "Ton profil" })).toBeInTheDocument();
    expect(screen.queryByText("Adresse e-mail invalide")).toBeNull();
  });
});
