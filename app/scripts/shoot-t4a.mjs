/**
 * Captures du Fil (t4a) — desktop + mobile, scénario complet sur backend réel.
 * Usage : cd app && node scripts/shoot-t4a.mjs  (:8000 + :5200 requis)
 */

import { chromium } from "playwright-core";

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  // Desktop : feed + composeur ouvert
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto("http://localhost:5200/fil", { waitUntil: "domcontentloaded" });
  await page.locator("text=Fil d'actualité").first().waitFor({ timeout: 20000 });
  await page.locator("text=Premier lab Packet Tracer").first().waitFor({ timeout: 10000 });
  await page.screenshot({ path: "/tmp/t4a-fil-desktop.png" });
  console.log("Desktop OK — feed chargé depuis Django");

  // Ouvrir les commentaires de la publication du lab (2 commentaires)
  await page.locator('button:has-text("2 commentaires")').first().click();
  await page.locator("text=Bravo ! On attaque le subnetting").first().waitFor({ timeout: 5000 });
  // Laisser finir l'animation d'expansion (height 0→auto, 200 ms) — leçon T3c :
  // capturer pendant une animation fausse le verdict vision.
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/tmp/t4a-fil-commentaires.png" });
  console.log("Commentaires OK — zone dépliée avec réponses");

  // Mobile 375px — attendre le CONTENU réel (jamais capturer les squelettes)
  const mobile = await navigateur.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto("http://localhost:5200/fil", { waitUntil: "domcontentloaded" });
  await mobile.locator("text=Fil d'actualité").first().waitFor({ timeout: 20000 });
  await mobile.locator("text=Premier lab Packet Tracer").first().waitFor({ timeout: 10000 });
  await mobile.screenshot({ path: "/tmp/t4a-fil-mobile.png" });
  console.log("Mobile OK — capture 375px avec contenu");
} finally {
  await navigateur.close();
}
