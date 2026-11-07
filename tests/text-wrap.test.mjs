import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { JSDOM } from "jsdom";
import { wrapCode, wrapToken } from "../scripts/text-wrap.mjs";

// The build's break wrapper (scripts/text-wrap.mjs) must never show a reader
// a character reference as text, and never break a file name before its
// extension (taste review r14, 2026-11-07: ouroboros.bot showed "&#123;" and
// "&#39;" in code, and "latest-ready" / ".json" broke in two).

const apps = fileURLToPath(new URL("../apps", import.meta.url));
const pages = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? pages(join(dir, e.name)) : e.name.endsWith(".html") ? [join(dir, e.name)] : []));
const visible = (html) => {
  const { document } = new JSDOM(html).window;
  document.querySelectorAll("script,style,template,noscript").forEach((n) => n.remove());
  return document.body.textContent;
};
const REF = /&#\d+;|&#x[0-9a-f]+;|&[a-z][a-z0-9]*;/gi;

test("a character reference is never split and never shows as text", () => {
  for (const token of ["&#39;&#123;print/$1&#125;&#39;/x", "ouro/x?y=&#123;a&#125;#&#39;b&#39;", "/a/&#x7b;b&#x7d;/c", "a/b/c&hellip;/d/eeeeee", "https://x.io/a?b=1&amp;c=2#frag"]) {
    const html = wrapToken(token);
    assert.equal(visible(`<p>${html}</p>`), visible(`<p>${token}</p>`), html);
  }
});

test("a file name never breaks before its extension", () => {
  for (const [token, last] of [
    ["https://ouroboros.bot/brief.md", "brief.md"],
    ["~/.ouro/agents/slugger/state/latest-ready.json", "latest-ready.json"],
    ["src/heart/personality.yaml", "personality.yaml"],
    ["src/__tests__/parser.test.ts", "parser.test.ts"],
  ]) {
    const pieces = [...wrapToken(token).matchAll(/<span class="tok[^"]*">([^<]*)/g)].map((m) => m[1]);
    assert.ok(pieces.at(-1).endsWith(last), `${token}: ${pieces.join(" | ")}`);
  }
});

test("no built page shows a character reference as text", () => {
  // The build runs wrapCode over every page under apps/ (scripts/build-dist.mjs).
  const bad = [];
  for (const file of pages(apps)) {
    const text = visible(wrapCode(readFileSync(file, "utf8")));
    for (const m of text.matchAll(REF)) bad.push(`${file.slice(apps.length)}: ${text.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, " ")}`);
  }
  assert.deepEqual(bad, []);
});
