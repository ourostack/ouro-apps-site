// Regenerates the Ouro MD product shots (assets/ouro-md-hero.png and
// assets/ouro-md-editing.png) by rendering scripts/hero-doc.md through Ouro MD's
// OWN web layer (Vditor + Mermaid + KaTeX + highlight.js), so the imagery on the
// site is the app's real rendering — not a mockup.
//
// Requires a local checkout of ouro-md (a sibling repo by default). Point at it
// with OURO_MD_WEB=/path/to/ouro-md/Sources/OuroMD/web if it lives elsewhere.
//
//   npm run render:hero
//
// The rendered PNGs are committed; you only need to re-run this when the sample
// document or the app's rendering changes.

import { chromium } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = fileURLToPath(new URL("..", import.meta.url));
const web = process.env.OURO_MD_WEB || fileURLToPath(new URL("../../ouro-md/Sources/OuroMD/web", import.meta.url));
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!existsSync(`${web}/index.html`)) {
  console.error(`Cannot find Ouro MD web layer at ${web}\nSet OURO_MD_WEB to your ouro-md checkout's Sources/OuroMD/web.`);
  process.exit(1);
}

const doc = readFileSync(`${here}/hero-doc.md`, "utf8");

const browser = await chromium.launch({ executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: 960, height: 1440 }, deviceScaleFactor: 2 });
await page.addInitScript(() => { window.webkit = { messageHandlers: { ouro: { postMessage: () => {} } } }; });
await page.goto("file://" + web + "/index.html");
await page.waitForFunction(() => window.ouro && typeof window.ouro.setValue === "function", { timeout: 10000 });
await page.evaluate((md) => window.ouro.setValue(md), doc);
await page.waitForTimeout(1500); // let Mermaid + KaTeX finish

// Reading surface tuned to match the app, minus editor-only affordances.
await page.addStyleTag({ content:
  "html,body{background:#ffffff !important;}" +
  ".vditor-reset{max-width:820px !important;margin:0 auto !important;padding:42px 48px 48px !important;}" +
  "#editor{caret-color:transparent !important;}" +
  "#editor h1::before,#editor h2::before,#editor h3::before,#editor h4::before,#editor h5::before,#editor h6::before{content:none !important;display:none !important;}" +
  "#editor .vditor-ir__marker{display:none !important;}"
});
await page.waitForTimeout(400);

const box = await (await page.$("#editor")).boundingBox();
const W = Math.min(860, Math.round(box.width));
const x = Math.round(box.x + (box.width - W) / 2);
const fullPath = `${root}/assets/_hero-full.png`;
await page.screenshot({ path: fullPath, clip: { x, y: 0, width: W, height: Math.min(Math.round(box.height), 1400) } });

const m = await page.evaluate(() => {
  const R = (el) => el.getBoundingClientRect();
  const svgs = [...document.querySelectorAll("#editor svg")].map((s) => R(s));
  const big = svgs.filter((r) => r.width > 200).sort((a, c) => c.width * c.height - a.width * a.height)[0];
  const budget = [...document.querySelectorAll("#editor h2")].find((h) => /budget/i.test(h.textContent));
  const bq = document.querySelector("#editor blockquote:last-of-type");
  return { mermaidBottom: big?.bottom, budgetTop: budget && R(budget).top, endBottom: bq && R(bq).bottom };
});
await browser.close();

const dsf = 2;
const heroH = Math.round((m.mermaidBottom + 28) * dsf);
const featY = Math.round((m.budgetTop - 26) * dsf);
const featH = Math.round((m.endBottom + 34) * dsf) - featY;
const crop = (h, y, out) =>
  execFileSync("magick", [fullPath, "-crop", `1720x${h}+0+${y}`, "+repage", `${root}/assets/${out}`]);
crop(heroH, 0, "ouro-md-hero.png");
crop(featH, featY, "ouro-md-editing.png");
execFileSync("rm", ["-f", fullPath]);
console.log("Rendered assets/ouro-md-hero.png and assets/ouro-md-editing.png");
