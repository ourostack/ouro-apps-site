// Real-browser check that no desktop hero crops much of its scene away (taste
// review r8, 2026-11-06: a 46vh cap cut Ouro's body off on /apps/ouro-md/ at
// 1440 and 1920). Serves dist/, measures each page's hero box at 1024, 1440
// and 1920 and fails if it shows less than 80% of the art's own height at that
// width (object-fit: cover at the full width, so the rest is cropped away).
// Also checks that nothing on the page scrolls sideways at 320.
//
//   npm run build && node scripts/hero-crop.mjs
//
// Uses Playwright's bundled chromium (CI installs it for ui-checks); override
// locally with CHROME_PATH.

import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist", import.meta.url));
const PORT = 6199;
const PAGES = ["/apps/ouro-md/"];
const MAX_CROP = 0.2;
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };

const server = createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(DIST, path));
    res.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(PORT, resolve));

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const failures = [];
try {
  for (const path of PAGES) {
    for (const [width, height] of [[1024, 768], [1440, 900], [1920, 1080], [320, 640]]) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      // The scene's bytes come from ouroboros.bot; the box's size does not depend on them.
      await page.route(/^https:\/\/ouroboros\.bot\//, (route) => route.abort());
      await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "domcontentloaded" });
      const m = await page.evaluate(() => {
        const img = document.querySelector(".story-hero img");
        if (!img) return null;
        const r = img.getBoundingClientRect();
        const natural = (r.width * Number(img.getAttribute("height"))) / Number(img.getAttribute("width"));
        return { box: r.height, natural, overflow: document.documentElement.scrollWidth - window.innerWidth };
      });
      if (!m) failures.push(`${path}: no hero`);
      else if (width > 640) {
        const crop = 1 - m.box / m.natural;
        console.log(JSON.stringify({ path, width, height, box: Math.round(m.box), natural: Math.round(m.natural), crop: +(crop * 100).toFixed(1) }));
        if (crop > MAX_CROP) failures.push(`${path} at ${width}x${height}: the hero crops ${(crop * 100).toFixed(1)}% of its scene`);
      } else if (m.overflow > 0) failures.push(`${path} at ${width}px scrolls ${m.overflow}px sideways`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("hero crop: ok");
