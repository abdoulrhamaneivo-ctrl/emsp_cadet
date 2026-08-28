/**
 * Captures Événements (t4b) — liste desktop, fiche, mobile 375px.
 * Usage : cd app && node scripts/shoot-t4b.mjs  (:8000 + :5200 requis)
 */

import { chromium } from "playwright-core";

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto("http://localhost:5200/evenements", { waitUntil: "domcontentloaded" });
  await page.locator("text=Événements").first().waitFor({ timeout: 20000 });
  await page.locator("text=Atelier SQL").first().waitFor({ timeout: 10000 });
  await page.screenshot({ path: "/tmp/t4b-evenements-liste.png" });
  console.log("Liste OK");

  await page.locator("text=Atelier SQL").first().click();
  await page.locator("text=Au programme").waitFor({ timeout: 10000 });
  await page.waitForTimeout(500); // fin des animations d'entrée (leçon §9.9)
  await page.screenshot({ path: "/tmp/t4b-evenement-detail.png" });
  console.log("Fiche OK");

  const mobile = await navigateur.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto("http://localhost:5200/evenements", { waitUntil: "domcontentloaded" });
  // Mobile : le lien « Événements » vit dans le drawer fermé → attendre un
  // texte de CONTENU (leçon §9.7 : jamais un libellé de nav).
  await mobile.locator("text=Atelier SQL").first().waitFor({ timeout: 15000 });
  await mobile.waitForTimeout(400);
  await mobile.screenshot({ path: "/tmp/t4b-evenements-mobile.png" });
  console.log("Mobile OK — capture 375px avec contenu");
} finally {
  await navigateur.close();
}
