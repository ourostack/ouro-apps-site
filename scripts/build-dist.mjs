// Assembles the deployable static site into dist/ — only the files that should
// be served, so the Cloudflare Pages deploy never ships node_modules, scripts,
// or repo plumbing. Run after the contract check (see the `build` script).

import { cp, rm, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { wrapDir } from "./text-wrap.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = `${root}/dist`;

// Everything a browser needs, and nothing it doesn't.
const include = [
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
// URLs and paths break only after a "/" or before a host or file name's "."
// (scripts/text-wrap.mjs, the same rule as ouroboros.bot).
const wrapped = wrapDir(`${dist}/apps`);
console.log(`built dist/ (${include.length} entries, ${wrapped} pages wrapped)`);
