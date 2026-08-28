import { http, HttpResponse } from "msw";
import { utilisateurs } from "./utilisateurs.js";
import { rdvs } from "./store-t3.js";
import { t3Handlers } from "./handlers-t3.js";

/**
 * Données de démo conformes au contrat (docs 02 §5 / 04) — MSW (doc 19).
 * Backend réel attendu à partir de T3 : retirer via VITE_ENABLE_MOCKS=0.
 * Cas limites volontairement dans le roster :
 *  - id 5  : 5/5 → COMPLET (RG3, invisible par défaut, visible via toggle)
 *  - id 4  : 4/5 → « dernière place » (RG2)
 *  - id 10 : L1, candidature fermée → ne doit JAMAIS apparaître (RG7)
 *  - id 3/7: alumni → chip « ALUMNI · Promo » (RG10)
 */


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
    pointsForts: ["Python & données", "Calme"],
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

/**
 * État T2 (doc 05) : demandes dans les DEUX sens (débiter/créditer), binômes
 * actifs et clos, famille, RDV du binôme — tout est mutable via les endpoints.
 * Le cadet démo (Ivo, L2) porte les DEUX casquettes : il a une Aînée (Awa),
 * accompagne 2 cadets, reçoit 2 demandes, et a un binôme clos sans avis (RG6).
 */
let demandesEntrantes = [
  {
    id: 910,
    cadet: utilisateurs[9], // Nadia Traoré, L1
    aine: utilisateurs[0],
    statut: "en_attente",
    dateDemande: "2026-08-24T16:40:00Z",
    dateReponse: null,
    motifRefus: null,
    message: "Bonjour ! Je débute en réseaux et ton parcours me motive beaucoup. Peux-tu m'accompagner ?",
  },
  {
    id: 911,
    cadet: {
      id: 11,
      prenom: "Chloé",
      nom: "Aka",
      email: "chloe.aka@emsp.int",
      isAdmin: false,
      niveauEtude: "L1",
      intentionAnneeSuivante: "inconnu",
      preferencesIA: { matchingEnrichi: false, copilot: false },
      anneePromotion: null,
      candidatureAineOuverte: false,
      classe: "L1 Digitalisation",
      filiere: "Digitalisation des services",
      photoUrl: null,
      attentes: null,
      emailVerifie: true,
      dateInscription: "2026-08-10T08:00:00Z",
    },
    aine: utilisateurs[0],
    statut: "en_attente",
    dateDemande: "2026-08-26T09:15:00Z",
    dateReponse: null,
    motifRefus: null,
    message: "Salut ! Je voudrais des conseils pour préparer mon PFE en digitalisation.",
  },
];

let mesCadets = [
  {
    id: 701,
    autre: {
      id: 12,
      prenom: "Yann",
      nom: "Gbagbo",
      email: "yann.gbagbo@emsp.int",
      isAdmin: false,
      niveauEtude: "L1",
      intentionAnneeSuivante: "inconnu",
      preferencesIA: { matchingEnrichi: true, copilot: true },
      anneePromotion: null,
      candidatureAineOuverte: false,
      classe: "L1 Digitalisation",
      filiere: "Digitalisation des services",
      photoUrl: null,
      attentes: null,
      emailVerifie: true,
      dateInscription: "2026-08-12T10:00:00Z",
    },
    dateDebut: "2026-03-02T00:00:00Z",
    statut: "actif",
    avisDonne: false,
    sens: "donne_a_mon_cadet",
  },
  {
    id: 702,
    autre: {
      id: 13,
      prenom: "Salim",
      nom: "Cissé",
      email: "salim.cisse@emsp.int",
      isAdmin: false,
      niveauEtude: "L1",
      intentionAnneeSuivante: "inconnu",
      preferencesIA: { matchingEnrichi: false, copilot: false },
      anneePromotion: null,
      candidatureAineOuverte: false,
      classe: "L1 Réseaux",
      filiere: "Réseaux et télécommunications",
      photoUrl: null,
      attentes: null,
      emailVerifie: true,
      dateInscription: "2026-08-14T11:00:00Z",
    },
    dateDebut: "2026-03-09T00:00:00Z",
    statut: "actif",
    avisDonne: false,
    sens: "donne_a_mon_cadet",
  },
];

