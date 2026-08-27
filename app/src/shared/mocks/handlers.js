import { http, HttpResponse } from "msw";

/**
 * Données de démo conformes au contrat (docs 02 §5 / 04) — MSW (doc 19).
 * Backend réel attendu à partir de T3 : retirer via VITE_ENABLE_MOCKS=0.
 * Cas limites volontairement dans le roster :
 *  - id 5  : 5/5 → COMPLET (RG3, invisible par défaut, visible via toggle)
 *  - id 4  : 4/5 → « dernière place » (RG2)
 *  - id 10 : L1, candidature fermée → ne doit JAMAIS apparaître (RG7)
 *  - id 3/7: alumni → chip « ALUMNI · Promo » (RG10)
 */

const utilisateurs = [
  {
    id: 1,
    prenom: "Ivo",
    nom: "Abdoul",
    email: "ivo.abdoul@emsp.int",
    isAdmin: false,
    niveauEtude: "L2",
    intentionAnneeSuivante: "inconnu",
    preferencesIA: { matchingEnrichi: true, copilot: true },
    anneePromotion: null,
    candidatureAineOuverte: false,
    classe: "L2 Digitalisation",
    filiere: "Digitalisation des services",
    photoUrl: null,
    attentes: "Comprendre les bases de données et préparer mon projet de fin d'année.",
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
  {
    id: 4,
    prenom: "Fatou",
    nom: "Bamba",
    email: "fatou.bamba@emsp.int",
    isAdmin: false,
    niveauEtude: "L2",
    intentionAnneeSuivante: "inconnu",
    preferencesIA: { matchingEnrichi: true, copilot: true },
    anneePromotion: null,
    candidatureAineOuverte: true,
    classe: "L2 Digitalisation",
    filiere: "Digitalisation des services",
    photoUrl: null,
    attentes: null,
    emailVerifie: true,
    dateInscription: "2025-11-03T14:00:00Z",
  },
  {
    id: 5,
    prenom: "Serge",
    nom: "Kouadio",
    email: "serge.kouadio@emsp.int",
    isAdmin: false,
    niveauEtude: "L3",
    intentionAnneeSuivante: "master",
    preferencesIA: { matchingEnrichi: false, copilot: false },
    anneePromotion: null,
    candidatureAineOuverte: true,
    classe: "L3 Digitalisation",
    filiere: "Digitalisation des services",
    photoUrl: null,
    attentes: null,
    emailVerifie: true,
    dateInscription: "2025-09-10T08:30:00Z",
  },
  {
    id: 6,
    prenom: "Aline",
    nom: "Koffi",
    email: "aline.koffi@emsp.int",
    isAdmin: false,
    niveauEtude: "M2",
    intentionAnneeSuivante: "master",
    preferencesIA: { matchingEnrichi: true, copilot: false },
    anneePromotion: null,
    candidatureAineOuverte: true,
    classe: "M2 Réseaux",
    filiere: "Réseaux et télécommunications",
    photoUrl: null,
    attentes: null,
    emailVerifie: true,
    dateInscription: "2024-10-01T09:00:00Z",
  },
  {
    id: 7,
    prenom: "Kouassi",
    nom: "N'Guessan",
    email: "kouassi.nguessan@emsp.int",
    isAdmin: false,
    niveauEtude: "alumni",
    intentionAnneeSuivante: "alumni",
    preferencesIA: { matchingEnrichi: false, copilot: false },
    anneePromotion: "2023",
    candidatureAineOuverte: true,
    classe: "Alumni 2023",
    filiere: "Réseaux et télécommunications",
    photoUrl: null,
    attentes: null,
    emailVerifie: true,
    dateInscription: "2022-09-05T08:00:00Z",
  },
  {
    id: 8,
    prenom: "Grace",
    nom: "Adjoua",
    email: "grace.adjoua@emsp.int",
    isAdmin: false,
    niveauEtude: "L2",
    intentionAnneeSuivante: "inconnu",
    preferencesIA: { matchingEnrichi: true, copilot: true },
    anneePromotion: null,
    candidatureAineOuverte: true,
    classe: "L2 Gestion postale",
    filiere: "Gestion des services postaux",
    photoUrl: null,
    attentes: null,
    emailVerifie: true,
    dateInscription: "2025-11-12T11:00:00Z",
  },
  {
    id: 9,
    prenom: "Ibrahim",
    nom: "Ouattara",
    email: "ibrahim.ouattara@emsp.int",
    isAdmin: false,
    niveauEtude: "M1",
    intentionAnneeSuivante: "master",
    preferencesIA: { matchingEnrichi: false, copilot: true },
    anneePromotion: null,
    candidatureAineOuverte: true,
    classe: "M1 Digitalisation",
    filiere: "Digitalisation des services",
    photoUrl: null,
    attentes: null,
    emailVerifie: true,
    dateInscription: "2024-09-20T10:00:00Z",
  },
  {
    id: 10,
    prenom: "Nadia",
    nom: "Traoré",
    email: "nadia.traore@emsp.int",
    isAdmin: false,
    niveauEtude: "L1",
    intentionAnneeSuivante: "inconnu",
    preferencesIA: { matchingEnrichi: true, copilot: true },
    anneePromotion: null,
    candidatureAineOuverte: false,
    classe: "L1 Réseaux",
    filiere: "Réseaux et télécommunications",
    photoUrl: null,
    attentes: "Trouver une aînée pour m'aider à prendre mes repères.",
    emailVerifie: true,
    dateInscription: "2026-08-15T07:45:00Z",
  },
];

/** Enrichissement ProfilAine (doc 02 §5) — ambitions ≥3, projets ≥1, forts ≥2, faibles ≥1 (RG8). */
const profilsAine = {
  2: {
    nbCadetsActifs: 3,
    scoreFiabilite: 4.6,
    nbAvis: 12,
    badges: [
      { code: "PIONNIER", libelle: "Pionnier", dateObtention: "2026-01-15" },
      { code: "RAMPE", libelle: "Premier accompagnement", dateObtention: "2026-02-02" },
    ],
    ambitions: [
      "Devenir ingénieure réseaux et sécurité dans un opérateur télécom",
      "Obtenir le CCNA avant la fin du L3",
      "Encadrer à mon tour des L1 dès mon master",
    ],
    projets: ["Supervision d'un réseau de campus — monitoring SNMP et alerting (PFE en cours)"],
    pointsForts: ["Patiente", "Méthodique", "Réseaux & CCNA"],
    pointsFaibles: ["Dispo difficile le vendredi"],
  },
  3: {
    nbCadetsActifs: 2,
    scoreFiabilite: 4.5,
    nbAvis: 8,
    badges: [{ code: "LANTERNE", libelle: "Mentor régulier", dateObtention: "2025-06-20" }],
    ambitions: [
      "Piloter la transformation numérique d'un service public",
      "Retourner à l'EMSP en intervenant",
    ],
    projets: ["Digitalisation du circuit courrier d'un centre régional"],
    pointsForts: ["Expérience professionnelle", "Process métier"],
    pointsFaibles: ["Moins dispo en semaine"],
  },
  4: {
    nbCadetsActifs: 4,
    scoreFiabilite: 4.2,
    nbAvis: 6,
    badges: [{ code: "RAMPE", libelle: "Premier accompagnement", dateObtention: "2026-02-28" }],
    ambitions: ["Chef de projet digital", "Fondre le papier dans le numérique postal", "Deuxième place au hackathon EPITA"],
    projets: ["Maquette appli de suivi des colis internes validée par la direction régionale"],
    pointsForts: ["Organisée", "Excel & données"],
    pointsFaibles: ["Encore en apprentissage sur la partie réseaux"],
  },
  5: {
    nbCadetsActifs: 5,
    scoreFiabilite: 3.9,
    nbAvis: 15,
    badges: [{ code: "PIONNIER", libelle: "Pionnier", dateObtention: "2025-12-01" }],
    ambitions: ["Architecte cloud", "Certification AWS", "Créer un club cybersécurité EMSP"],
    projets: ["Migration des fichiers vers le cloud — déployé sur 3 services"],
    pointsForts: ["Cloud", "Autonome", "Pédagogue"],
    pointsFaibles: ["Cadence de réponse variable"],
  },
  6: {
    nbCadetsActifs: 1,
    scoreFiabilite: null,
    nbAvis: 0,
    badges: [],
    ambitions: ["Recherche réseaux 5G", "Doctorat", "Former les futures promotions"],
    projets: ["Étude QoS VoLTE co-écrite avec un enseignant-chercheur"],
    pointsForts: ["Rigueur scientifique", "Statistiques"],
    pointsFaibles: ["Pas encore d'avis vérifié"],
  },
  7: {
    nbCadetsActifs: 3,
    scoreFiabilite: 4.8,
    nbAvis: 21,
    badges: [
      { code: "LANTERNE", libelle: "Mentor régulier", dateObtention: "2024-06-30" },
      { code: "PIONNIER", libelle: "Pionnier", dateObtention: "2023-11-11" },
    ],
    ambitions: ["Expert télécoms chez un opérateur régional", "Mentorer chaque année un groupe de cadets"],
    projets: ["Déploiement fibre rurale — 3 villages connectés (service national)"],
    pointsForts: ["Terrain", "Fibre & FTTH", "Très dispo"],
    pointsFaibles: ["Dire non à trop de demandes"],
  },
  8: {
    nbCadetsActifs: 2,
    scoreFiabilite: null,
    nbAvis: 0,
    badges: [],
    ambitions: ["Moderniser les circuits postaux", "Concours interne La Poste CI", "Apprendre le design de services"],
    projets: ["Refonte du parcours d'accueil guichet testée en agence pilote"],
    pointsForts: ["Écoute active", "Service client"],
    pointsFaibles: ["Nouvelle aînée, pas encore notée"],
  },
  9: {
    nbCadetsActifs: 0,
    scoreFiabilite: 4.0,
    nbAvis: 5,
    badges: [{ code: "RAMPE", libelle: "Premier accompagnement", dateObtention: "2025-05-14" }],
    ambitions: ["Data engineer", "Maîtriser les pipelines temps réel"],
    projets: ["Tableau de bord des flux postaux — Power BI alimenté par un ETL maison"],
    pointsForts: ["Python & données", "Calm"],
    pointsFaibles: ["Réservé au premier abord"],
  },
};

/** Enrichit un User en ProfilAine (réponse API). */
function enrichir(u) {
  const p = profilsAine[u.id] ?? {
    nbCadetsActifs: 1,
    scoreFiabilite: null,
    nbAvis: 0,
    badges: [],
    ambitions: ["Aider les cadets de ma filière"],
    projets: [],
    pointsForts: ["Motivé"],
    pointsFaibles: ["Nouvelle vitrine, en cours de complétion"],
  };
  return { ...u, ...p };
}

const NB_PAR_PAGE = 6;

/** État RG1 mutable du cadet démo (id 1) — mutation via POST demande / DELETE. */
let monParrainage = {
  binomeActif: false,
  aineActif: null,
  demandeEnAttente: null,
  historique: [
    {
      id: 901,
      cadet: utilisateurs[0],
      aine: utilisateurs[2],
      statut: "terminee",
      dateDemande: "2025-11-04T10:00:00Z",
      dateReponse: "2025-11-05T09:12:00Z",
      motifRefus: null,
    },
  ],
};

let prochaineDemandeId = 1000;

export const handlers = [
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
  http.post("*/api/auth/refresh/", () => new HttpResponse(null, { status: 204 })),

  // Annuaire (contrat doc 04 §2) : filière, classe, q, page, inclureComplets
  http.get("*/api/parrains/", ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const filiere = url.searchParams.get("filiere");
    const classe = url.searchParams.get("classe");
    const inclureComplets = url.searchParams.get("inclureComplets") === "true";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);

    let resultats = utilisateurs
      .filter((u) => u.id !== utilisateurs[0].id) // jamais soi-même dans les résultats
      .filter(
        (u) =>
          u.candidatureAineOuverte &&
          ["L2", "L3", "M1", "M2", "alumni"].includes(u.niveauEtude) && // RG7 + RG10
          (inclureComplets || (profilsAine[u.id]?.nbCadetsActifs ?? 1) < 5), // RG3
      )
      .map(enrichir);

    if (q) {
      resultats = resultats.filter((u) =>
        `${u.prenom} ${u.nom} ${u.filiere} ${u.classe} ${u.pointsForts.join(" ")}`.toLowerCase().includes(q),
      );
    }
    if (filiere) resultats = resultats.filter((u) => u.filiere === filiere);
    if (classe) resultats = resultats.filter((u) => u.classe === classe);

    const totalPages = Math.max(1, Math.ceil(resultats.length / NB_PAR_PAGE));
    const tranche = resultats.slice((page - 1) * NB_PAR_PAGE, page * NB_PAR_PAGE);
    return HttpResponse.json({
      count: resultats.length,
      page,
      pageSize: NB_PAR_PAGE,
      totalPages,
      results: tranche,
    });
  }),

  // Suggestions (max 3 — doc 04 §2/§9) : matching filière + raisonIA (IA-2, actif T6 mais champ déjà servi)
  http.get("*/api/parrains/suggestions/", () => {
    const moi = utilisateurs[0];
    const eligible = utilisateurs.filter(
      (u) =>
        u.id !== moi.id &&
        u.candidatureAineOuverte &&
        ["L2", "L3", "M1", "M2", "alumni"].includes(u.niveauEtude) &&
        (profilsAine[u.id]?.nbCadetsActifs ?? 1) < 5,
    );
    const memeFiliere = eligible.filter((u) => u.filiere === moi.filiere);
    const autres = eligible.filter((u) => u.filiere !== moi.filiere);
    const retenus = [...memeFiliere, ...autres].slice(0, 3);
    return HttpResponse.json({
      results: retenus.map((u, i) =>
        i === 0
          ? { ...enrichir(u), raisonIA: "Proche de tes attentes : bases de données et projets de fin d'année." }
          : { ...enrichir(u), raisonIA: null },
      ),
    });
  }),

  // Fiche détaillée (doc 04 §5)
  http.get("*/api/parrains/:id/", ({ params }) => {
    const u = utilisateurs.find((x) => String(x.id) === params.id);
    const eligible =
      u && u.candidatureAineOuverte && ["L2", "L3", "M1", "M2", "alumni"].includes(u.niveauEtude);
    if (!u || !eligible) {
      return HttpResponse.json({ detail: "Cet Aîné n'existe plus ou n'est pas visible." }, { status: 404 });
    }
    return HttpResponse.json(enrichir(u));
  }),

  // État parrainage du cadet démo (RG1)
  http.get("*/api/me/parrainage/", () => HttpResponse.json(monParrainage)),

  // Demande de parrainage : 201 | 409 RG1 (déjà engagé / attente) | 409 RG3 (complet)
  http.post("*/api/parrains/:id/demande/", async ({ params, request }) => {
    const body = await request.json().catch(() => ({}));
    const u = utilisateurs.find((x) => String(x.id) === params.id);
    if (!u) return HttpResponse.json({ detail: "Aîné introuvable." }, { status: 404 });
    if (monParrainage.binomeActif || monParrainage.demandeEnAttente) {
      return HttpResponse.json(
        { detail: "RG1 : un seul Aîné actif ou demande en attente à la fois." },
        { status: 409 },
      );
    }
    if ((profilsAine[u.id]?.nbCadetsActifs ?? 1) >= 5) {
      return HttpResponse.json(
        { detail: "RG3 : cet Aîné accompagne déjà 5 cadets." },
        { status: 409 },
      );
    }
    const demande = {
      id: prochaineDemandeId++,
      cadet: utilisateurs[0],
      aine: u,
      statut: "en_attente",
      dateDemande: new Date().toISOString(),
      dateReponse: null,
      motifRefus: null,
      message: body?.message ?? null,
    };
    monParrainage = { ...monParrainage, demandeEnAttente: demande };
    return HttpResponse.json(demande, { status: 201 });
  }),

  // Annulation d'une demande en attente (RG1, doc 04 §5 flux)
  http.delete("*/api/demandes/:id/", ({ params }) => {
    if (monParrainage.demandeEnAttente?.id === Number(params.id)) {
      monParrainage = { ...monParrainage, demandeEnAttente: null };
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("*/api/health/", () => HttpResponse.json({ statut: "ok" })),
];
