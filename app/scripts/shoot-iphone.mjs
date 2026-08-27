/**
 * Captures déterministes de la passe « qualité iPhone » — T1.
 * Usage : node scripts/shoot-iphone.mjs  (serveur dev requis sur :5200)
 * Sortie : /tmp/iphone-{annuaire,fiche,mobile}.png
 */
import { chromium } from "playwright-core";

const BASE = "http://localhost:5200";
const EXEC = "/usr/bin/chromium";

async function shoot(browser, { url, width, height, attendre, sortie }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await page.waitForSelector(attendre, { timeout: 9000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: sortie });
  await page.close();
  console.log(`ok ${sortie}`);
}

const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox"] });
try {
  await shoot(browser, {
    url: "/annuaire", width: 1280, height: 860,
    attendre: "text=Suggestions pour toi", sortie: "/tmp/iphone-annuaire.png",
  });
  await shoot(browser, {
    url: "/annuaire/2", width: 1280, height: 900,
    attendre: "text=Parrainage", sortie: "/tmp/iphone-fiche.png",
  });
  await shoot(browser, {
    url: "/annuaire", width: 375, height: 860,
    attendre: "text=Suggestions pour toi", sortie: "/tmp/iphone-mobile.png",
  });
} finally {
  await browser.close();
}
