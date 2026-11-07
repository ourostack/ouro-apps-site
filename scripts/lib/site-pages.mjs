// Shared by the round-18 checks (link-spaces, line-ends, label-swap,
// menu-swipe, h1-lines): serves dist/ on a local port, or checks the same
// /apps/ paths on a live site when --base is given. ouroboros.bot has the
// same helper (ourostack/ouroboros-website, scripts/lib/site-pages.mjs).

import { readFile } from 'node:fs/promises';
import { readdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../../dist', import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.xml': 'application/xml' };

export const args = process.argv.slice(2);
export const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
export const launchOptions = () => (process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});

function distPages(dir = join(DIST, 'apps')) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return distPages(full);
    if (!entry.name.endsWith('.html') || /http-equiv="refresh"/.test(readFileSync(full, 'utf8'))) return [];
    return ['/' + relative(DIST, full).replace(/index\.html$/, '')];
  });
}

/** { base, pages, close } for dist/ on `port`, or for the live site in --base. */
export async function openSite({ port }) {
  const pages = distPages();
  const live = opt('--base')?.replace(/\/$/, '');
  if (live) return { base: live, pages, close() {} };
  const server = createServer(async (req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (path.endsWith('/')) path += 'index.html';
    try {
      const body = await readFile(join(DIST, path));
      res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(port, resolve));
  return { base: `http://localhost:${port}`, pages, close: () => server.close() };
}
