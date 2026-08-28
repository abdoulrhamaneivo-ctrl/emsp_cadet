/**
 * E2E doc 09 — publication via la VRAIE UI sur backend Django réel, zéro MSW.
 * 1) Ivo ouvre /fil, ouvre le composeur, choisit Annonce, tape un contenu.
 * 2) Clic Publier → POST REST → revalidation → la publication apparaît.
 * 3) Il commente sa publication → POST commentaires.
 * Usage : cd app && node scripts/t4a-fil-e2e.mjs  (:8000 + :5200 requis)
 */

import { chromium } from "playwright-core";

const CONTENU = `E2E t4a — annonce de test ${new Date().toLocaleTimeString("fr-FR")}`;

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto("http://localhost:5200/fil", { waitUntil: "domcontentloaded" });
  await page.locator("text=Fil d'actualité").first().waitFor({ timeout: 20000 });
  await page.locator("text=Premier lab Packet Tracer").first().waitFor({ timeout: 10000 });
  console.log("REST OK — feed chargé depuis Django");

  // Composeur : ouvrir, taper, publier
  await page.locator("text=Partage une annonce, pose une question…").first().click();
  await page.locator('textarea[aria-label="Contenu de la publication"]').fill(CONTENU);
  await page.locator('button:has-text("Publier")').first().click();
  await page.locator(`text=${CONTENU}`).first().waitFor({ timeout: 10000 });
  console.log("PUBLIER OK — la publication apparaît dans le feed (POST + revalidation)");

  // Commenter sa propre publication (zone dépliée + envoi)
  const carte = page.locator("article", { hasText: CONTENU }).first();
  await carte.locator('button:has-text("Commenter")').click();
  await carte.locator("textarea").last().fill("Merci de lire jusqu'au bout !");
  await carte.locator('button[aria-label="Envoyer le commentaire"]').click();
  await carte.locator("text=Merci de lire jusqu'au bout !").waitFor({ timeout: 10000 });
  console.log("COMMENTER OK — commentaire affiché (idempotent, optimiste)");
  console.log("E2E t4a VERT");
} finally {
  await navigateur.close();
}
