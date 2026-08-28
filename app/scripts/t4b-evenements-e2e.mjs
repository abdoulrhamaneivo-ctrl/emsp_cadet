/**
 * E2E doc 10 — événements sur backend Django réel, zéro MSW.
 * Ivo (inscrit au seed) ouvre la liste, la fiche, écrit dans la discussion,
 * se désiste puis se réinscrit (retour à l'état initial).
 * Usage : cd app && node scripts/t4b-evenements-e2e.mjs  (:8000 + :5200 requis)
 */

import { chromium } from "playwright-core";

const MESSAGE = `E2E t4b — question depuis la discussion ${new Date().toLocaleTimeString("fr-FR")}`;

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto("http://localhost:5200/evenements", { waitUntil: "domcontentloaded" });
  await page.locator("text=Événements").first().waitFor({ timeout: 20000 });
  await page.locator("text=Atelier SQL — jointures et agrégats").first().waitFor({ timeout: 10000 });
  console.log("REST OK — liste chargée depuis Django");

  // Fiche détail (Ivo est inscrit au seed → CTA « Inscrit — Se désister »)
  await page.locator("text=Atelier SQL — jointures et agrégats").first().click();
  await page.locator("text=Au programme").waitFor({ timeout: 10000 });
  await page.locator("text=Inscrit — Se désister").waitFor({ timeout: 10000 });
  console.log("DETAIL OK — fiche + état inscrit (seed)");

  // Discussion réservée aux inscrits : Ivo peut écrire
  await page.locator("#message-evenement").fill(MESSAGE);
  await page.locator("#message-evenement").press("Enter");
  await page.locator(`text=${MESSAGE}`).first().waitFor({ timeout: 10000 });
  console.log("DISCUSSION OK — message affiché (inscrit)");

  // Toggle désister → re-participer (retour à l'état initial 2/12)
  await page.locator('button:has-text("Se désister")').click();
  await page.locator('button:has-text("Je participe")').waitFor({ timeout: 10000 });
  console.log("DESISTEMENT OK — place libérée");
  await page.locator('button:has-text("Je participe")').click();
  await page.locator("text=Inscrit — Se désister").waitFor({ timeout: 10000 });
  console.log("REINSCRIPTION OK — état initial restauré");
  console.log("E2E t4b VERT");
} finally {
  await navigateur.close();
}
