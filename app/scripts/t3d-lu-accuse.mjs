/**
 * E2E doc 08 §2 — accusé de lecture temps réel (T3d), backend Django réel, zéro MSW.
 * 1) Ivo (navigateur) ouvre /messagerie/1 et ENVOIE un message par la vraie UI.
 * 2) Awa (REST direct) marque lu jusqu'à ce message (PATCH /lu/).
 * 3) Le CheckCheck or (« Lu ») doit apparaître EN DIRECT chez Ivo (WS message.lu).
 * Usage : cd app && node scripts/t3d-lu-accuse.mjs  (:8000 + :5200 requis)
 */

import { chromium } from "playwright-core";

const CONTENU = `Lu-accusé E2E — ${new Date().toLocaleTimeString("fr-FR")}`;

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

  // 2) Ivo envoie par la VRAIE interface (textarea + Entrée → POST idempotent).
  await page.locator("#zone-message").fill(CONTENU);
  await page.locator("#zone-message").press("Enter");
  await page.locator(`text=${CONTENU}`).first().waitFor({ timeout: 10000 });
  console.log("ENVOI OK — bulle Ivo affichée (optimiste → confirmée par REST)");

  // 3) Awa marque lu JUSQU'À ce message (REST direct, elle n'a pas de navigateur ici).
  const liste = await fetch("http://localhost:8000/api/conversations/1/messages/", {
    headers: hAwa,
  }).then((r) => r.json());
  const cible = liste.results.find((m) => m.contenu === CONTENU);
  if (!cible) throw new Error("Message introuvable côté Awa");
  const lu = await fetch("http://localhost:8000/api/conversations/1/lu/", {
    method: "PATCH",
    headers: hAwa,
    body: JSON.stringify({ dernierMessageId: cible.id }),
  });
  if (!lu.ok) throw new Error(`PATCH /lu/ : ${lu.status}`);
  console.log(`PATCH /lu/ Awa → ${lu.status} (jusquaMessageId=${cible.id})`);

  // 4) Le ✓✓ or doit arriver EN DIRECT sur la bulle d'Ivo via WS message.lu.
  await page.locator('[aria-label="Lu"]').first().waitFor({ timeout: 10000 });
  console.log("WS OK — accusé « lu » (CheckCheck or) reçu en direct");
  await page.screenshot({ path: "/tmp/t3d-lu-accuse.png" });
  console.log("Capture : /tmp/t3d-lu-accuse.png");
} finally {
  await navigateur.close();
}
