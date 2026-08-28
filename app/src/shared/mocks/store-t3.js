/**
 * Store mock T3 (docs 08+06) — partagé entre les handlers MSW (REST) et le
 * simulateur WS (temps réel de démonstration), mutable via les endpoints.
 *
 * Cohérence avec l'état T2 : le binôme Ivo ↔ Awa (id 2) est accepté côté démo,
 * donc conversation privée + famille commune + RDV proposé par Awa.
 * NB : Yann (id 12) et Salim (id 13) sont définis dans handlers.js — la famille
 * n'y référence que des ids, jamais d'objets importés en dur ici.
 */

import { utilisateurs } from "./utilisateurs.js";

/** Tri par date décroissante. */
const plusRecent = (cle) => (a, b) => new Date(b[cle]) - new Date(a[cle]);

// ── Conversations : une par binôme actif + famille commune ────────────────
export let conversations = [
  {
    id: 101,
    type: "prive",
    interlocuteur: utilisateurs[1], // Awa Kouassi — binôme accepté en démo
    dernierMessage: { contenu: "Parfait, on fait ça demain à 14h !", dateEnvoi: "2026-08-26T14:32:00" },
    nonLus: 3,
  },
  {
    id: 501,
    type: "groupe_famille",
    groupe: {
      titre: "Ta famille — toi & tes cadets",
      iconeCode: "users",
      membres: [utilisateurs[0], { id: 12, prenom: "Yann", nom: "Gbagbo" }, { id: 13, prenom: "Salim", nom: "Cissé" }],
      proprietaireId: 1,
    },
    dernierMessage: { contenu: "Bienvenue Salim !", dateEnvoi: "2026-08-25T18:06:00" },
    nonLus: 0,
  },
];

// ── Messages — historique de démo de la conversation binôme 101 ───────────
export let messagesParConversation = {
  101: [
    { id: 1, contenu: "Bonjour Ivo ! Contente que tu aies accepté — on construit ça ensemble.", dateEnvoi: "2026-08-24T10:02:00", auteurId: 2 },
    { id: 2, contenu: "Merci Awa ! Je débute en réseaux, ton parcours me parle beaucoup.", dateEnvoi: "2026-08-24T10:05:00", auteurId: 1 },
    { id: 3, contenu: "On commence par quoi selon toi ?", dateEnvoi: "2026-08-24T10:06:00", auteurId: 1 },
    { id: 4, contenu: "On va poser les bases : le modèle OSI, puis un petit lab Packet Tracer. Je prépare un plan.", dateEnvoi: "2026-08-24T10:12:00", auteurId: 2 },
    { id: 5, contenu: "Au top, merci !", dateEnvoi: "2026-08-24T10:13:00", auteurId: 1 },
    { id: 6, contenu: "Petit devoir : regarde la vidéo sur le modèle OSI avant notre séance.", dateEnvoi: "2026-08-25T17:58:00", auteurId: 2 },
    { id: 7, contenu: "C'est noté, je regarde ça ce soir.", dateEnvoi: "2026-08-25T18:10:00", auteurId: 1 },
    { id: 8, contenu: "Je peux te proposer un créneau jeudi 14h en salle B12 ?", dateEnvoi: "2026-08-26T09:20:00", auteurId: 2 },
    { id: 9, contenu: "Jeudi 14h ça me va parfaitement.", dateEnvoi: "2026-08-26T12:04:00", auteurId: 1 },
    { id: 10, contenu: "Parfait, on fait ça demain à 14h !", dateEnvoi: "2026-08-26T14:32:00", auteurId: 2 },
  ],
  501: [
    { id: 20, contenu: "Bienvenue dans la famille, Salim !", dateEnvoi: "2026-08-25T18:06:00", auteurId: 9 },
  ],
};

// ── RDV (doc 06) — machine à états propose→confirme→… ─────────────────────
/** Demain 14h, recalculé au chargement des mocks : le RDV confirmé reste
 * < 48h dans le futur, donc la bannière J-1 reste vivante en démo quel que
 * soit le jour d'ouverture (et colle au dernier message de la conv 101). */
const demain14h = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(14, 0, 0, 0);
  return d.toISOString();
})();

export let rdvs = [
  {
    id: 401,
    organisateur: utilisateurs[1], // Awa propose
    invite: utilisateurs[0],       // Ivo répond
    titre: "Première séance — modèle OSI",
    description: "Intro réseaux + petit lab Packet Tracer. Apporte ton PC.",
    dateHeure: demain14h,
    lieu: "Salle B12",
    mode: "presentiel",
    statut: "confirme",
    contreProposition: null,
  },
  {
    id: 402,
    organisateur: utilisateurs[0], // Ivo propose
    invite: utilisateurs[1],
    titre: "Point sur le lab Packet Tracer",
    description: null,
    dateHeure: "2026-08-20T15:00:00",
    lieu: "Bibliothèque",
    mode: "presentiel",
    statut: "passe",
    contreProposition: null,
  },
  {
    id: 403,
    organisateur: utilisateurs[1],
    invite: utilisateurs[0],
    titre: "Séance sous-réseaux",
    description: "Exercices de subnetting.",
    dateHeure: "2026-09-02T10:00:00",
    lieu: "Visio",
    mode: "visio",
    statut: "propose",
    contreProposition: null,
  },
];

// ── Simulateur WS — abonnés aux événements temps réel ─────────────────────
const abonnesWS = new Set();

/** Abonne un listener ; renvoie la fonction de désabonnement. */
export function abonnerWS(listener) {
  abonnesWS.add(listener);
  return () => abonnesWS.delete(listener);
}

/** Publie un événement WS à tous les abonnés (contrat doc 08 §2). */
export function publierWS(evenement) {
  abonnesWS.forEach((listener) => listener(evenement));
}

/** Préfixe d'id pour les messages créés via POST (jamais de collision démo). */
let prochaineMessageId = 1000;

/** Alloue un id de message (les handlers MSW ne mutent jamais un import). */
export function allouerMessageId() {
  return prochaineMessageId++;
}

export function plusRecentsDAbord(liste, cle = "dateEnvoi") {
  return [...liste].sort(plusRecent(cle));
}

