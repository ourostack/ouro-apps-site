// Contract for the ouro-apex Worker (worker.js), which fronts ouro.bot/*.
// The site forwards to ouroboros.bot, and the paths Ouro MD and its installer
// depend on keep being served from the Pages project, byte for byte.

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import worker from "../worker.js";

const PAGES = "https://ouro-apps-site.pages.dev";

let calls;
const realFetch = globalThis.fetch;

beforeEach(() => {
  calls = [];
  globalThis.fetch = async (request) => {
    calls.push(request);
    const url = new URL(request.url);
    if (url.pathname === "/apps/ouro-md") {
      return new Response(null, { status: 308, headers: { location: "/apps/ouro-md/" } });
    }
    return new Response(`body for ${url.pathname}${url.search}`, {
      status: 200,
      headers: { "content-type": "application/x-test", etag: '"abc"' },
    });
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

const get = (path, init) => worker.fetch(new Request(`https://ouro.bot${path}`, init));

// Every path the app, its installer, its App Store listing (marketing URL) or
// the Ouro MD product page fetches today.
const kept = [
  "/ouro-md-install.sh",
  "/apps/ouro-md/stable.json",
  "/apps/ouro-md/",
  "/apps/ouro-md/index.html",
  "/assets/ouro-md-icon.png",
  "/assets/ouro-md-hero.png",
  "/assets/ouro-md-hero.mp4",
  "/assets/ouro-md-editing.png",
  "/assets/site-telemetry.js",
  "/assets/favicon-32x32.png",
  "/assets/apple-touch-icon.png",
  "/styles.css",
  "/robots.txt",
  "/sitemap.xml",
];

for (const path of kept) {
  test(`keeps serving ${path} from Pages unchanged`, async () => {
    const response = await get(`${path}?v=1`);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${PAGES}${path}?v=1`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/x-test");
    assert.equal(response.headers.get("etag"), '"abc"');
    assert.equal(response.headers.get("x-ouro-apps-site"), "cloudflare-worker-proxy");
    assert.equal(await response.text(), `body for ${path}?v=1`);
  });
}

test("passes the Pages trailing-slash redirect for /apps/ouro-md through", async () => {
  const response = await get("/apps/ouro-md");
  assert.equal(calls.length, 1);
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "/apps/ouro-md/");
});

test("passes HEAD requests for the installer through", async () => {
  const response = await get("/ouro-md-install.sh", { method: "HEAD" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, "HEAD");
  assert.equal(response.status, 200);
});

test("forwards the root to ouroboros.bot", async () => {
  const response = await get("/");
  assert.equal(calls.length, 0);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "https://ouroboros.bot/");
  assert.equal(response.headers.get("x-ouro-apps-site"), "cloudflare-worker-forward");
});

test("keeps the query string when it forwards", async () => {
  const response = await get("/?ref=card");
  assert.equal(response.headers.get("location"), "https://ouroboros.bot/?ref=card");
});

test("forwards other paths to the same path on ouroboros.bot", async () => {
  for (const path of ["/terms/", "/index.html", "/apps/", "/apps/ouro-workbench/", "/favicon.ico"]) {
    const response = await get(path);
    assert.equal(response.status, 302, path);
    assert.equal(response.headers.get("location"), `https://ouroboros.bot${path}`, path);
  }
  assert.equal(calls.length, 0);
});

test("does not keep lookalike paths", async () => {
  for (const path of ["/ouro-md-install.sh.bak", "/assetsx/a.png", "/apps/ouro-mdx/", "/styles.css/x"]) {
    const response = await get(path);
    assert.equal(response.status, 302, path);
  }
  assert.equal(calls.length, 0);
});

// Pages answers an unknown path with the old homepage and status 200, so the
// Worker keeps only files that exist and forwards everything else.
test("forwards unknown paths under /apps/ouro-md/ and /assets/ instead of serving the old homepage", async () => {
  for (const path of ["/apps/ouro-md/nope", "/apps/ouro-md/old.json", "/assets/nope.png", "/assets/"]) {
    const response = await get(path);
    assert.equal(response.status, 302, path);
    assert.equal(response.headers.get("location"), `https://ouroboros.bot${path}`, path);
  }
  assert.equal(calls.length, 0);
});

test("keeps every file the site publishes under /apps/ouro-md/ and /assets/", async () => {
  const published = [
    ...(await readdir(new URL("../apps/ouro-md/", import.meta.url))).map((name) => `/apps/ouro-md/${name}`),
    ...(await readdir(new URL("../assets/", import.meta.url))).map((name) => `/assets/${name}`),
  ];
  for (const path of published) {
    const response = await get(path);
    assert.equal(response.headers.get("x-ouro-apps-site"), "cloudflare-worker-proxy", path);
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
