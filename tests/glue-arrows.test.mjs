import assert from "node:assert/strict";
import test from "node:test";
import { glueArrows } from "../scripts/glue-arrows.mjs";
import { wrapCode } from "../scripts/text-wrap.mjs";
import { readFileSync } from "node:fs";

// An arrow is always glued to the word before it (Ari's ruling on taste
// review r17, 2026-11-07). The same module as ouroboros.bot's
// src/lib/glue-arrows.mjs; scripts/line-ends.mjs checks the rendered page.

test("the space before an arrow becomes a no-break space, across inline tags too", () => {
  assert.equal(glueArrows('<a class="link">Ouro MD on <span class="tok">ouroboros.bot</span> →</a>'), '<a class="link">Ouro MD on <span class="tok">ouroboros.bot</span>&nbsp;→</a>');
  assert.equal(glueArrows("<a>Support ↗</a>"), "<a>Support&nbsp;↗</a>");
  assert.equal(glueArrows('<a>About me <span aria-hidden="true">↗</span></a>'), '<a>About me&nbsp;<span aria-hidden="true">↗</span></a>');
});

test("code, scripts and attributes are left alone", () => {
  assert.equal(glueArrows('<pre>a → b</pre><a title="x →">y</a>'), '<pre>a → b</pre><a title="x →">y</a>');
});

test("the built Ouro MD page leaves no ordinary space in front of an arrow", () => {
  const html = glueArrows(wrapCode(readFileSync(new URL("../apps/ouro-md/index.html", import.meta.url), "utf8")))
    .replace(/<(script|style|pre|svg|title|head)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]*>/g, (tag) => (/^<\/?(?:span|a|em|strong|b|i|small|code)\b/i.test(tag) ? "" : "\u0001"));
  assert.doesNotMatch(html, /[^\s\u0001][ \t\n]+(?:&rarr;|&#8599;|[←-⇿])/);
});
