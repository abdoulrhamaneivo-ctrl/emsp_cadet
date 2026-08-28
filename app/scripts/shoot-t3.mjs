/**
 * Captures T3 (docs 08/06) — messagerie + rendez-vous sur mocks MSW.
 * Usage : node scripts/shoot-t3.mjs  (serveur dev requis sur :5200,
 * .env.local : VITE_ENABLE_MOCKS=1 + VITE_DEMO_SESSION=1)
 * Sortie : /tmp/t3-*.png
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
  // Split-view desktop : /messagerie auto-navigue vers la 1re conversation (Awa Kouassi).
  await shoot(browser, {
    url: "/messagerie", width: 1280, height: 920,
    attendre: "text=Awa Kouassi", sortie: "/tmp/t3-messagerie-desktop.png",
  });
  // Liste RDV + bannière J-1 (RDV 401 confirmé demain 14h) en haut du shell.
  await shoot(browser, {
    url: "/rendez-vous", width: 1280, height: 940,
    attendre: "text=Rendez-vous", sortie: "/tmp/t3-rendez-vous.png",
  });
  // Détail d'une proposition reçue (403, Awa organisatrice → boutons réponse).
  await shoot(browser, {
    url: "/rendez-vous/403", width: 1280, height: 940,
    attendre: "text=Séance sous-réseaux", sortie: "/tmp/t3-rendez-vous-detail.png",
  });
  // Mobile : liste conversations avec badge non-lus sidebar.
  await shoot(browser, {
    url: "/messagerie", width: 375, height: 860,
    attendre: "text=Awa Kouassi", sortie: "/tmp/t3-messagerie-mobile.png",
  });
} finally {
  await browser.close();
}
