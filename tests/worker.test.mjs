// Contract for the ouro-apex Worker (worker.js), which fronts ouro.bot/*.
// Each old page forwards to its new home on ouroboros.bot, and the paths Ouro MD
// and its installer depend on keep being served from the Pages project, byte for byte.

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import worker from "../worker.js";
import { forwards, kept as keptSet } from "../routes.js";

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

test("forwards the old homepage to the apps shelf on ouroboros.bot with a 301", async () => {
  for (const path of ["/", "/index.html", "/apps", "/apps/", "/apps/index.html"]) {
    const response = await get(path);
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get("location"), "https://ouroboros.bot/apps/", path);
    assert.equal(response.headers.get("x-ouro-apps-site"), "cloudflare-worker-forward");
  }
  assert.equal(calls.length, 0);
});

test("forwards the Ouro HX page to its new home", async () => {
  for (const path of ["/apps/ouro-hx", "/apps/ouro-hx/", "/apps/ouro-hx/index.html"]) {
    const response = await get(path);
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get("location"), "https://ouroboros.bot/ouro-hx/", path);
  }
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

test("sends unknown paths to the ouroboros.bot homepage with a 302, never to a missing page", async () => {
  for (const path of ["/terms/", "/no-such-page", "/apps/ouro-md/nope", "/apps/ouro-md/old.json", "/assets/nope.png", "/assets/", "/ouro-md-install.sh.bak", "/assetsx/a.png", "/apps/ouro-mdx/", "/styles.css/x"]) {
    const response = await get(path);
    assert.equal(response.status, 302, path);
    assert.equal(response.headers.get("location"), "https://ouroboros.bot/", path);
  }
  assert.equal(calls.length, 0);
});

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(new URL(`../${dir}/`, import.meta.url), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    out.push(...(entry.isDirectory() ? await walk(path) : [`/${path}`]));
  }
  return out;
}

test("keeps every file the site publishes under /apps/ouro-md/ and /assets/, including /assets/brand/", async () => {
  const published = [...(await walk("apps/ouro-md")), ...(await walk("assets"))];
  assert.ok(published.includes("/assets/brand/ouro.svg"));
  for (const path of published) {
    const response = await get(path);
    assert.equal(response.headers.get("x-ouro-apps-site"), "cloudflare-worker-proxy", path);
  }
});

test("keeps every local file the Ouro MD page and styles.css load", async () => {
  const page = await readFile(new URL("../apps/ouro-md/index.html", import.meta.url), "utf8");
  const styles = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const refs = new Set();
  for (const [, attr] of page.matchAll(/(?:href|src|poster|srcset|content)="([^"]+)"/g)) {
    for (const part of attr.split(",")) {
      const ref = part.trim().split(/\s+/)[0].replace(/^https:\/\/ouro\.bot(?=\/)/, "");
      if (ref.startsWith("/") && !ref.startsWith("//")) refs.add(ref.split(/[?#]/)[0]);
    }
  }
  for (const [, ref] of styles.matchAll(/url\(["']?(\/[^"')]+)/g)) refs.add(ref);
  assert.ok(refs.size > 10, "found the page's references");
  for (const ref of refs) assert.ok(keptSet.has(ref), `${ref} is loaded by the Ouro MD page but not kept`);
});

// Every forward lands on a page that exists. Set OUROBOROS_DIST to a built
// ourostack/ouroboros-website dist/ to check it offline; otherwise this checks the live site.
test("every forward destination exists on ouroboros.bot", async () => {
  globalThis.fetch = realFetch;
  const destinations = [...new Set(forwards.values())];
  for (const destination of destinations) {
    const url = new URL(destination);
    assert.equal(url.origin, "https://ouroboros.bot", destination);
    const fragment = url.hash.slice(1);
    let body;
    if (process.env.OUROBOROS_DIST) {
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
