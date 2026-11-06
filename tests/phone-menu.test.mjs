import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

// The phone menu on ouro.bot/apps/ouro-md/ matches ouroboros.bot's (Nav.astro):
// a full panel under the bar, an X to close it, and Escape, a tap outside the
// links or a link closing it, with focus back on the toggle and the page
// unlocked (taste review, 2026-11-06: the panel covered only the top 175px,
// with no X and no Escape).

const html = readFileSync(new URL("../apps/ouro-md/index.html", import.meta.url), "utf8");
const shell = readFileSync(new URL("../assets/site-shell.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function page() {
  const dom = new JSDOM(html.replace(/<script\b[^>]*src=[^>]*><\/script>/g, ""), { runScripts: "outside-only", pretendToBeVisual: true });
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {} });
  dom.window.eval(shell);
  const { document } = dom.window;
  return { dom, document, toggle: document.querySelector(".menu-toggle"), menu: document.getElementById("menu") };
}
const click = (dom, el) => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
const ruleFor = (selector) => (css.match(new RegExp(`(^|\\n)${selector.replace(/[.*]/g, "\\$&")}\\s*\\{([^}]*)\\}`)) || [])[2] || "";

test("the bar itself has no backdrop-filter, so the fixed panel fills the screen below it", () => {
  assert.ok(ruleFor(".site-header"), "found the .site-header rule");
  assert.doesNotMatch(ruleFor(".site-header"), /backdrop-filter|filter:|transform:|contain:/);
  assert.match(ruleFor(".menu"), /position: fixed; inset: 4rem 0 0/);
});

test("the toggle opens the panel, shows an X and locks the page", () => {
  const { dom, document, toggle, menu } = page();
  assert.ok(toggle.querySelector(".menu-icon-open") && toggle.querySelector(".menu-icon-close"), "hamburger and X icons");
  click(dom, toggle);
  assert.ok(menu.classList.contains("is-open"));
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(toggle.getAttribute("aria-label"), "Close menu");
  assert.equal(document.body.style.overflow, "hidden");
  assert.match(css, /\.menu-toggle\[aria-expanded="true"\] \.menu-icon-close \{ display: block; \}/);
  click(dom, toggle);
  assert.ok(!menu.classList.contains("is-open"));
  assert.equal(document.body.style.overflow, "");
});

test("Escape closes it and hands focus back to the toggle", () => {
  const { dom, document, toggle, menu } = page();
  click(dom, toggle);
  menu.querySelector("a").focus();
  document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.ok(!menu.classList.contains("is-open"));
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(document.activeElement, toggle);
  assert.equal(document.body.style.overflow, "");
});

test("a tap outside the links, or on a link, closes it", () => {
  const { dom, document, toggle, menu } = page();
  click(dom, toggle);
  click(dom, menu);
  assert.ok(!menu.classList.contains("is-open"), "tap on the panel around the links");
  assert.equal(document.activeElement, toggle);
  click(dom, toggle);
  click(dom, document.querySelector(".brand"));
  assert.ok(!menu.classList.contains("is-open"), "tap on the bar outside the toggle");
  click(dom, toggle);
  menu.querySelector("a").addEventListener("click", (e) => e.preventDefault());
  click(dom, menu.querySelector("a"));
  assert.ok(!menu.classList.contains("is-open"), "a link");
  assert.equal(document.body.style.overflow, "");
});
