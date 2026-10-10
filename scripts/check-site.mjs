import { access, readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

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
for (const term of ["Ouro MD", "Ouro Shepherd", "/apps/shepherd/", "One workshop, more than one tool", "Download Ouro MD", "as you write"]) {
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

// Shepherd page = an honest page for a product in development. It says so,
// credits cmux without implying affiliation, keeps the safety floor, and shows
// diagrams instead of screenshots of UI that doesn't exist. No download button
// until there is something to download.
const shepherd = await readFile("apps/shepherd/index.html", "utf8");
for (const term of ["In development", "https://cmux.com", "not affiliated with or endorsed by Manaflow", "always come to you", "Not a screenshot"]) {
  if (!shepherd.includes(term)) {
    throw new Error(`Shepherd page must stay honest about its status and cmux: missing "${term}"`);
  }
}
const shepherdMain = new JSDOM(shepherd).window.document.querySelector("main");
if (shepherdMain.querySelector("img, video")) {
  throw new Error("Shepherd page must not show product screenshots or video until the product ships; use diagrams");
}
const shepherdDoc = shepherdMain.ownerDocument;
if ([...shepherdDoc.querySelectorAll("a, button")].some((el) => /download|install/i.test(el.textContent))) {
  throw new Error("Shepherd page must not offer a download until the product ships");
}

// Telemetry stays lightweight: page views + CTA clicks, no content capture.
const telemetry = await readFile("assets/site-telemetry.js", "utf8");
if (!telemetry.includes("ouro_site_page_view") || !telemetry.includes("ouro_site_cta_clicked")) {
  throw new Error("site telemetry must capture page views and CTA clicks");
}

console.log("site contract ok");
