/**
 * E2E bascule T3b (doc 21 §10) — backend Django réel, zéro MSW.
 * 1) /messagerie se charge via le proxy Vite (auto-connexion démo → REST réel).
 * 2) Le fil de la conv privée affiche l'historique seedé.
 * 3) Awa envoie un message via le backend → il apparaît EN DIRECT (WS), sans rechargement.
 * Usage : cd app && node scripts/t3b-e2e.mjs   (backend :8000 + vite :5200 requis)
 */

import { chromium } from "playwright-core";

const CONTENU_WS = `E2E T3b temps réel — ${new Date().toLocaleTimeString("fr-FR")}`;

const reponse = await fetch("http://localhost:8000/api/auth/connexion/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "awa.kouassi@emsp.int", password: "demo" }),
});
if (!reponse.ok) throw new Error(`Connexion Awa impossible (${reponse.status})`);
const { access } = await reponse.json();

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 920 } });

  // 1) La messagerie se charge depuis le VRAI backend (auto-connexion démo).
  await page.goto("http://localhost:5200/messagerie", { waitUntil: "domcontentloaded" });
  await page.locator("text=Awa Kouassi").first().waitFor({ timeout: 20000 });

  // 2) Le fil de la conversation privée charge l'historique seedé.
  await page.locator("text=Awa Kouassi").first().click();
  await page
    .locator("text=Parfait, on fait ça demain à 14h !")
    .first()
    .waitFor({ timeout: 10000 });
  console.log("REST OK — messagerie rendue depuis Django (proxy Vite, sans MSW)");

  // 3) Awa POST sur le backend → le message doit apparaître SANS rechargement (WS).
  const poste = await fetch("http://localhost:8000/api/conversations/1/messages/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
    body: JSON.stringify({ contenu: CONTENU_WS, idempotencyKey: `e2e-${Date.now()}` }),
  });
  if (poste.status !== 201) throw new Error(`POST message: ${poste.status}`);
  await page.locator(`text=${CONTENU_WS}`).first().waitFor({ timeout: 10000 });
  console.log("WS OK — message.new reçu en direct, sans rechargement");

  await page.screenshot({ path: "/tmp/t3b-e2e.png" });
  console.log("Capture : /tmp/t3b-e2e.png");
} finally {
  await navigateur.close();
}
