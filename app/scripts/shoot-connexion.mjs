/**
 * Captures Connexion (P02, doc 02 §5) — desktop + mobile, 3 états :
 * vide / erreur 401 / formulaire rempli.
 * Chemin réel : démo auto-login → /messagerie → clic « Quitter » → /connexion.
 * Usage : cd app && node scripts/shoot-connexion.mjs  (vite :5200 requis)
 */

import { chromium } from "playwright-core";

const BASE = "http://localhost:5200";
const VUES = [
  { nom: "desktop", largeur: 1280, hauteur: 920 },
  { nom: "mobile", largeur: 375, hauteur: 860 },
];

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  for (const { nom, largeur, hauteur } of VUES) {
    const page = await navigateur.newPage({
      viewport: { width: largeur, height: hauteur },
      deviceScaleFactor: 2,
    });

    // 1) Démo auto-login → /messagerie, puis déconnexion réelle → /connexion.
    await page.goto(`${BASE}/connexion`, { waitUntil: "domcontentloaded" });
    // Attendre un texte de CONTENU (leçon T3a — jamais un libellé de nav).
    await page.locator("text=Awa Kouassi").first().waitFor({ timeout: 20000 });
    if (nom === "mobile") {
      // Le burger vit dans la bottom-nav sous le libellé « Plus ».
      await page.getByRole("button", { name: "Plus" }).click();
      await page.getByRole("button", { name: /Quitter/i }).waitFor({ timeout: 5000 });
    }
    await page.getByRole("button", { name: /Quitter/i }).click({ force: true });
    await page.locator("text=Se connecter").first().waitFor({ timeout: 15000 });
    // Laisser le fade-out du backdrop du drawer se terminer (sinon voile sombre
    // en plein écran sur la capture — course d'animation, pas un bug d'app).
    await page.waitForTimeout(500);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `/tmp/cx-${nom}-vide.png` });
    console.log(`cx-${nom}-vide.png`);

    // 2) Erreur 401 : e-mail valide + mot de passe faux.
    await page.locator("#connexion-email").fill("ivo.abdoul@emsp.int");
    await page.locator("#connexion-mot-de-passe").fill("faux");
    await page.getByRole("button", { name: /Se connecter/ }).click();
    await page.locator('[role="alert"]').first().waitFor({ timeout: 10000 });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `/tmp/cx-${nom}-erreur.png` });
    console.log(`cx-${nom}-erreur.png`);

    // 3) Formulaire rempli prêt à partir (compte de démo cliqué).
    await page.getByRole("button", { name: /ivo\.abdoul/ }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `/tmp/cx-${nom}-rempli.png` });
    console.log(`cx-${nom}-rempli.png`);
    await page.close();
  }
} finally {
  await navigateur.close();
}
