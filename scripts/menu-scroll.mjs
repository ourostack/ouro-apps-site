// Real-browser check of the phone menu after scrolling (taste review r3,
// 2026-11-06: on ouro.bot/apps/ouro-md/, opening the menu after scrolling made
// the sticky header jump up about 720px, taking the X and the theme toggle
// with it). Serves dist/, scrolls a phone-sized page well down, opens the menu
// and checks that the bar stays put and the X is visible and closes the menu.
//
//   npm run build && node scripts/menu-scroll.mjs
//
// Uses Playwright's bundled chromium (CI installs it for ui-checks); override
// locally with CHROME_PATH.

import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist", import.meta.url));
const PORT = 6198;
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm" };

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
  for (const [width, height] of [[390, 844], [320, 640]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    // The art is served by ouroboros.bot; the check is about layout, so skip the network.
    await page.route(/^https:\/\//, (route) => route.abort());
    await page.goto(`http://localhost:${PORT}/apps/ouro-md/`, { waitUntil: "load" });
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(200);
    const before = await page.evaluate(() => ({ y: scrollY, top: document.querySelector(".site-header").getBoundingClientRect().top }));
    if (before.y < 1000) failures.push(`${width}px: the page did not scroll (scrollY ${before.y})`);
    const toggle = page.locator(".menu-toggle");
    await toggle.click();
    await page.waitForTimeout(250);
    const open = await page.evaluate(() => {
      const header = document.querySelector(".site-header").getBoundingClientRect();
      const x = document.querySelector(".menu-toggle .menu-icon-close").getBoundingClientRect();
      const theme = document.querySelector(".theme-toggle");
      const t = theme ? theme.getBoundingClientRect() : null;
      return { y: scrollY, headerTop: header.top, x: [x.top, x.bottom, x.width], theme: t && [t.top, t.bottom], menuOpen: document.getElementById("menu").classList.contains("is-open") };
    });
    if (!open.menuOpen) failures.push(`${width}px: the menu did not open`);
    if (Math.abs(open.headerTop - before.top) > 1) failures.push(`${width}px: the header moved from ${before.top} to ${open.headerTop}`);
    if (!(open.x[2] > 0 && open.x[0] >= 0 && open.x[1] <= height)) failures.push(`${width}px: the X is not in view (${open.x})`);
    if (open.theme && !(open.theme[0] >= 0 && open.theme[1] <= height)) failures.push(`${width}px: the theme toggle is not in view (${open.theme})`);
    if (Math.abs(open.y - before.y) > 1) failures.push(`${width}px: the page scrolled from ${before.y} to ${open.y} when the menu opened`);
    // A real tap on the X, at its real position, closes the menu and keeps the scroll.
    await toggle.click();
    await page.waitForTimeout(200);
    const closed = await page.evaluate(() => ({ y: scrollY, open: document.getElementById("menu").classList.contains("is-open") }));
    if (closed.open) failures.push(`${width}px: tapping the X did not close the menu`);
    if (Math.abs(closed.y - before.y) > 1) failures.push(`${width}px: closing the menu moved the page from ${before.y} to ${closed.y}`);
    console.log(JSON.stringify({ width, before, open, closed }));
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
console.log("phone menu after scrolling: ok");
