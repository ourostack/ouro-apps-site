// ouro-apex: fronts ouro.bot/*.
//
// The ouro.bot website forwards to ouroboros.bot. The paths that Ouro MD, its
// installer, its App Store listing and its product page depend on are still
// proxied to the Pages project unchanged. tests/worker.test.mjs is the contract.

const origin = "https://ouro-apps-site.pages.dev";
const forwardOrigin = "https://ouroboros.bot";

// App Store support URL for Ouro MD. Support goes through GitHub issues.
const supportURL = "https://github.com/ourostack/ouro-md/issues";

const keptExact = new Set([
  "/ouro-md-install.sh",
  "/apps/ouro-md",
  "/styles.css",
  "/robots.txt",
  "/sitemap.xml",
]);
const keptPrefixes = ["/apps/ouro-md/", "/assets/"];

function isKept(pathname) {
  return keptExact.has(pathname) || keptPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { location, "x-ouro-apps-site": "cloudflare-worker-forward" },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (!isKept(url.pathname)) {
      if (url.pathname === "/support" || url.pathname === "/support/") {
        return redirect(supportURL);
      }
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
