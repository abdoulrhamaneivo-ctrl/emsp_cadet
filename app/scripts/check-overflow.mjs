import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
for (const [name, w, h] of [["mobile", 375, 812], ["tablette", 768, 1024], ["desktop", 1280, 800]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto("http://localhost:5200/annuaire", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  const iw = await page.evaluate(() => window.innerWidth);
  // trouve les éléments qui débordent
  const culprits = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 || r.left < -1) {
        const cls = (el.className && typeof el.className === "string") ? el.className.slice(0, 80) : "";
        out.push(`${el.tagName}.${cls} → right=${Math.round(r.right)}`);
      }
    });
    return out.slice(0, 8);
  });
  console.log(name, JSON.stringify({ sw, iw, ok: sw <= iw, culprits }));
  await page.close();
}
await browser.close();
