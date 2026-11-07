import { access, readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

// Guards the site's shape so a well-meaning edit can't quietly break it: the one
// page left here, Ouro MD's download page, shares ouroboros.bot's header and
// footer, stays Ouro MD, keeps its product imagery real, and telemetry stays
// lightweight. The homepage and the Ouro HX page moved to ouroboros.bot on
// 2026-11-06 and were removed from this repository.

const requiredFiles = [
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
const pages = ["apps/ouro-md/index.html"];
for (const pagePath of pages) {
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
  // The Ouro MD pages show the real Ouro MD render, not an abstract placeholder or mockup.
  // Since the storybook brand (2026-11-06), Ouro MD's download page shares the card
  // ouroboros.bot builds for it and opens on its scene from ouroboros.bot; its product
  // media (the recordings and the editing shot) stay real.
  if (pagePath === "apps/ouro-md/index.html") {
    if (ogImage !== "https://ouroboros.bot/og/og-ouro-md.jpg") throw new Error(`${pagePath} must share the storybook card`);
    if (doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content") !== ogImage) throw new Error(`${pagePath}: twitter:image must equal og:image`);
    const hero = doc.querySelector('main > .story-hero[data-brand-scene="ouro-md"]');
    if (!hero || hero.querySelector("img")?.getAttribute("fetchpriority") !== "high" || hero.querySelector("img")?.hasAttribute("loading")) {
      throw new Error(`${pagePath} must open on the ouro-md storybook scene, loaded first`);
    }
    // Every scene carries its painted dawn, and a failed image steps aside for it (taste review r10).
    for (const scene of doc.querySelectorAll(".story-scene")) {
      const style = scene.getAttribute("style") || "";
      if (!/--paint: url\(data:image\/webp;base64,[A-Za-z0-9+/=]+\)/.test(style) || !/--paint-phone: url\(data:image\/webp;base64,[A-Za-z0-9+/=]+\)/.test(style)) {
        throw new Error(`${pagePath}: the ${scene.getAttribute("data-brand-scene")} scene must carry its --paint and --paint-phone`);
      }
    }
    if (!/addEventListener\('error'[^\n]*\.story-scene'\)\) t\.setAttribute\('data-failed'/.test(html)) throw new Error(`${pagePath} must mark failed scene images data-failed`);
    if (!html.includes("/assets/ouro-md-editing.png")) throw new Error(`${pagePath} must show the real Ouro MD editing shot`);
  }
}

// Ouro Workbench was superseded by Ouro Shepherd (Ari, 2026-10-31), and Ouro HX
// ships in production (Ari, 2026-10-30), so no page names Workbench or marks HX
// "under construction".
for (const pagePath of pages) {
  const html = await readFile(pagePath, "utf8");
  // The product clips are real Ouro MD recordings with real posters.
  for (const src of html.matchAll(/(?:poster|src)="(\/assets\/media\/[^"]+)"/g)) await access(src[1].slice(1));
  if (/workbench/i.test(html)) {
    throw new Error(`${pagePath} must not present Ouro Workbench; Ouro Shepherd superseded it`);
  }
  if (/under construction/i.test(html)) {
    throw new Error(`${pagePath} must not mark Ouro HX under construction; it is used in production`);
  }
}

// One family with ouroboros.bot: the page carries the shared header and
// footer (the same nav, mark, fonts and footer line as ouroboros.bot), and
// links back to ouroboros.bot. Keep this in step with ourostack/ouroboros-website
// src/data/site.mjs.
const sharedNav = [
  "https://ouroboros.bot/approach/",
  "https://ouroboros.bot/desk/",
  "https://ouroboros.bot/ouro-md/",
  "https://ouroboros.bot/lab/",
  "https://ouroboros.bot/blog/",
  "https://ouroboros.bot/apps/",
  "https://ouroboros.bot/#try",
  "https://mendelow.me",
];
for (const pagePath of pages) {
  const doc = new JSDOM(await readFile(pagePath, "utf8")).window.document;
  const nav = doc.querySelector("header .nav");
  const hrefs = [...(nav?.querySelectorAll("a") ?? [])].map((a) => a.getAttribute("href"));
  const navOnly = hrefs.filter((h) => h !== "https://github.com/ourostack");
  if (JSON.stringify(navOnly) !== JSON.stringify(sharedNav)) {
    throw new Error(`${pagePath}: the header must carry the shared ouroboros.bot nav in order, got ${navOnly.join(", ")}`);
  }
  // The same product page marks the same item on both sites (Ari, round 7):
  // ouroboros.bot/ouro-md/ marks "Ouro MD", so ouro.bot/apps/ouro-md/ does too.
  for (const scope of ["header .nav", "#menu"]) {
    const current = [...doc.querySelectorAll(`${scope} a[aria-current="page"]`)].map((a) => a.getAttribute("href"));
    if (JSON.stringify(current) !== JSON.stringify(["https://ouroboros.bot/ouro-md/"])) {
      throw new Error(`${pagePath}: Ouro MD must be the only current item in ${scope}, got ${current.join(", ") || "none"}`);
    }
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

// App page = the Ouro MD product page, leading with Ouro MD's one promise (the same
// line ouroboros.bot/ouro-md/ and the share card carry, 2026-11-06) and keeping
// the auditable terminal install.
const appPage = await readFile("apps/ouro-md/index.html", "utf8");
for (const term of ["<h1 class=\"heading-lead\">Markdown that renders as you type.</h1>", "<title>Ouro MD: Markdown that renders as you type</title>", "Download Ouro MD", "ouro-md-install.sh"]) {
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
