import { http, HttpResponse } from "msw";

/**
 * Données de démo conformes au User v2 (doc 02 §5) — MSW (doc 19).
 * Backend réel attendu à partir de T3 : ces handlers seront retirés via VITE_ENABLE_MOCKS=0.
 */

const utilisateurs = [
  {
    id: 1,
    prenom: "Ivo",
    nom: "Abdoul",
    email: "ivo.abdoul@emsp.int",
    isAdmin: true,
    niveauEtude: "L2",
    intentionAnneeSuivante: "inconnu",
    preferencesIA: { matchingEnrichi: true, copilot: true },
    anneePromotion: null,
    candidatureAineOuverte: true,
    classe: "L2 Digitalisation",
    filiere: "Digitalisation des services",
    photoUrl: null,
    attentes: "Préparer mes projets de fin d'année et aider les L1.",
    emailVerifie: true,
    dateInscription: "2026-08-20T09:00:00Z",
  },
  {
    id: 2,
    prenom: "Awa",
    nom: "Kouassi",
    email: "awa.kouassi@emsp.int",
    isAdmin: false,
    niveauEtude: "L3",
    intentionAnneeSuivante: "master",
    preferencesIA: { matchingEnrichi: true, copilot: false },
    anneePromotion: null,
    candidatureAineOuverte: true,
    classe: "L3 Réseaux",
    filiere: "Réseaux et télécommunications",
    photoUrl: null,
    attentes: null,
    emailVerifie: true,
    dateInscription: "2025-10-02T10:30:00Z",
  },
  {
    id: 3,
    prenom: "Marius",
    nom: "Tanoh",
    email: "marius.tanoh@emsp.int",
    isAdmin: false,
    niveauEtude: "alumni",
    intentionAnneeSuivante: "alumni",
    preferencesIA: { matchingEnrichi: false, copilot: false },
    anneePromotion: "2024",
    candidatureAineOuverte: true,
    classe: "Alumni 2024",
    filiere: "Digitalisation des services",
    photoUrl: null,
    attentes: null,
    emailVerifie: true,
    dateInscription: "2023-09-15T08:00:00Z",
  },
];

export const handlers = [
  // Session courante — mock : invité par défaut, la connexion est mockée plus bas
  http.get("*/api/auth/session/", () =>
    HttpResponse.json({ estAuthentifie: true, utilisateur: utilisateurs[0] }),
  ),

  http.post("*/api/auth/connexion/", async ({ request }) => {
    const body = await request.json();
    const trouve = utilisateurs.find((u) => u.email === body?.email);
    if (!trouve || !body?.motDePasse) {
      return HttpResponse.json({ detail: "Identifiants invalides." }, { status: 401 });
    }
    return HttpResponse.json({ utilisateur: trouve });
  }),

  http.post("*/api/auth/deconnexion/", () => HttpResponse.json({ ok: true })),

  // Annuaire (contrat doc 04) : /api/parrains/?filiere=&classe=&q=&page=&inclureComplets=false
  http.get("*/api/parrains/", ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const filiere = url.searchParams.get("filiere");
    let resultats = utilisateurs.filter(
      (u) =>
        u.candidatureAineOuverte &&
        ["L2", "L3", "M1", "M2", "alumni"].includes(u.niveauEtude) &&
        u.nbCadetsActifs !== 5,
    );
    if (q) {
      resultats = resultats.filter((u) =>
        `${u.prenom} ${u.nom} ${u.filiere} ${u.classe}`.toLowerCase().includes(q),
      );
    }
    if (filiere) resultats = resultats.filter((u) => u.filiere === filiere);

    const enrichis = resultats.map((u) => ({
      ...u,
      nbCadetsActifs: (u.id % 4) + 1,
      scoreFiabilite: u.id === 3 ? 4.5 : null,
      nbAvis: u.id === 3 ? 8 : 0,
    }));
    return HttpResponse.json({ count: enrichis.length, results: enrichis });
  }),

  // Suggestions (max 3, doc 04 §7)
  http.get("*/api/parrains/suggestions/", () =>
    HttpResponse.json({
      results: [
        { ...utilisateurs[1], nbCadetsActifs: 2, scoreFiabilite: null, nbAvis: 0, raisonIA: "Même filière de digitalisation et calendrier compatible." },
      ],
    }),
  ),

  http.get("*/api/health/", () => HttpResponse.json({ statut: "ok" })),
];
