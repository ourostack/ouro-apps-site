import { access, readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { cards, cardUrl } from "./og-cards.mjs";

// Guards the site's shape so a well-meaning edit can't quietly break the IA:
// the homepage stays the Ouro *family* home, the app page stays Ouro MD, the
// product imagery stays a real render, a product that isn't shipped is described
// honestly (no screenshots of UI that doesn't exist, no download button), and
// telemetry stays lightweight.

const requiredFiles = [
  "index.html",
  ".nojekyll",
  "apps/ouro-md/index.html",
  "apps/ouro-md/stable.json",
  "apps/shepherd/index.html",
  "assets/ouro-md-icon.png",
  "assets/ouro-md-hero.png",
  "assets/ouro-md-hero.mp4",
  "assets/ouro-md-editing.png",
  "assets/site-telemetry.js",
  "ouro-md-install.sh",
  "styles.css",
  "robots.txt",
  "sitemap.xml",
  "assets/apple-touch-icon.png",
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
if (release.bundleIdentifier !== "bot.ouro.md") {
  throw new Error("stable.json bundleIdentifier must match the signed Ouro MD app");
}
if (!release.downloads.zip?.sha256 || !release.downloads.manifest?.sha256) {
  throw new Error("stable.json must include zip and manifest digests");
}
if (!("notarized" in release) || !("signingMode" in release)) {
  throw new Error("stable.json must include signing truth fields");
}

// Every page needs the SEO basics + telemetry.
for (const pagePath of ["index.html", "apps/ouro-md/index.html", "apps/shepherd/index.html"]) {
  const html = await readFile(pagePath, "utf8");
  const doc = new JSDOM(html).window.document;
  const title = doc.querySelector("title")?.textContent;
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content");
  const h1 = doc.querySelector("h1")?.textContent;
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content");
  const telemetry = doc.querySelector('script[src="/assets/site-telemetry.js"]');
  if (!title || !description || !canonical || !ogImage || !telemetry || !h1) {
    throw new Error(`${pagePath} is missing title, description, canonical, og image, telemetry, or h1`);
  }
}

// Pages for shipped Ouro MD show a real product image.
for (const pagePath of ["index.html", "apps/ouro-md/index.html"]) {
  const html = await readFile(pagePath, "utf8");
  if (!new JSDOM(html).window.document.querySelector("img[src]")) {
    throw new Error(`${pagePath} is missing an image`);
  }
  // The hero must be a real Ouro MD render, not an abstract placeholder or mockup.
  if (!html.includes("/assets/ouro-md-hero.png")) {
    throw new Error(`${pagePath} must show the real Ouro MD product shot (assets/ouro-md-hero.png)`);
  }
}

// Homepage = the Ouro family home, still routing clearly to Ouro MD. These keep
// it from being overfit into a single-app landing page (Workbench + the family
// framing must survive) while guaranteeing the download path. The second family
// slot is Ouro Shepherd (it replaced the frozen Ouro Workbench).
const home = await readFile("index.html", "utf8");
for (const term of ["Ouro MD", "Ouro Shepherd", "/apps/shepherd/", "Mac tools for people who work in text", "One workshop, more than one tool", "Download Ouro MD", "as you write"]) {
  if (!home.includes(term)) {
    throw new Error(`homepage must present Ouro as an app family and route to Ouro MD: missing "${term}"`);
  }
}

// App page = the Ouro MD product page, leading with the write-in-rendered-Markdown
// pitch and keeping the auditable terminal install.
const appPage = await readFile("apps/ouro-md/index.html", "utf8");
for (const term of ["rendered document", "Download Ouro MD", "ouro-md-install.sh"]) {
  if (!appPage.includes(term)) {
    throw new Error(`app page must lead with the Ouro MD pitch: missing "${term}"`);
  }
}

// Shepherd page = an experiment that ships inside Ouroboros (Ari, 2026-10-20: "coming soon"
// was inaccurate). It says so, credits cmux without implying affiliation, keeps the safety
// floor, and shows labelled illustrations, never screenshots. Approved brand artwork
// (/assets/brand/) is the only imagery. No download or launch date; setup is the design
// doc's "Turning it on".
const shepherd = await readFile("apps/shepherd/index.html", "utf8");
if (/coming soon/i.test(shepherd)) throw new Error("Shepherd ships inside Ouroboros: it is not coming soon");
for (const term of ["Experimental", "Shepherd ships in Ouroboros, our open-source agent harness, as an early alpha.", "#turning-it-on", "https://cmux.com", "not affiliated with or endorsed by Manaflow", "always come to you", "Not a screenshot", "Illustration, not real output"]) {
  if (!shepherd.includes(term)) {
    throw new Error(`Shepherd page must stay honest about its status and cmux: missing "${term}"`);
  }
}
const shepherdMain = new JSDOM(shepherd).window.document.querySelector("main");
if ([...shepherdMain.querySelectorAll("img, video")].some((el) => !(el.getAttribute("src") || "").startsWith("/assets/brand/"))) {
  throw new Error("Shepherd page must not show product screenshots or video until the product ships; use labelled illustrations");
}
for (const stale of ["nothing to try", "isn't running for anyone", "In development"]) {
  if (shepherd.includes(stale)) throw new Error(`Shepherd page is a coming-soon preview now: drop "${stale}"`);
}
if ([...shepherdMain.querySelectorAll("a, button")].some((el) => /download|install/i.test(el.textContent))) {
  throw new Error("Shepherd page must not offer a download until the product ships");
}

// Every page's share card is drawn at build time (scripts/og-cards.mjs) from its
// own og:title and og:description; the page must point at that card.
for (const card of cards) {
  const doc = new JSDOM(await readFile(card.page, "utf8")).window.document;
  const url = cardUrl(card.name);
  for (const [selector, expected] of [['meta[property="og:image"]', url], ['meta[name="twitter:image"]', url], ['meta[name="twitter:card"]', "summary_large_image"], ['meta[property="og:image:width"]', "1200"], ['meta[property="og:image:height"]', "630"]]) {
    if (doc.querySelector(selector)?.getAttribute("content") !== expected) throw new Error(`${card.page}: ${selector} must be ${expected}`);
  }
  if (!doc.querySelector('meta[property="og:image:alt"]')?.getAttribute("content")) throw new Error(`${card.page} needs og:image:alt`);
  if (!doc.querySelector('meta[property="og:title"]')?.getAttribute("content") || !doc.querySelector('meta[property="og:description"]')?.getAttribute("content")) throw new Error(`${card.page} needs og:title and og:description for its card`);
}

// Telemetry stays lightweight: page views + CTA clicks, no content capture.
const telemetry = await readFile("assets/site-telemetry.js", "utf8");
if (!telemetry.includes("ouro_site_page_view") || !telemetry.includes("ouro_site_cta_clicked")) {
  throw new Error("site telemetry must capture page views and CTA clicks");
}

console.log("site contract ok");