let historiqueRecus = [
  {
    id: 901,
    cadet: utilisateurs[0],
    aine: utilisateurs[2],
    statut: "terminee",
    dateDemande: "2025-11-04T10:00:00Z",
    dateReponse: "2025-11-05T09:12:00Z",
    motifRefus: null,
  },
];
let historiqueEnvoyes = [
  {
    id: 905,
    cadet: utilisateurs[0],
    aine: utilisateurs[6], // Kouassi N'Guessan, alumni
    statut: "terminee",
    dateDemande: "2025-09-20T10:00:00Z",
    dateReponse: "2025-09-21T08:00:00Z",
    motifRefus: null,
    avisDonne: false,
  },
];

let groupes = [
  {
    conversationId: 501,
    type: "famille",
    titre: "Ta famille — toi & tes cadets",
    nbMembres: 3, // Ivo + Yann + Salim (doc 13 : famille auto aîné + cadets)
  },
];

// RDV : source unique = store-t3.js (id 401 « confirme » sert à la bannière J-1)

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

  // État parrainage du cadet démo (RG1) — contrat complet doc 05 §2 (double facette)
  http.get("*/api/me/parrainage/", () =>
    HttpResponse.json({
      binomeActif: monParrainage.binomeActif,
      aineActif: monParrainage.aineActif,
      demandeEnAttente: monParrainage.demandeEnAttente,
      monAine: monParrainage.aineActif
        ? {
            id: 800,
            autre: monParrainage.aineActif,
            dateDebut: "2026-02-10T00:00:00Z",
            statut: "actif",
            avisDonne: false,
            sens: "recu_de_mon_aine",
          }
        : null,
      cadetsActifs: mesCadets,
      historiqueEnvoyes,
      historiqueRecus,
    }),
  ),

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

  // ── T2 (doc 05) : demandes dans les deux sens ────────────────────────────
  // GET /api/demandes/?sens=envoyees|recues — « recues » vide si candidature fermée
  http.get("*/api/demandes/", ({ request }) => {
    const url = new URL(request.url);
    const sens = url.searchParams.get("sens") || "envoyees";
    const statut = url.searchParams.get("statut");
    const moi = utilisateurs[0];

    if (sens === "recues") {
      if (!moi.candidatureAineOuverte) {
        return HttpResponse.json({ count: 0, results: [] });
      }
      const recues = demandesEntrantes.filter((d) => !statut || d.statut === statut);
      return HttpResponse.json({ count: recues.length, results: recues });
    }
    // Sens « envoyées » : attente live + historique clos (même forme que T1)
    const attente = monParrainage.demandeEnAttente
      ? [{ ...monParrainage.demandeEnAttente, statut: "en_attente" }]
      : [];
    const envoyees = [...attente, ...historiqueEnvoyes].filter((d) => !statut || d.statut === statut);
    return HttpResponse.json({ count: envoyees.length, results: envoyees });
  }),

  // POST /api/demandes/:id/repondre/ — accepter (RG2) ou refuser (motif partagé)
  http.post("*/api/demandes/:id/repondre/", async ({ params, request }) => {
    const body = await request.json().catch(() => ({}));
    const idx = demandesEntrantes.findIndex((d) => d.id === Number(params.id));
    if (idx === -1) {
      return HttpResponse.json({ detail: "Demande introuvable." }, { status: 404 });
    }
    const d = demandesEntrantes[idx];
    if (d.statut !== "en_attente") {
      return HttpResponse.json({ detail: "Cette demande a déjà été traitée." }, { status: 409 });
    }
    if (body?.decision === "acceptee") {
      if (mesCadets.length >= 5) {
        return HttpResponse.json(
          { detail: "RG2 : tu accompagnes déjà 5 cadets. Libère une place avant d'accepter." },
          { status: 409 },
        );
      }
      demandesEntrantes.splice(idx, 1);
      mesCadets = [
        ...mesCadets,
        {
          id: 700 + mesCadets.length + 40,
          autre: d.cadet,
          dateDebut: new Date().toISOString(),
          statut: "actif",
          avisDonne: false,
          sens: "donne_a_mon_cadet",
        },
      ];
      // Doc 13 : accepter un cadet l'ajoute à MA famille existante
      groupes = groupes.map((g) =>
        g.type === "famille" ? { ...g, nbMembres: g.nbMembres + 1 } : g,
      );
      return HttpResponse.json({ ok: true, statut: "acceptee" });
    }
    if (body?.decision === "refusee") {
      demandesEntrantes.splice(idx, 1);
      if (body.partagerMotif && body.motifRefus) {
        historiqueRecus = [
          { ...d, statut: "refusee", dateReponse: new Date().toISOString(), motifRefus: body.motifRefus },
          ...historiqueRecus,
        ];
      }
      return HttpResponse.json({ ok: true, statut: "refusee" });
    }
    return HttpResponse.json({ detail: "Décision invalide." }, { status: 400 });
  }),

  // PATCH /api/demandes/:id/annuler/ — demandeur, seulement en_attente (doc 05 §2)
  http.patch("*/api/demandes/:id/annuler/", ({ params }) => {
    if (monParrainage.demandeEnAttente?.id === Number(params.id)) {
      monParrainage = { ...monParrainage, demandeEnAttente: null };
      return HttpResponse.json({ ok: true });
    }
    return HttpResponse.json({ detail: "Seule une demande en attente s'annule." }, { status: 409 });
  }),

  // GET /api/me/groups-resume/ — points d'entrée Familles & Cercles (doc 13)
  http.get("*/api/me/groups-resume/", () => HttpResponse.json({ results: groupes })),

  // GET /api/me/rendez-vous/ — aperçu RDV du binôme (carte mini, PanneauMonAine T2)
  // Source unique : le store T3 (mêmes objets que /api/rendez-vous/).
  http.get("*/api/me/rendez-vous/", () => {
    const maintenant = new Date();
    const aVenir = rdvs
      .filter((r) => r.statut !== "passe" && new Date(r.dateHeure) >= maintenant)
      .sort((a, b) => new Date(a.dateHeure) - new Date(b.dateHeure));
    return HttpResponse.json({ results: aVenir });
  }),

  // POST /api/parrainages/:id/cloture/ — RG6 : clôture → avis requis
  http.post("*/api/parrainages/:id/cloture/", ({ params }) => {
    const id = Number(params.id);
    const idx = mesCadets.findIndex((b) => b.id === id);
    if (idx === -1) {
      return HttpResponse.json({ detail: "Parrainage introuvable." }, { status: 404 });
    }
    const [binome] = mesCadets.splice(idx, 1);
    historiqueRecus = [
      {
        id: binome.id,
        cadet: binome.autre,
        aine: utilisateurs[0],
        statut: "terminee",
        dateDemande: binome.dateDebut,
        dateReponse: new Date().toISOString(),
        motifRefus: null,
      },
      ...historiqueRecus,
    ];
    return HttpResponse.json({ ok: true, avisRequis: true });
  }),

  // POST /api/parrainages/:id/avis/ — RG6, UN seul avis par binôme (doc 07)
  http.post("*/api/parrainages/:id/avis/", ({ params }) => {
    const id = Number(params.id);
    const h = historiqueEnvoyes.find((x) => x.id === id) ?? historiqueRecus.find((x) => x.id === id);
    if (!h) return HttpResponse.json({ detail: "Parrainage introuvable." }, { status: 404 });
    if (h.avisDonne) return HttpResponse.json({ detail: "Un seul avis par parrainage." }, { status: 409 });
    h.avisDonne = true;
    return HttpResponse.json({ ok: true }, { status: 201 });
  }),

  ...t3Handlers,

  http.get("*/api/health/", () => HttpResponse.json({ statut: "ok" })),
];
