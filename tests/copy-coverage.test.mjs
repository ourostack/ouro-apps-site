import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { JSDOM } from "jsdom";

// Every code block and every prompt a reader might paste carries the shared
// Copy button (taste review r16, 2026-11-07). ouroboros.bot runs the same
// check (ourostack/ouroboros-website, tests/copy-coverage.test.mjs).
//
// A <pre> passes when a button copies it (data-copy-target="<its id>") or
// when it says why there is nothing to paste: data-copy-exempt="<reason>",
// for a demo that plays or text shown as evidence. A prompt passes only
// inside a copyable box: an italic block outside a <blockquote> that is all
// one quotation of a sentence or more is a prompt set as a quotation, and
// fails.

const root = fileURLToPath(new URL("../apps", import.meta.url));
const pages = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? pages(join(dir, e.name)) : e.name.endsWith(".html") ? [join(dir, e.name)] : []));
const docs = pages(root).map((file) => [relative(root, file), new JSDOM(readFileSync(file, "utf8")).window.document]);

test("there are pages to check", () => assert.ok(docs.length > 0));

test("every code block has a Copy button, or says why it has none", () => {
  const missing = [];
  for (const [page, document] of docs) {
    const targets = new Set([...document.querySelectorAll("[data-copy-target]")].map((b) => b.getAttribute("data-copy-target")));
    for (const pre of document.querySelectorAll("pre")) {
      if (pre.getAttribute("data-copy-exempt")) continue;
      if (pre.id && targets.has(pre.id)) continue;
      missing.push(`${page}: ${pre.outerHTML.slice(0, 90)}`);
    }
    for (const button of document.querySelectorAll("[data-copy-target]")) {
      if (!/\bCopy\b/.test(button.textContent)) missing.push(`${page}: a copy button without its Copy label`);
    }
  }
  assert.deepEqual(missing, [], "A code block has no Copy button and no data-copy-exempt reason");
});

test("no prompt is set as an italic quotation outside a copyable box", () => {
  const stray = [];
  for (const [page, document] of docs) {
    for (const el of document.querySelectorAll("p, aside, div, em, i")) {
      const italic = el.tagName === "EM" || el.tagName === "I" || el.classList.contains("italic");
      if (!italic || el.closest("blockquote")) continue;
      const text = el.textContent.trim().replace(/\s+/g, " ");
      if (/^["“]/.test(text) && /["”]$/.test(text) && text.split(" ").length >= 8) stray.push(`${page}: ${text.slice(0, 70)}`);
    }
  }
  assert.deepEqual(stray, [], "A prompt is an italic quotation, not a copyable box");
});
