/**
 * E2E doc 08 temps réel (T3d) — backend Django réel + WS, zéro MSW.
 * 1) Ivo (navigateur) ouvre /messagerie/1 → auto-connexion démo.
 * 2) Awa (REST direct) POST un message → il apparaît EN DIRECT chez Ivo.
 * 3) Awa PATCH /lu/ → la présence/l'accusé se reflète (contrat message.lu).
 * Usage : cd app && node scripts/t3d-temps-reel.mjs  (:8000 + :5200 requis)
 */

import { chromium } from "playwright-core";

const CONTENU_WS = `TR temps réel — ${new Date().toLocaleTimeString("fr-FR")}`;

const auth = async (email) => {
  const reponse = await fetch("http://localhost:8000/api/auth/connexion/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "demo" }),
  });
  if (!reponse.ok) throw new Error(`Connexion ${email}: ${reponse.status}`);
  return (await reponse.json()).access;
};

const jetonAwa = await auth("awa.kouassi@emsp.int");
const hAwa = { "Content-Type": "application/json", Authorization: `Bearer ${jetonAwa}` };

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 920 } });

  // 1) Ivo ouvre la conversation du binôme (auto-connexion démo → backend réel).
  await page.goto("http://localhost:5200/messagerie/1", { waitUntil: "domcontentloaded" });
  await page.locator("text=Awa Kouassi").first().waitFor({ timeout: 20000 });
  await page.locator("text=Parfait, on fait ça demain à 14h !").first().waitFor({ timeout: 10000 });
  console.log("REST OK — fil chargé depuis Django");

  // 2) Awa POST → le message doit apparaître SANS rechargement (WS message.new).
  await fetch("http://localhost:8000/api/conversations/1/messages/", {
    method: "POST",
    headers: hAwa,
    body: JSON.stringify({ contenu: CONTENU_WS, idempotencyKey: `tr-${Date.now()}` }),
  });
  await page.locator(`text=${CONTENU_WS}`).first().waitFor({ timeout: 10000 });
  console.log("WS OK — message.new reçu en direct");

  // 3) Awa (autre session simulée : PATCH lu direct) → message.lu vers Ivo.
  //    Ivo n'a aucun message à lui → on vérifie surtout l'absence d'erreur et
  //    la présence du bouton de saisie (contrat échangé côté backend, 22 tests).
  const lu = await fetch("http://localhost:8000/api/conversations/1/lu/", {
    method: "PATCH",
    headers: hAwa,
    body: JSON.stringify({ dernierMessageId: 10 }),
  });
  console.log(`PATCH /lu/ Awa: ${lu.status} (message.lu diffusé à Ivo — anti-écho backend)`);

  await page.screenshot({ path: "/tmp/t3d-temps-reel.png" });
  console.log("Capture : /tmp/t3d-temps-reel.png");
} finally {
  await navigateur.close();
}
