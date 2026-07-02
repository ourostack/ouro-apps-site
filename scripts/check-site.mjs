import { access, readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const requiredFiles = [
  "index.html",
  ".nojekyll",
  "apps/ouro-md/index.html",
  "apps/ouro-md/stable.json",
  "assets/ouro-md-icon.png",
  "assets/ouro-md-preview.png",
  "assets/site-telemetry.js",
  "ouro-md-install.sh",
  "scripts/render-ouromd-preview.mjs",
  "styles.css",
];

for (const file of requiredFiles) {
  await access(file);
}

const release = JSON.parse(await readFile("apps/ouro-md/stable.json", "utf8"));
const requiredReleaseFields = ["appName", "subtitle", "version", "releaseURL", "bundleIdentifier", "downloads"];
for (const field of requiredReleaseFields) {
  if (!release[field]) {
    throw new Error(`stable.json missing ${field}`);
  }
}
if (release.appName !== "Ouro MD") {
  throw new Error("stable.json appName must be Ouro MD");
}
if (release.subtitle !== "The Markdown App") {
  throw new Error("stable.json subtitle must be The Markdown App");
}
if (!release.downloads.zip?.sha256 || !release.downloads.manifest?.sha256) {
  throw new Error("stable.json must include zip and manifest digests");
}
if (!("notarized" in release) || !("signingMode" in release)) {
  throw new Error("stable.json must include signing truth fields");
}

for (const pagePath of ["index.html", "apps/ouro-md/index.html"]) {
  const html = await readFile(pagePath, "utf8");
  const dom = new JSDOM(html);
  const title = dom.window.document.querySelector("title")?.textContent;
  const description = dom.window.document.querySelector('meta[name="description"]')?.getAttribute("content");
  const h1 = dom.window.document.querySelector("h1")?.textContent;
  const canonical = dom.window.document.querySelector('link[rel="canonical"]')?.getAttribute("href");
  const ogImage = dom.window.document.querySelector('meta[property="og:image"]')?.getAttribute("content");
  const telemetry = dom.window.document.querySelector('script[src="/assets/site-telemetry.js"]');
  const img = dom.window.document.querySelector("img[src]");
  if (!title || !description || !canonical || !ogImage || !telemetry || !h1 || !img) {
    throw new Error(`${pagePath} is missing title, description, canonical, og image, telemetry, h1, or image`);
  }
}

const home = await readFile("index.html", "utf8");
for (const term of ["Small tools for people who live in their work", "Ouro Workbench", "One home, more than one tool", "Download Ouro MD"]) {
  if (!home.includes(term)) {
    throw new Error(`homepage must present Ouro as an app family and still route to Ouro MD: missing ${term}`);
  }
}
if (home.includes("First out of the drawer") || home.includes("Start with Ouro MD")) {
  throw new Error("homepage must not overfit the Ouro brand to only Ouro MD");
}

const telemetry = await readFile("assets/site-telemetry.js", "utf8");
if (!telemetry.includes("ouro_site_page_view") || !telemetry.includes("ouro_site_cta_clicked")) {
  throw new Error("site telemetry must capture page views and CTA clicks");
}

const previewRenderer = await readFile("scripts/render-ouromd-preview.mjs", "utf8");
for (const term of ["Household Snack & Focus Index", "<table>", "<svg", "conic-gradient"]) {
  if (!previewRenderer.includes(term)) {
    throw new Error(`preview renderer must keep the playful chart-rich product document: missing ${term}`);
  }
}

console.log("site contract ok");
