// ouro.bot's copy of ouroboros.bot's h1 check (ourostack/ouroboros-website,
// scripts/h1-lines.mjs); keep the two in step.
//
// Prints every page's h1 as it wraps on a phone, line by line, at 320, 390
// and 430 (taste review r16, 2026-11-07: the /lab/story/ h1 split its muted
// second clause). Ari's ruling: on a phone each clause of a two-clause h1
// starts its own line, and a clause breaks only when it is wider than the
// column, and then at its most natural phrase boundary (.t-clause and .t-ph in
// global.css). This prints for a person to read; it fails when an h1 runs
// past its column or a .t-clause shares a line with another clause.
//
// Taste review r17 (2026-11-07) found one-word lines: "Code / a model can
// use," at 320, "where all of this / started." at 320 and 390, and "Which
// agent / harness / ..." at 320. Ari's ruling, added to the clause rule: on a
// phone no h1 line holds a single word unless that word is a whole clause,
// and a compound term ("agent harness", "Ouro MD", a product's name) never
// breaks. So it also fails on a one-word line that is not a whole clause, and
// on a compound term from TERMS split across two lines.
//
//   npm run build && node scripts/h1-lines.mjs
//   node scripts/h1-lines.mjs --base https://ouro.bot   (the live site)
//
// Uses Playwright's chromium; override with CHROME_PATH.

import { chromium } from '@playwright/test';
import { launchOptions, openSite } from './lib/site-pages.mjs';

const site = await openSite({ port: 6215 });

// Compound terms that never break across lines in an h1.
const TERMS = ['agent harness', 'agent experience', 'Ouro MD', 'Ouro HX', 'Ouro UI', 'Ouro AX', 'Claude Code', 'GitHub Copilot', 'Copilot CLI', 'model reviews'];

// Runs in the page: the h1's words grouped into the lines they land on.
function lines(TERMS) {
  const h1 = document.querySelector('h1');
  if (!h1) return null;
  const col = h1.getBoundingClientRect();
  const rows = [];
  let overflow = false;
  const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode()); ) {
    for (const m of node.data.matchAll(/\S+/g)) {
      const range = document.createRange();
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const r = range.getBoundingClientRect();
      if (r.right > Math.min(col.right, innerWidth - 16) + 0.5) overflow = true; // past the h1, or into the 16px edge of the screen
      const clause = node.parentElement.closest('.t-clause, h1 > .block');
      let row = rows.find((x) => Math.abs(x.top - r.top) < r.height / 2);
      if (!row) rows.push((row = { top: r.top, words: [], clauses: new Set() }));
      row.words.push(m[0]);
      if (clause) row.clauses.add(clause);
    }
  }
  rows.sort((a, b) => a.top - b.top);
  const norm = (t) => t.replace(/\s+/g, ' ').trim();
  const bare = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, '');
  // A line of one word is fine only when that word is its whole clause (or the whole h1).
  const lone = rows
    .filter((r) => r.words.filter((w) => /[\p{L}\p{N}]/u.test(w)).length === 1)
    .filter((r) => {
      const word = norm(r.words.join(' '));
      const wholes = [...r.clauses].map((c) => norm(c.textContent)).concat(norm(h1.textContent));
      return !wholes.includes(word);
    })
    .map((r) => r.words.join(' '));
  const split = [];
  for (let i = 1; i < rows.length; i++) {
    const pair = `${bare(rows[i - 1].words.at(-1))} ${bare(rows[i].words[0])}`;
    for (const term of TERMS) if (pair === term.toLowerCase()) split.push(term);
  }
  return { text: rows.map((r) => r.words.join(' ')).join(' / '), overflow, shared: rows.some((r) => r.clauses.size > 1), lone, split };
}

const browser = await chromium.launch(launchOptions());
const failures = [];
for (const width of [320, 390, 430]) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.route(/\.(?:avif|webp|jpg|png|mp4|webm)(?:\?|$)/, (r) => r.abort());
  for (const page of site.pages) {
    await p.goto(site.base + page, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    const r = await p.evaluate(lines, TERMS);
    if (!r) continue;
    console.log(`${width} ${page.padEnd(40)} ${r.text}`);
    if (r.overflow) failures.push(`${width} ${page}: the h1 runs past its column`);
    if (r.shared) failures.push(`${width} ${page}: two clauses share a line`);
    for (const word of r.lone) failures.push(`${width} ${page}: "${word}" is alone on a line and is not a whole clause`);
    for (const term of r.split) failures.push(`${width} ${page}: "${term}" breaks across two lines`);
  }
  await ctx.close();
}
await browser.close();
site.close();
for (const f of failures) console.log(`FAIL ${f}`);
process.exit(failures.length ? 1 : 0);
