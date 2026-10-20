import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import ConnexionPage from "./pages/ConnexionPage";
import ReinitialiserMotDePassePage from "./pages/ReinitialiserMotDePassePage";
import { AuthProvider } from "@app/providers/Auth";
import { server } from "@shared/mocks/server";
import InscriptionPage from "./pages/InscriptionPage";
import PublicShell from "@layout/shells/PublicShell";
import ProtectedShell from "@layout/shells/ProtectedShell";

vi.mock("@app/providers/Theme", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: vi.fn() }),
}));

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

function renderReinitialisation() {
  return render(
    <MemoryRouter initialEntries={["/reinitialiser-mot-de-passe/abc/token"]}>
      <AuthProvider initialUser={null}>
        <Routes>
          <Route
            path="/reinitialiser-mot-de-passe/:uid/:token"
            element={<ReinitialiserMotDePassePage />}
          />
        </Routes>
      </AuthProvider>
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
  it("termine le chargement en invité quand le refresh et la session répondent 401", async () => {
    let refreshCalls = 0;
    let sessionCalls = 0;
    server.use(
      http.post("*/api/auth/refresh/", () => {
        refreshCalls += 1;
        return HttpResponse.json({ detail: "Session expirée." }, { status: 401 });
      }),
      http.get("*/api/auth/session/", () => {
        sessionCalls += 1;
        return HttpResponse.json({ detail: "Non authentifié." }, { status: 401 });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/annuaire"]}>
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedShell />}>
              <Route path="/annuaire" element={<p>ANNUAIRE-PROTÉGÉ</p>} />
            </Route>
            <Route path="/connexion" element={<p>CONNEXION-ATTEINTE</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("CONNEXION-ATTEINTE")).toBeInTheDocument();
    expect(refreshCalls).toBe(1);
    expect(sessionCalls).toBe(1);
  });

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

  it("demande le matricule, la promotion et la carte avant l'envoi du dossier", async () => {
    renderInscription();
    fireEvent.change(screen.getByLabelText(/Adresse e-mail/), {
      target: { value: "personne@gmail.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuer" }));

    expect(await screen.findByLabelText(/Matricule étudiant/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Année d'entrée/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Carte étudiante/)).toHaveAttribute("type", "file");
    expect(screen.getByText(/Seule l'administration peut la consulter/)).toBeInTheDocument();
  });

  it("laisse ouvrir le lien de nouveau mot de passe même avec une session active", () => {
    render(
      <MemoryRouter initialEntries={["/reinitialiser-mot-de-passe/abc/token"]}>
        <AuthProvider initialUser={{ id: 1, isAdmin: false }}>
          <Routes>
            <Route element={<PublicShell />}>
              <Route
                path="/reinitialiser-mot-de-passe/:uid/:token"
                element={<p>FORMULAIRE-RESET</p>}
              />
              <Route path="/messagerie" element={<p>REDIRECTION-MESSAGERIE</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("FORMULAIRE-RESET")).toBeInTheDocument();
    expect(screen.queryByText("REDIRECTION-MESSAGERIE")).toBeNull();
  });
});

describe("Réinitialisation du mot de passe", () => {
  it("affiche le formulaire après validation serveur du lien", async () => {
    server.use(
      http.post("*/api/auth/verifier-lien-reinitialisation/", () =>
        HttpResponse.json({ valid: true }),
      ),
    );

    renderReinitialisation();

    expect(await screen.findByLabelText(/Nouveau mot de passe/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mettre à jour le mot de passe" })).toBeInTheDocument();
  });

  it("n'affiche pas le formulaire si le lien a expiré", async () => {
    server.use(
      http.post("*/api/auth/verifier-lien-reinitialisation/", () =>
        HttpResponse.json({ detail: "Ce lien est invalide ou a expiré." }, { status: 400 }),
      ),
    );

    renderReinitialisation();

    expect(await screen.findByRole("heading", { name: "Lien invalide ou expiré" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Nouveau mot de passe/)).toBeNull();
  });

  it("explique le refus du mot de passe sans annoncer à tort un lien expiré", async () => {
    server.use(
      http.post("*/api/auth/verifier-lien-reinitialisation/", () =>
        HttpResponse.json({ valid: true }),
      ),
      http.post("*/api/auth/reinitialiser-mot-de-passe/", () =>
        HttpResponse.json(
          { password: ["Ce mot de passe est trop similaire aux informations personnelles." ] },
          { status: 400 },
        ),
      ),
    );

    renderReinitialisation();

    fireEvent.change(await screen.findByLabelText(/Nouveau mot de passe/), {
      target: { value: "MotDePasseUnique2026!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/), {
      target: { value: "MotDePasseUnique2026!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Mettre à jour le mot de passe" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "trop proche de tes informations personnelles",
    );
    expect(screen.queryByRole("heading", { name: "Lien invalide ou expiré" })).toBeNull();
  });
});
