// Contract for the ouro-apex Worker (worker.js), which fronts ouro.bot/*.
// Every path redirects: each old page and file to its new home on ouroboros.bot,
// with a 301, in one hop, keeping the query. Nothing is fetched or served here.

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import worker from "../worker.js";
import { forwards } from "../routes.js";

let calls;
const realFetch = globalThis.fetch;

beforeEach(() => {
  calls = [];
  globalThis.fetch = async (request) => {
    calls.push(request);
    return new Response("unexpected upstream fetch", { status: 500 });
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

const get = (path, init) => worker.fetch(new Request(`https://ouro.bot${path}`, init));
const getWww = (path) => worker.fetch(new Request(`https://www.ouro.bot${path}`));

// Every path the app, its installer, its App Store listing or the Ouro MD
// product page used to fetch here, and where it lives now (2026-11-07).
const ouroMd = [
  ["/apps/ouro-md", "/ouro-md/download/"],
  ["/apps/ouro-md/", "/ouro-md/download/"],
  ["/apps/ouro-md/index.html", "/ouro-md/download/"],
  ["/apps/ouro-md/stable.json", "/ouro-md/stable.json"],
  ["/ouro-md-install.sh", "/ouro-md-install.sh"],
  ["/assets/ouro-md-editing.png", "/images/workshop/ouro-md-editing.png"],
  ["/assets/media/ouro-md-typing-light-poster.png", "/images/workshop/ouro-md-typing-light-poster.png"],
  ["/assets/media/ouro-md-agent-edit-dark.webm", "/images/workshop/ouro-md-agent-edit-dark.webm"],
  ["/assets/fonts/cormorant-regular.woff2", "/fonts/cormorant-regular.woff2"],
  ["/assets/brand/ouro-render-128.webp", "/brand/ouro-render-128.webp"],
  ["/assets/brand/ouro.svg", "/brand/ouro.svg"],
  ["/assets/ouro-md-icon.png", "/brand/ouro-md-icon.png"],
  ["/assets/apple-touch-icon.png", "/brand/ouro-md-icon.png"],
  ["/assets/favicon-32x32.png", "/brand/ouro-md-icon.png"],
  ["/assets/ouro-md-hero.png", "/images/workshop/ouro-md-typing-light-poster.png"],
  ["/assets/ouro-md-hero.mp4", "/images/workshop/ouro-md-typing-light.mp4"],
  ["/styles.css", "/ouro-md/download/"],
  ["/assets/site-shell.js", "/ouro-md/download/"],
  ["/assets/clips.js", "/ouro-md/download/"],
  ["/assets/site-telemetry.js", "/ouro-md/download/"],
  ["/robots.txt", "/robots.txt"],
  ["/sitemap.xml", "/sitemap-index.xml"],
];

for (const [path, to] of ouroMd) {
  test(`forwards ${path} to ouroboros.bot${to} in one 301, keeping the query`, async () => {
    for (const query of ["", "?v=1&x=2"]) {
      const response = await get(`${path}${query}`);
      assert.equal(response.status, 301, path);
      assert.equal(response.headers.get("location"), `https://ouroboros.bot${to}${query}`, path);
      assert.equal(response.headers.get("x-ouro-apps-site"), "cloudflare-worker-forward");
    }
    assert.equal(calls.length, 0);
  });
}

test("forwards HEAD requests for the installer too", async () => {
  const response = await get("/ouro-md-install.sh", { method: "HEAD" });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://ouroboros.bot/ouro-md-install.sh");
  assert.equal(calls.length, 0);
});

test("every file ouro.bot used to keep has an explicit home", async () => {
  // The kept list as it stood before the move (routes.js, 2026-11-07).
  const before = ["/ouro-md-install.sh", "/apps/ouro-md", "/apps/ouro-md/", "/apps/ouro-md/index.html", "/apps/ouro-md/stable.json", "/assets/apple-touch-icon.png", "/assets/brand/ouro-hx-render-128.webp", "/assets/brand/ouro-hx-render-256.webp", "/assets/brand/ouro-render-128.webp", "/assets/brand/ouro-render-256.webp", "/assets/brand/ouro-render.webp", "/assets/brand/ouro.svg", "/assets/brand/shepherd-render-128.webp", "/assets/brand/shepherd-render-256.webp", "/assets/brand/shepherd-render.webp", "/assets/clips.js", "/assets/favicon-32x32.png", "/assets/fonts/cormorant-regular.woff2", "/assets/fonts/jetbrains-mono.woff2", "/assets/fonts/outfit.woff2", "/assets/media/ouro-hx-spoonjoy-xray-dark.webp", "/assets/media/ouro-hx-spoonjoy-xray-light.webp", "/assets/media/ouro-hx-spoonjoy-xray-og.png", "/assets/media/ouro-hx-spoonjoy-xray-provenance.json", "/assets/media/ouro-md-agent-edit-dark-poster.png", "/assets/media/ouro-md-agent-edit-dark.mp4", "/assets/media/ouro-md-agent-edit-dark.webm", "/assets/media/ouro-md-agent-edit-light-poster.png", "/assets/media/ouro-md-agent-edit-light.mp4", "/assets/media/ouro-md-agent-edit-light.webm", "/assets/media/ouro-md-typing-dark-poster.png", "/assets/media/ouro-md-typing-dark.mp4", "/assets/media/ouro-md-typing-dark.webm", "/assets/media/ouro-md-typing-light-poster.png", "/assets/media/ouro-md-typing-light.mp4", "/assets/media/ouro-md-typing-light.webm", "/assets/ouro-md-editing.png", "/assets/ouro-md-hero.mp4", "/assets/ouro-md-hero.png", "/assets/ouro-md-icon.png", "/assets/site-shell.js", "/assets/site-telemetry.js", "/styles.css", "/robots.txt", "/sitemap.xml"];
  for (const path of before) assert.ok(forwards.has(path), `${path} has no forward`);
});

test("forwards the old homepage to the apps shelf on ouroboros.bot with a 301", async () => {
  for (const path of ["/", "/index.html", "/apps", "/apps/", "/apps/index.html"]) {
    const response = await get(path);
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get("location"), "https://ouroboros.bot/apps/", path);
    assert.equal(response.headers.get("x-ouro-apps-site"), "cloudflare-worker-forward");
  }
  assert.equal(calls.length, 0);
});

test("forwards the Ouro HX page straight to the Ouro UI site, its one home, keeping the query", async () => {
  for (const path of ["/apps/ouro-hx", "/apps/ouro-hx/", "/apps/ouro-hx/index.html"]) {
    for (const query of ["", "?x=1"]) {
      const response = await get(`${path}${query}`);
      assert.equal(response.status, 301, path);
      assert.equal(response.headers.get("location"), `https://ui.ouroboros.bot/${query}`, path);
    }
  }
  assert.equal(calls.length, 0);
});

test("forwards the Ouro HX page's files to their homes on the Ouro UI site", async () => {
  const files = [
    ["/assets/media/ouro-hx-spoonjoy-xray-dark.webp", "https://ui.ouroboros.bot/showcase/spoonjoy-xray-dark-1600.webp"],
    ["/assets/media/ouro-hx-spoonjoy-xray-light.webp", "https://ui.ouroboros.bot/showcase/spoonjoy-xray-light-1600.webp"],
    ["/assets/media/ouro-hx-spoonjoy-xray-provenance.json", "https://github.com/ourostack/ouro-ui/blob/main/site/showcase/provenance.json"],
    ["/assets/media/ouro-hx-spoonjoy-xray-og.png", "https://ui.ouroboros.bot/og/home.jpg"],
    ["/assets/brand/ouro-hx-render-128.webp", "https://ui.ouroboros.bot/brand/ouro-hx-render-128.webp"],
    ["/assets/brand/ouro-hx-render-256.webp", "https://ui.ouroboros.bot/brand/ouro-hx-render-256.webp"],
  ];
  for (const [path, to] of files) {
    const response = await get(path);
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get("location"), to, path);
  }
  assert.equal(calls.length, 0);
});

test("sends Shepherd and the retired Workbench to Shepherd on the shelf", async () => {
  for (const path of ["/apps/shepherd/", "/apps/ouro-shepherd/", "/apps/ouro-workbench/"]) {
    const response = await get(path);
    assert.equal(response.headers.get("location"), "https://ouroboros.bot/apps/#shepherd", path);
  }
});

test("keeps the query string when it forwards", async () => {
  assert.equal((await get("/?ref=card")).headers.get("location"), "https://ouroboros.bot/apps/?ref=card");
  assert.equal((await get("/apps/shepherd/?ref=x")).headers.get("location"), "https://ouroboros.bot/apps/?ref=x#shepherd");
});

test("sends any other path to the same path on ouroboros.bot with a 301, so a missing page is a real 404", async () => {
  for (const path of ["/terms/", "/nope/", "/no-such-page", "/apps/ouro-md/nope", "/apps/ouro-md/old.json", "/assets/nope.png", "/assets/", "/ouro-md-install.sh.bak", "/assetsx/a.png", "/apps/ouro-mdx/", "/styles.css/x", "/ouro-md/download/"]) {
    const response = await get(path);
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get("location"), `https://ouroboros.bot${path}`, path);
  }
  assert.equal((await get("/nope/?ref=x&y=1")).headers.get("location"), "https://ouroboros.bot/nope/?ref=x&y=1");
  assert.equal(calls.length, 0);
});

