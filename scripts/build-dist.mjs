// Assembles the deployable static site into dist/ — only the files that should
// be served, so the Cloudflare Pages deploy never ships node_modules, scripts,
// or repo plumbing. Run after the contract check (see the `build` script).

import { cp, rm, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = `${root}/dist`;

// Everything a browser needs, and nothing it doesn't.
const include = [
  "index.html",
  "styles.css",
  ".nojekyll",
  "robots.txt",
  "sitemap.xml",
  "ouro-md-install.sh",
  "apps",
  "assets",
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const entry of include) {
  await cp(`${root}/${entry}`, `${dist}/${entry}`, { recursive: true });
}
console.log(`built dist/ (${include.length} entries)`);
