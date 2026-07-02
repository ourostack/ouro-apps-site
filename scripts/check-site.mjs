import { access, readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const requiredFiles = [
  "index.html",
  "CNAME",
  ".nojekyll",
  "apps/ouro-md/index.html",
  "apps/ouro-md/stable.json",
  "assets/ouro-md-icon.png",
  "assets/ouro-md-preview.png",
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

for (const pagePath of ["index.html", "apps/ouro-md/index.html"]) {
  const html = await readFile(pagePath, "utf8");
  const dom = new JSDOM(html);
  const title = dom.window.document.querySelector("title")?.textContent;
  const description = dom.window.document.querySelector('meta[name="description"]')?.getAttribute("content");
  const h1 = dom.window.document.querySelector("h1")?.textContent;
  const img = dom.window.document.querySelector("img[src]");
  if (!title || !description || !h1 || !img) {
    throw new Error(`${pagePath} is missing title, description, h1, or image`);
  }
}

console.log("site contract ok");