// Every forward lands on a page that exists, on ouroboros.bot, on the Ouro UI site (Ouro HX's page and
// files) or in ouro-ui's repository (their provenance). Set OUROBOROS_DIST to a built
// ourostack/ouroboros-website dist/ to check ouroboros.bot offline; the rest, and otherwise all, are checked live.
const destinationHomes = ["https://ouroboros.bot", "https://ui.ouroboros.bot", "https://github.com"];
test("every forward destination exists, on ouroboros.bot, ui.ouroboros.bot or ouro-ui's repository", async () => {
  globalThis.fetch = realFetch;
  const destinations = [...new Set(forwards.values())];
  for (const destination of destinations) {
    const url = new URL(destination);
    assert.ok(destinationHomes.includes(url.origin), destination);
    if (url.origin === "https://github.com") assert.match(url.pathname, /^\/ourostack\/ouro-ui\/blob\/main\//, destination);
    const fragment = url.hash.slice(1);
    let body;
    if (process.env.OUROBOROS_DIST && url.origin === "https://ouroboros.bot") {
      const file = url.pathname.endsWith("/") ? `${url.pathname}index.html` : url.pathname;
      body = await readFile(`${process.env.OUROBOROS_DIST}${file}`, "utf8");
    } else {
      const response = await realFetch(`${url.origin}${url.pathname}`, { redirect: "manual" });
      assert.equal(response.status, 200, `${destination} answers ${response.status}`);
      body = await response.text();
    }
    if (fragment) assert.match(body, new RegExp(`id="${fragment}"`), `${destination} has no #${fragment}`);
  }
});

test("sends the App Store privacy URL to Ouro MD's privacy policy", async () => {
  for (const path of ["/privacy", "/privacy/"]) {
    const response = await get(path);
    assert.equal(response.status, 302, path);
    assert.equal(response.headers.get("location"), "https://github.com/ourostack/ouro-md/blob/main/PRIVACY.md", path);
  }
  assert.equal(calls.length, 0);
});

test("sends the App Store support URL to Ouro MD's GitHub issues", async () => {
  for (const path of ["/support", "/support/"]) {
    const response = await get(path);
    assert.equal(response.status, 302, path);
    assert.equal(response.headers.get("location"), "https://github.com/ourostack/ouro-md/issues", path);
  }
  assert.equal(calls.length, 0);
});

test("www.ouro.bot forwards each page where the apex does", async () => {
  for (const path of ["/", "/apps/ouro-hx/", "/apps/shepherd/"]) {
    const [www, bare] = [await getWww(path), await get(path)];
    assert.equal(www.status, bare.status, path);
    assert.equal(www.headers.get("location"), bare.headers.get("location"), path);
  }
  assert.equal((await getWww("/privacy/")).headers.get("location"), "https://github.com/ourostack/ouro-md/blob/main/PRIVACY.md");
  for (const path of ["/nope/", "/nope/?ref=x"]) {
    const response = await getWww(path);
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get("location"), `https://ouroboros.bot${path}`, path);
  }
  assert.equal(calls.length, 0);
});

