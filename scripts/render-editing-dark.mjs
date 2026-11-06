// Renders the dark twin of assets/ouro-md-editing.png (the "Budget" shot):
// scripts/hero-doc.md through Ouro MD's own web layer, in its Graphite theme,
// so dark mode shows the app's real dark rendering instead of a white page.
//
// The Graphite stylesheet is not copied by hand: it is read from ouro-md's
// Sources/OuroMD/Themes.swift (the editorCSS template and the Graphite palette)
// and filled in here, exactly as the app fills it in.
//
//   OURO_MD=/path/to/ouro-md CHROME_PATH=/path/to/chrome node scripts/render-editing-dark.mjs [out.png]
//
// Writes the PNG to the path given (default ./ouro-md-editing-dark.png). It is
// served by ouroboros.bot (ourostack/ouroboros-website
// public/images/workshop/ouro-md-editing-dark.png), like the scenes, because the
// ouro-apex Worker keeps only the files listed in routes.js. Re-run when the
// sample document, the app's rendering or the Graphite palette changes.

import { chromium } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.argv[2] || "ouro-md-editing-dark.png";
const ouroMd = process.env.OURO_MD || fileURLToPath(new URL("../../ouro-md", import.meta.url));
const web = join(ouroMd, "Sources/OuroMD/web");
const swift = readFileSync(join(ouroMd, "Sources/OuroMD/Themes.swift"), "utf8");
if (!existsSync(join(web, "index.html"))) throw new Error(`no Ouro MD web layer at ${web}`);

// The Graphite palette and the editor stylesheet template, from Themes.swift.
const graphite = swift.match(/Palette\(id: "graphite"[\s\S]*?lightCodeSyntax: (true|false)\)/)[0];
const palette = Object.fromEntries([...graphite.matchAll(/(\w+): "([^"]*)"/g)].map((m) => [m[1], m[2]]));
const fonts = Object.fromEntries([...swift.matchAll(/static let (sans|mono|size) = #?"(.*?)"#?\n/g)].map((m) => [m[1], m[2]]));
const template = swift.match(/private func editorCSS\(_ p: Palette\) -> String \{\s*"""\n([\s\S]*?)\n\s*"""/)[1];
const css = template
  .replace(/\\\(p\.(\w+)\)/g, (_, key) => palette[key])
  .replace(/\\\(Fonts\.(\w+)\)/g, (_, key) => fonts[key])
  .replace(/\\\(codeSyntaxCSS\(p\)\)/g, "")
  .replace(/\\\(reducedMotionCrossfadeCSS\)/g, "");
if (/\\\(/.test(css)) throw new Error("unfilled interpolation in the Graphite stylesheet");

const doc = readFileSync(join(here, "hero-doc.md"), "utf8");
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 960, height: 1440 }, deviceScaleFactor: 2, colorScheme: "dark" });
await page.addInitScript(() => { window.webkit = { messageHandlers: { ouro: { postMessage: () => {} } } }; });
await page.goto("file://" + join(web, "index.html"));
await page.waitForFunction(() => window.ouro && typeof window.ouro.setTheme === "function", { timeout: 10000 });
await page.evaluate(([themeCss, bg]) => window.ouro.setTheme("dark", themeCss, "native", bg), [css, palette.bg]);
await page.evaluate((md) => window.ouro.setValue(md), doc);
await page.waitForTimeout(2000); // Mermaid + KaTeX
// The same reading surface as render-hero.mjs, minus editor-only affordances.
await page.addStyleTag({ content:
  ".vditor-reset{max-width:820px !important;margin:0 auto !important;padding:42px 48px 48px !important;}" +
  "#editor{caret-color:transparent !important;}" +
  "#editor h1::before,#editor h2::before,#editor h3::before,#editor h4::before,#editor h5::before,#editor h6::before{content:none !important;display:none !important;}" +
  "#editor .vditor-ir__marker{display:none !important;}"
});
await page.waitForTimeout(400);

const box = await (await page.$("#editor")).boundingBox();
const W = Math.min(860, Math.round(box.width));
const x = Math.round(box.x + (box.width - W) / 2);
const full = join(tmpdir(), `ouro-md-editing-dark-full-${Date.now()}.png`);
await page.screenshot({ path: full, clip: { x, y: 0, width: W, height: Math.min(Math.round(box.height), 1400) } });
const m = await page.evaluate(() => {
  const budget = [...document.querySelectorAll("#editor h2")].find((h) => /budget/i.test(h.textContent));
  const bq = document.querySelector("#editor blockquote:last-of-type");
  return { budgetTop: budget.getBoundingClientRect().top, endBottom: bq.getBoundingClientRect().bottom };
});
await browser.close();

const featY = Math.round((m.budgetTop - 10) * 2);
const featH = Math.round((m.endBottom + 34) * 2) - featY;
execFileSync("magick", [full, "-crop", `1720x${featH}+0+${featY}`, "+repage", out]);
console.log(`Rendered ${out} (1720x${featH})`);
