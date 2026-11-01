// ouro-apex: fronts ouro.bot/*.
//
// The ouro.bot website forwards to ouroboros.bot. The paths that Ouro MD, its
// installer, its App Store listing and its product page depend on are still
// proxied to the Pages project unchanged. tests/worker.test.mjs is the contract.

const origin = "https://ouro-apps-site.pages.dev";
const forwardOrigin = "https://ouroboros.bot";

// Ouro MD's App Store support and privacy URLs. They go where the app and its
// product page already send people: GitHub issues and PRIVACY.md.
const elsewhere = new Map([
  ["/support", "https://github.com/ourostack/ouro-md/issues"],
  ["/support/", "https://github.com/ourostack/ouro-md/issues"],
  ["/privacy", "https://github.com/ourostack/ouro-md/blob/main/PRIVACY.md"],
  ["/privacy/", "https://github.com/ourostack/ouro-md/blob/main/PRIVACY.md"],
]);

// Only files that exist are kept. Pages answers any unknown path with the old
// homepage and status 200, so an unknown path under /apps/ouro-md/ or /assets/
// is forwarded like every other path. A test checks that every file in apps/ouro-md/
// and assets/ is listed here.
const kept = new Set([
  "/ouro-md-install.sh",
  "/apps/ouro-md",
  "/apps/ouro-md/",
  "/apps/ouro-md/index.html",
  "/apps/ouro-md/stable.json",
  "/assets/apple-touch-icon.png",
  "/assets/favicon-32x32.png",
  "/assets/ouro-md-editing.png",
  "/assets/ouro-md-hero.mp4",
  "/assets/ouro-md-hero.png",
  "/assets/ouro-md-icon.png",
  "/assets/site-telemetry.js",
  "/styles.css",
  "/robots.txt",
  "/sitemap.xml",
]);

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { location, "x-ouro-apps-site": "cloudflare-worker-forward" },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (elsewhere.has(url.pathname)) {
      return redirect(elsewhere.get(url.pathname));
    }
    if (!kept.has(url.pathname)) {
      return redirect(forwardOrigin + url.pathname + url.search);
    }

    const upstream = new URL(url.pathname + url.search, origin);
    const response = await fetch(new Request(upstream, request));
    const headers = new Headers(response.headers);
    headers.set("x-ouro-apps-site", "cloudflare-worker-proxy");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
