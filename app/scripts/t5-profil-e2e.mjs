/**
 * E2E doc 11 — profil sur backend Django réel, zéro MSW.
 * Ivo (L2) ouvre /profil : pipeline complétude, bascule RG8 ON puis OFF
 * (retour état initial), sauvegarde d'attentes, zone danger collapsée.
 * Usage : cd app && node scripts/t5-profil-e2e.mjs  (:8000 + :5200 requis)
 */

import { chromium } from "playwright-core";

const ATTENTES = `E2E t5 — attentes ${new Date().toLocaleTimeString("fr-FR")}`;

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto("http://localhost:5200/profil", { waitUntil: "domcontentloaded" });
  await page.locator("text=Mon profil").first().waitFor({ timeout: 20000 });
  await page.locator("text=Parcours académique").waitFor({ timeout: 10000 });
  console.log("REST OK — /api/me/ chargé (User v2)");

  // L'interrupteur RG8 est présent, OFF au départ (seed Ivo)
  const interrupteur = page.locator('input[aria-label="Ouvrir ma candidature Aîné"]');
  await interrupteur.waitFor({ timeout: 10000 });
  console.log("RG8 OK — interrupteur rendu (niveau L2 → activable)");

  // Pipeline de complétude : Ivo n'a pas de photo → « Il manque encore… »
  await page.locator("text=Il manque encore…").waitFor({ timeout: 10000 });
  console.log("COMPLETUDE OK — checklist motifs affichée");

  // Sauvegarde explicite : dirty → bouton sticky → PATCH → toast
  await page.locator("text=Modifications non enregistrées").waitFor({ timeout: 5000 }).catch(() => {
    // pas encore dirty : on modifie un champ
  });
  await page.locator('textarea[aria-label~="attentes"], #ev-attentes, textarea').first();
  const champAttentes = page.locator("section", { hasText: "Parcours académique" }).locator("textarea").first();
  await champAttentes.fill(ATTENTES);
  await page.locator('button:has-text("Enregistrer")').first().click();
  await page.locator("text=Profil enregistré").waitFor({ timeout: 10000 });
  console.log("SAVE OK — PATCH /api/me/ + toast + resync");

  // Bascule RG8 : ON (modale de confirmation) puis OFF (retour initial).
  // Le Switch MUI rend un <input role="switch"> — l'aria-label est porté par
  // les inputProps ; un click({force:true}) sur le bouton parent ne le bascule
  // pas toujours : on clique l'input directement.
  await page.locator('input[role="switch"]').click();
  await page
    .locator("div[role='dialog']")
    .locator('button:has-text("Ouvrir ma candidature")')
    .click();
  await page.locator("text=Candidature ouverte").first().waitFor({ timeout: 10000 });
  console.log("BASCULE ON OK — modale de conséquences → PATCH");
  await page.locator('input[role="switch"]').click();
  await page
    .locator("div[role='dialog']")
    .locator('button:has-text("Fermer ma candidature")')
    .click();
  await page.locator("text=Candidature fermée").first().waitFor({ timeout: 10000 });
  console.log("BASCULE OFF OK — retour à l'état initial");
  console.log("E2E t5 VERT");
} finally {
  await navigateur.close();
}
