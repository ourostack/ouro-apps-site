// Real-browser check that no desktop hero crops much of its scene away (taste
// review r8, 2026-11-06: a 46vh cap cut Ouro's body off on /apps/ouro-md/ at
// 1440 and 1920). Serves dist/, measures each page's hero box at 1024, 1440
// and 1920 and fails if it shows less than 80% of the art's own height at that
// width (object-fit: cover at the full width, so the rest is cropped away).
// It also fails if the bottom fade reaches Ouro (taste review r10): his lowest
// point, FOOT of the art's height (ouroboros.bot castFoot['ouro-md']), must keep
// at least 90% opacity under the mask, with the drift at its fullest (80%
// until taste review r11). It fails, too, when a frame, video or screenshot
// starts above the foot of the hero (taste review r11: ouroboros.bot's demo
// windows started 8px inside the meadow; this page's window starts just below
// it, and must stay there), the same check as ouroboros.bot's
// scripts/hero-joins.mjs. It fails when the hero's box runs past its
// rendered image on any side, and when the scene's painted placeholder is
// still set once the image has landed (Ari's ruling on taste review r15: no
// hero box ever extends past its art). Also checks that nothing on the page
// scrolls sideways at 320.
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
// Ouro's lowest point on the lectern, as a share of the art's height.
const FOOT = 0.85;
const FOOT_ALPHA = 0.9;
const DRIFT = 1.02;
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
        const cs = getComputedStyle(img);
        const y = parseFloat(cs.objectPosition.split(" ")[1]) / 100;
        const fade = parseFloat(getComputedStyle(img.closest(".story-hero")).getPropertyValue("--hero-fade")) / 100;
        const mask = getComputedStyle(img.closest(".story-hero")).maskImage || getComputedStyle(img.closest(".story-hero")).webkitMaskImage;
        // Every frame (a video, an iframe, an image, or a box with an edge of its
        // own, at least 120px each way) that starts above the hero's foot.
        const foot = img.closest(".story-hero").getBoundingClientRect().bottom;
        const edged = (s) =>
          (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== "none") || (s.boxShadow && s.boxShadow !== "none") ||
          (s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor)) || s.backgroundImage !== "none";
        const early = [];
        for (const el of document.querySelectorAll("main *")) {
          if (el.closest(".story-scene, [aria-hidden='true'], [hidden]")) continue;
          const q = el.getBoundingClientRect();
          if (q.width < 120 || q.height < 120) continue;
          const s = getComputedStyle(el);
          if (s.display === "none" || s.visibility === "hidden") continue;
          if ((s.position === "absolute" || s.position === "fixed") && !el.textContent.trim() && !el.querySelector("img,video,iframe,canvas")) continue;
          const tag = el.tagName.toLowerCase();
          if (!(tag === "video" || tag === "iframe" || tag === "img" || tag === "canvas" || edged(s))) continue;
          if (q.top < foot - 0.5) early.push(`${tag}.${String(el.className).trim().split(/\s+/).slice(0, 2).join(".")} starts ${(foot - q.top).toFixed(1)}px above the hero's foot`);
        }
        const sb = img.closest(".story-hero").getBoundingClientRect();
        const past = { top: r.top - sb.top, bottom: sb.bottom - r.bottom, left: r.left - sb.left, right: sb.right - r.right };
        const overrun = Object.entries(past).filter(([, d]) => d > 0.5).map(([side, d]) => `${side} ${d.toFixed(1)}px`);
        return { box: r.height, natural, y, fade, mask, early, overrun, overflow: document.documentElement.scrollWidth - window.innerWidth };
      });
      if (!m) failures.push(`${path}: no hero`);
      else if (width > 640) {
        const crop = 1 - m.box / m.natural;
        console.log(JSON.stringify({ path, width, height, box: Math.round(m.box), natural: Math.round(m.natural), crop: +(crop * 100).toFixed(1) }));
        if (crop > MAX_CROP) failures.push(`${path} at ${width}x${height}: the hero crops ${(crop * 100).toFixed(1)}% of its scene`);
        // Where his foot lands in the box, then pushed down by the drift about the fade line.
        const share = Math.min(1, m.box / m.natural);
        const at = (FOOT - m.y * (1 - share)) / share;
        const drifted = m.fade + (at - m.fade) * DRIFT;
        const alpha = drifted <= m.fade ? 1 : 1 - (drifted - m.fade) / (1 - m.fade);
        console.log(JSON.stringify({ path, width, foot: +at.toFixed(3), fade: m.fade, alpha: +alpha.toFixed(3) }));
        if (!(m.fade > 0) || !m.mask.includes(`rgb(0, 0, 0) ${+(m.fade * 100).toFixed(1)}%`)) failures.push(`${path} at ${width}: the hero's fade must start at --hero-fade (got ${m.mask})`);
        if (alpha < FOOT_ALPHA - 0.005) failures.push(`${path} at ${width}x${height}: Ouro's foot keeps only ${(alpha * 100).toFixed(0)}% under the fade`);
        console.log(JSON.stringify({ path, width, framesInsideHero: m.early.length }));
        for (const e of m.early) failures.push(`${path} at ${width}x${height}: ${e}`);
        if (m.overrun.length) failures.push(`${path} at ${width}x${height}: the hero's box runs past its image: ${m.overrun.join(", ")}`);
      } else if (m.overflow > 0) failures.push(`${path} at ${width}px scrolls ${m.overflow}px sideways`);
      await context.close();
    }
  }
  // Once the hero's image lands, its painted placeholder must be gone. The
  // scene's bytes come from ouroboros.bot; a tiny stand-in image lands here.
  const tiny = Buffer.from("UklGRjQAAABXRUJQVlA4ICgAAACQAQCdASoCAAIAAUAmJZACdLoAA5gA/vhQv/2Ka+LaZfbZg+gtAAAA", "base64");
  for (const path of PAGES) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    // Playwright tries the last route first.
    await page.route(/^https:\/\/ouroboros\.bot\//, (route) => route.abort());
    await page.route(/^https:\/\/ouroboros\.bot\/.*\.(?:avif|webp)$/, (route) => route.fulfill({ status: 200, contentType: "image/webp", body: tiny }));
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "load" });
    const paint = await page.evaluate(() => {
      const img = document.querySelector(".story-hero img");
      const scene = img && img.closest(".story-hero");
      return img && img.naturalWidth ? getComputedStyle(scene).backgroundImage : "the hero image never landed";
    });
    console.log(JSON.stringify({ path, placeholderAfterLanding: paint }));
    if (paint !== "none") failures.push(`${path}: the hero's placeholder is still set after the image landed (${String(paint).slice(0, 60)})`);
    await context.close();
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
