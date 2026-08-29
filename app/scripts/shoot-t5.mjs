/**
 * Captures Profil (t5) — desktop + mobile 375px.
 * Usage : cd app && node scripts/shoot-t5.mjs  (:8000 + :5200 requis)
 */

import { chromium } from "playwright-core";

const navigateur = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await navigateur.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto("http://localhost:5200/profil", { waitUntil: "domcontentloaded" });
  await page.locator("text=Parcours académique").waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  // Pleine page : le bas (candidature + vitrine + zone danger) doit être visible
  await page.screenshot({ path: "/tmp/t5-profil-desktop.png", fullPage: true });
  console.log("Desktop OK (pleine page)");

  // Zone danger dépliée (elle vit en bas — scroll + expansion)
  await page.locator('button:has-text("Supprimer mon compte")').click();
  await page.locator("text=Cette action est définitive").waitFor({ timeout: 5000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/t5-profil-danger.png" });
  console.log("Zone danger OK");

  const mobile = await navigateur.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto("http://localhost:5200/profil", { waitUntil: "domcontentloaded" });
  await mobile.locator("text=Parcours académique").waitFor({ timeout: 20000 });
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: "/tmp/t5-profil-mobile.png" });
  console.log("Mobile OK — 375px avec contenu");
} finally {
  await navigateur.close();
}
