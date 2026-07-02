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
if (!home.includes("Software that keeps up") || !home.includes("Download Ouro MD")) {
  throw new Error("homepage must carry product-led hero and download CTA copy");
}

const telemetry = await readFile("assets/site-telemetry.js", "utf8");
if (!telemetry.includes("ouro_site_page_view") || !telemetry.includes("ouro_site_cta_clicked")) {
  throw new Error("site telemetry must capture page views and CTA clicks");
}

console.log("site contract ok");
