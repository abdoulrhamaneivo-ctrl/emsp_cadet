/**
 * Handlers MSW T3a (docs 08+06) — messagerie + RDV.
 * État mock : store-t3.js (source unique). Backend Django/Channels attendu en
 * T3b — le contrat REST et WS est déjà exactement celui des specs.
 */

import { http, HttpResponse } from "msw";
import { utilisateurs } from "./utilisateurs.js";
import {
  allouerMessageId,
  conversations,
  messagesParConversation,
  plusRecentsDAbord,
  publierWS,
  rdvs,
} from "./store-t3.js";

let prochaineRdvId = 500;

export const t3Handlers = [
  // ── MESSAGERIE (doc 08 §2) ────────────────────────────────────────────────
  // GET /api/conversations/ — une par binôme actif + familles/cercles
  http.get("*/api/conversations/", () =>
    HttpResponse.json({ results: plusRecentsDAbord(conversations) }),
  ),

  // GET /api/conversations/:id/messages/?avant= — pagination curseur descendante
  http.get("*/api/conversations/:id/messages/", ({ params, request }) => {
    const id = Number(params.id);
    const messages = messagesParConversation[id];
    if (!messages) {
      return HttpResponse.json({ detail: "Conversation inconnue." }, { status: 404 });
    }
    const url = new URL(request.url);
    const avant = url.searchParams.get("avant");
    const taillePage = 8;
    let liste = [...messages].sort((a, b) => b.id - a.id);
    if (avant) liste = liste.filter((m) => m.id < Number(avant));
    const page = liste.slice(0, taillePage);
    return HttpResponse.json({
      hasMore: liste.length > taillePage,
      cursor: page.length ? page[page.length - 1].id : null,
      results: page.map((m) => ({ ...m, conversationId: id, envoyeParMoi: m.auteurId === 1 })),
    });
  }),

  // POST /api/conversations/:id/messages/ — {contenu, idempotencyKey} → 201 Message
  http.post("*/api/conversations/:id/messages/", async ({ params, request }) => {
    const id = Number(params.id);
    if (!messagesParConversation[id]) {
      return HttpResponse.json({ detail: "Conversation inconnue." }, { status: 404 });
    }
    const corps = await request.json();
    const { contenu, idempotencyKey } = corps;
    if (!contenu?.trim()) {
      return HttpResponse.json({ detail: "Le message ne peut pas être vide." }, { status: 422 });
    }
    // Règle 1 doc 08 : clé déjà vue → même message renvoyé, zéro doublon
    const doublon = messagesParConversation[id].find((m) => m.idempotencyKey === idempotencyKey);
    if (doublon) return HttpResponse.json(doublon, { status: 201 });
    const message = {
      id: allouerMessageId(),
      conversationId: id,
      contenu: contenu.trim(),
      dateEnvoi: new Date().toISOString(),
      auteurId: 1,
      envoyeParMoi: true,
      idempotencyKey,
    };
    messagesParConversation[id].push(message);
    const conv = conversations.find((c) => c.id === id);
    if (conv) conv.dernierMessage = { contenu: message.contenu, dateEnvoi: message.dateEnvoi };
    publierWS({ type: "message.new", conversationId: id, message });
    return HttpResponse.json(message, { status: 201 });
  }),

  // PATCH /api/conversations/:id/lu/ — {dernierMessageId} accusé de lecture
  http.patch("*/api/conversations/:id/lu/", ({ params }) => {
    const id = Number(params.id);
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return HttpResponse.json({ detail: "Conversation inconnue." }, { status: 404 });
    conv.nonLus = 0;
    return HttpResponse.json({ ok: true });
  }),

  // ── RDV (doc 06 §2) ───────────────────────────────────────────────────────
  // GET /api/rendez-vous/?scope=a_venir|passes&page=
  http.get("*/api/rendez-vous/", ({ request }) => {
    const url = new URL(request.url);
    const scope = url.searchParams.get("scope") ?? "a_venir";
    const maintenant = Date.now();
    const elabore = rdvs.map((r) => ({ ...r, organisateurMoi: r.organisateur.id === 1 }));
    const correspond = (r) => {
      const passe = new Date(r.dateHeure).getTime() < maintenant;
      if (scope === "passes") return passe || ["passe", "refuse", "annule"].includes(r.statut);
      return !passe && ["propose", "confirme", "contre_propose"].includes(r.statut);
    };
    const resultats = elabore.filter(correspond).sort((a, b) => a.dateHeure.localeCompare(b.dateHeure));
    return HttpResponse.json({ count: resultats.length, results: resultats });
  }),

  // POST /api/rendez-vous/ — proposition (403 hors binôme)
  http.post("*/api/rendez-vous/", async ({ request }) => {
    const corps = await request.json();
    const invite = utilisateurs.find((u) => u.id === corps.inviteId);
    if (!invite) {
      return HttpResponse.json({ detail: "Invité introuvable ou hors binôme." }, { status: 403 });
    }
    const rdv = {
      id: prochaineRdvId++,
      organisateur: utilisateurs[0],
      invite,
      titre: corps.titre,
      description: corps.description ?? null,
      dateHeure: corps.dateHeure,
      lieu: corps.lieu,
      mode: corps.mode,
      statut: "propose",
      contreProposition: null,
    };
    rdvs.push(rdv);
    return HttpResponse.json({ ...rdv, organisateurMoi: true }, { status: 201 });
  }),

  // PATCH /api/rendez-vous/:id/repondre/ — {decision: confirme|refuse} (invité)
  http.patch("*/api/rendez-vous/:id/repondre/", async ({ params, request }) => {
    const rdv = rdvs.find((r) => r.id === Number(params.id));
    if (!rdv) return HttpResponse.json({ detail: "RDV introuvable." }, { status: 404 });
    const { decision } = await request.json();
    if (!["confirme", "refuse"].includes(decision)) {
      return HttpResponse.json({ detail: "Décision inconnue." }, { status: 422 });
    }
    // Le contre-proposant attend la décision de l'organisateur (doc 06 §2) :
    // confirmer = reprendre SON créneau ; refuser = statut refuse.
    if (rdv.statut === "contre_propose" && decision === "confirme" && rdv.contreProposition) {
      rdv.dateHeure = rdv.contreProposition.dateHeure;
      rdv.lieu = rdv.contreProposition.lieu;
      rdv.contreProposition = null;
    }
    rdv.statut = decision;
    return HttpResponse.json(rdv);
  }),

  // POST /api/rendez-vous/:id/contre-proposition/ — {dateHeure, lieu} → contre_propose
  http.post("*/api/rendez-vous/:id/contre-proposition/", async ({ params, request }) => {
    const rdv = rdvs.find((r) => r.id === Number(params.id));
    if (!rdv) return HttpResponse.json({ detail: "RDV introuvable." }, { status: 404 });
    const corps = await request.json();
    rdv.statut = "contre_propose";
    rdv.contreProposition = { dateHeure: corps.dateHeure, lieu: corps.lieu };
    return HttpResponse.json(rdv);
  }),

  // PATCH /api/rendez-vous/:id/annuler/
  http.patch("*/api/rendez-vous/:id/annuler/", ({ params }) => {
    const rdv = rdvs.find((r) => r.id === Number(params.id));
    if (!rdv) return HttpResponse.json({ detail: "RDV introuvable." }, { status: 404 });
    rdv.statut = "annule";
    return HttpResponse.json(rdv);
  }),

  // GET /api/rendez-vous/prochain/ — bannière J-1 (confirme < 48h, rappel non vu).
  // Déclaré AVANT :id/ — MSW premier-match-gagne, sinon "prochain" serait avalé par :id.
  http.get("*/api/rendez-vous/prochain/", () => {
    const maintenant = Date.now();
    const prochain = rdvs
      .filter((r) => r.statut === "confirme" && !r.rappelVu)
      .filter((r) => {
        const delta = new Date(r.dateHeure).getTime() - maintenant;
        return delta > 0 && delta <= 48 * 3600 * 1000;
      })
      .sort((a, b) => a.dateHeure.localeCompare(b.dateHeure))[0];
    return HttpResponse.json({ result: prochain ?? null });
  }),

  // GET /api/rendez-vous/:id/ — page détail (doc 06 §5)
  http.get("*/api/rendez-vous/:id/", ({ params }) => {
    const rdv = rdvs.find((r) => r.id === Number(params.id));
    if (!rdv) return HttpResponse.json({ detail: "RDV introuvable." }, { status: 404 });
    return HttpResponse.json({ ...rdv, organisateurMoi: rdv.organisateur.id === 1 });
  }),

  // PATCH /api/rendez-vous/:id/rappel-vu/
  http.patch("*/api/rendez-vous/:id/rappel-vu/", ({ params }) => {
    const rdv = rdvs.find((r) => r.id === Number(params.id));
    if (rdv) rdv.rappelVu = true;
    return HttpResponse.json({ ok: true });
  }),
];
