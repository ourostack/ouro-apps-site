import { access, readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

// Guards the site's shape so a well-meaning edit can't quietly break the IA:
// the homepage stays where Ouro's tools are installed, both pages share
// ouroboros.bot's header and footer, the app page stays Ouro MD, the
// product imagery stays a real render, and telemetry stays lightweight.

const requiredFiles = [
  "index.html",
  ".nojekyll",
  "apps/ouro-md/index.html",
  "apps/ouro-md/stable.json",
  "assets/ouro-md-icon.png",
  "assets/ouro-md-hero.png",
  "assets/ouro-md-hero.mp4",
  "assets/ouro-md-editing.png",
  "assets/site-telemetry.js",
  "assets/site-shell.js",
  "assets/brand/ouro-render-128.webp",
  "assets/brand/shepherd-render-128.webp",
  "assets/fonts/cormorant-regular.woff2",
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

// Every page needs the SEO + telemetry + a real product image.
for (const pagePath of ["index.html", "apps/ouro-md/index.html"]) {
  const html = await readFile(pagePath, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const title = doc.querySelector("title")?.textContent;
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content");
  const h1 = doc.querySelector("h1")?.textContent;
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content");
  const telemetry = doc.querySelector('script[src="/assets/site-telemetry.js"]');
  const img = doc.querySelector("img[src]");
  if (!title || !description || !canonical || !ogImage || !telemetry || !h1 || !img) {
    throw new Error(`${pagePath} is missing title, description, canonical, og image, telemetry, h1, or image`);
  }
  // The hero must be a real Ouro MD render, not an abstract placeholder or mockup.
  if (!html.includes("/assets/ouro-md-hero.png")) {
    throw new Error(`${pagePath} must show the real Ouro MD product shot (assets/ouro-md-hero.png)`);
  }
}

// Homepage = where Ouro's tools are downloaded and installed, routing clearly
// to Ouro MD. Ouro Workbench was superseded by Ouro Shepherd (Ari, 2026-10-31),
// so the homepage names Shepherd and never Workbench.
const home = await readFile("index.html", "utf8");
for (const term of ["Ouro MD", "Ouro Shepherd", "npx ouro.bot", "Download Ouro MD", "ouro-md-install.sh"]) {
  if (!home.includes(term)) {
    throw new Error(`homepage must present Ouro's tools and route to Ouro MD: missing "${term}"`);
  }
}
for (const pagePath of ["index.html", "apps/ouro-md/index.html"]) {
  const html = await readFile(pagePath, "utf8");
  if (/workbench/i.test(html)) {
    throw new Error(`${pagePath} must not present Ouro Workbench; Ouro Shepherd superseded it`);
  }
}

// One family with ouroboros.bot: every page carries the shared header and
// footer (the same nav, mark, fonts and footer line as ouroboros.bot), and
// links back to ouroboros.bot. Keep this in step with ourostack/ouroboros-website
// src/data/site.mjs.
const sharedNav = [
  "https://ouroboros.bot/approach/",
  "https://ouroboros.bot/desk/",
  "https://ouroboros.bot/ouro-md/",
  "https://ouroboros.bot/lab/",
  "https://ouroboros.bot/blog/",
  "https://ouro.bot/",
  "https://ouroboros.bot/#try",
  "https://mendelow.me",
];
for (const pagePath of ["index.html", "apps/ouro-md/index.html"]) {
  const doc = new JSDOM(await readFile(pagePath, "utf8")).window.document;
  const nav = doc.querySelector("header .nav");
  const hrefs = [...(nav?.querySelectorAll("a") ?? [])].map((a) => a.getAttribute("href"));
  const navOnly = hrefs.filter((h) => h !== "https://github.com/ourostack");
  if (JSON.stringify(navOnly) !== JSON.stringify(sharedNav)) {
    throw new Error(`${pagePath}: the header must carry the shared ouroboros.bot nav in order, got ${navOnly.join(", ")}`);
  }
  if (nav.querySelector('a[aria-current="page"]')?.getAttribute("href") !== "https://ouro.bot/") {
    throw new Error(`${pagePath}: Apps must be the current nav item on ouro.bot`);
  }
  if (!doc.querySelector('header .brand img[src^="/assets/brand/ouro-render"]')) {
    throw new Error(`${pagePath}: the header must show the Ouro render mark`);
  }
  const line = doc.querySelector("footer .footer-line")?.textContent.replace(/\s+/g, " ").trim();
  if (line !== "You bring judgment. Your agents bring the rest.") {
    throw new Error(`${pagePath}: the footer must carry the shared footer line`);
  }
  const footerLinks = [...doc.querySelectorAll("footer .footer-row a")].map((a) => a.getAttribute("href"));
  for (const href of ["https://ouroboros.bot/", "https://mendelow.me", "https://ouroboros.bot/privacy/", "https://ouroboros.bot/terms/"]) {
    if (!footerLinks.includes(href)) throw new Error(`${pagePath}: the footer is missing ${href}`);
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

// Telemetry stays lightweight: page views + CTA clicks, no content capture.
const telemetry = await readFile("assets/site-telemetry.js", "utf8");
if (!telemetry.includes("ouro_site_page_view") || !telemetry.includes("ouro_site_cta_clicked")) {
  throw new Error("site telemetry must capture page views and CTA clicks");
}

console.log("site contract ok");
