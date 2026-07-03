// UI checks — runs axe-core accessibility (incl. WCAG color-contrast) against
// every Storybook story, so a dark-on-dark button (or any contrast/a11y
// regression) fails the build instead of shipping. Serves the built Storybook
// itself, so it's self-contained for CI.
//
//   npm run build-storybook && node scripts/a11y.mjs      (or: npm run test-ui)
//
// The classic @storybook/test-runner (jest) is incompatible with Storybook 10
// (Jest 30 transformer change), so we drive the same axe engine the a11y addon
// uses directly through Playwright.

import { chromium } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const DIST = 'storybook-static';
const PORT = 6199;
// Playwright's bundled chromium by default (works in CI); override locally with
// CHROME_PATH if you'd rather use a system browser.
const CHROME = process.env.CHROME_PATH;

// Document-level axe rules don't apply to components rendered in isolation
// (a lone button legitimately isn't inside a <main>). Everything else — most
// importantly color-contrast, ARIA, names/roles — is enforced.
const OFF = [
  'region', 'landmark-one-main', 'landmark-unique', 'landmark-complementary-is-top-level',
  'page-has-heading-one', 'html-has-lang', 'html-lang-valid', 'document-title', 'bypass',
];
const axeOptions = { rules: Object.fromEntries(OFF.map((r) => [r, { enabled: false }])) };

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
  '.map': 'application/json', '.txt': 'text/plain',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const fp = join(DIST, normalize(p).replace(/^(\.\.(\/|\\|$))+/, ''));
    const data = await readFile(fp);
    res.writeHead(200, { 'content-type': MIME[extname(fp)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('404');
  }
});
await new Promise((r) => server.listen(PORT, r));
const base = `http://localhost:${PORT}`;

const index = JSON.parse(await readFile(`${DIST}/index.json`, 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
if (!stories.length) {
  console.error('No stories found — did you run build-storybook first?');
  process.exit(1);
}

const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const page = await browser.newPage();
let failures = 0;

for (const s of stories) {
  await page.goto(`${base}/iframe.html?id=${encodeURIComponent(s.id)}&viewMode=story`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  await injectAxe(page);
  const violations = await getViolations(page, '#storybook-root', axeOptions);
  if (violations.length) {
    failures += violations.length;
    console.log(`\n  ✗ ${s.title} — ${s.name}`);
    for (const v of violations) {
      console.log(`      [${v.impact}] ${v.id}: ${v.help}`);
      for (const n of v.nodes.slice(0, 4)) {
        const detail = (n.any?.[0]?.message || n.failureSummary || '').replace(/\s+/g, ' ').trim();
        console.log(`         ${n.target.join(' ')}  — ${detail}`.slice(0, 160));
      }
    }
  } else {
    console.log(`  ✓ ${s.title} — ${s.name}`);
  }
}

await browser.close();
server.close();

if (failures) {
  console.error(`\n✗ ${failures} accessibility violation(s) across the component library.`);
  process.exit(1);
}
console.log('\n✓ a11y: no violations across the component library.');