test("www.ouro.bot forwards Ouro MD's paths where the apex does", async () => {
  for (const path of ["/apps/ouro-md/?v=1", "/ouro-md-install.sh", "/assets/ouro-md-icon.png", "/apps/ouro-md/stable.json"]) {
    const [www, bare] = [await getWww(path), await get(path)];
    assert.equal(www.status, 301, path);
    assert.equal(www.headers.get("location"), bare.headers.get("location"), path);
  }
  assert.equal(calls.length, 0);
});

test("ui.ouro.bot forwards every path, with its query, to the same place on ui.ouroboros.bot", async () => {
  for (const path of ["/", "/docs/dialog/", "/storybook/?path=/story/x", "/r/registry.json", "/llms.txt", "/apps/ouro-md/stable.json", "/nope/"]) {
    const response = await worker.fetch(new Request(`https://ui.ouro.bot${path}`));
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get("location"), `https://ui.ouroboros.bot${path}`, path);
  }
  assert.equal(calls.length, 0);
});

test("wrangler routes cover the apex, www and ui hosts", async () => {
  const config = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");
  for (const pattern of ["ouro.bot/*", "www.ouro.bot/*", "ui.ouro.bot/*"]) {
    assert.ok(config.includes(`"pattern": "${pattern}"`), pattern);
  }
});
