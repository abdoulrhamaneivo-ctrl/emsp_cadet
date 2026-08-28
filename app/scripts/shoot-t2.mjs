/**
 * Captures T2 (doc 05) — /mes-demandes et /mon-parrainage.
 * Usage : node scripts/shoot-t2.mjs  (serveur dev requis sur :5200)
 * Sortie : /tmp/t2-*.png
 */
import { chromium } from "playwright-core";

const BASE = "http://localhost:5200";
const EXEC = "/usr/bin/chromium";

async function shoot(browser, { url, width, height, attendre, sortie, avant }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await page.waitForSelector(attendre, { timeout: 9000 });
  if (avant) await avant(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: sortie });
  await page.close();
  console.log(`ok ${sortie}`);
}

const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox"] });
try {
  await shoot(browser, {
    url: "/mes-demandes", width: 1280, height: 900,
    attendre: "text=Mes demandes", sortie: "/tmp/t2-demandes-envoyees.png",
  });
  await shoot(browser, {
    url: "/mes-demandes", width: 1280, height: 920,
    attendre: "text=Mes demandes",
    avant: (page) => page.getByRole("tab", { name: /reçues/i }).click(),
    sortie: "/tmp/t2-demandes-recues.png",
  });
  await shoot(browser, {
    url: "/mon-parrainage", width: 1280, height: 960,
    attendre: "text=Mon parrainage", sortie: "/tmp/t2-mon-parrainage.png",
  });
  await shoot(browser, {
    url: "/mes-demandes", width: 375, height: 860,
    attendre: "text=Mes demandes", sortie: "/tmp/t2-mobile.png",
  });
} finally {
  await browser.close();
}
