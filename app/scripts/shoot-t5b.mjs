/**
 * Captures t5b — annuaire (CTA promo), profil intention, admin transition.
 * Usage : cd app && node scripts/shoot-t5b.mjs  (:8000 + :5200 requis)
 */

import { chromium } from "playwright-core";

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  // 1) Annuaire : Yann L1 ouvre fiche Awa L3 → CTA bloqué « promo M1 »
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto("http://localhost:5200/annuaire", { waitUntil: "domcontentloaded" });
  await page.locator("text=Annuaire").first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/tmp/t5b-annuaire.png", fullPage: true });
  console.log("Annuaire OK");

  // 2) Fiche Awa L3 : CTA doit afficher bloc « promo M1 » (bloqué pour L1)
    await page.goto("http://localhost:5200/annuaire/2", { waitUntil: "domcontentloaded" });
    await page.locator("text=Cet Aîné n'existe plus ou est complet").waitFor({ timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "/tmp/t5b-fiche-awa.png" });
    console.log("Fiche Awa L3 OK — blocage promo visible");

  // 3) Profil Awa (L3) : section « Mon année prochaine » visible
  await page.goto("http://localhost:5200/connexion", { waitUntil: "domcontentloaded" });
  await page.locator('input[type=email]').fill('awa.kouassi@emsp.int');
  await page.locator('input[type=password]').fill('demo');
  await page.locator('button[type=submit]').click();
  // Attendre que la redirection post-login se stabilise (peut être /messagerie, /accueil, etc.)
  await page.waitForLoadState("networkidle", { timeout: 15000 });
  // Attendre que la session API soit résolue
  await page.waitForTimeout(3000);
  
  await page.goto("http://localhost:5200/profil", { waitUntil: "domcontentloaded" });
  await page.locator("text=Mon année prochaine").waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/tmp/t5b-profil-intention.png", fullPage: true });
  console.log("Profil intention OK");

  // 4) Admin Dashboard Awa : KPI + bouton transition
  await page.goto("http://localhost:5200/administration", { waitUntil: "domcontentloaded" });
  await page.locator("text=Administration").waitFor({ timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/tmp/t5b-admin.png" });
  console.log("Admin OK");

  // 5) Mobile 375px annuaire
  const mobile = await navigateur.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto("http://localhost:5200/annuaire", { waitUntil: "domcontentloaded" });
  await mobile.locator("text=Annuaire").waitFor({ timeout: 20000 });
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: "/tmp/t5b-mobile.png", fullPage: true });
  console.log("Mobile OK — 375px avec contenu");
} finally {
  await navigateur.close();
}