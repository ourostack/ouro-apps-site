// ouro-apex: fronts ouro.bot/*. routes.js says where each path goes;
// tests/worker.test.mjs is the contract.

import { origin, home, forwards, elsewhere, kept } from "./routes.js";

function redirect(location, status) {
  return new Response(null, {
    status,
    headers: { location, "x-ouro-apps-site": "cloudflare-worker-forward" },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (forwards.has(url.pathname)) {
      const target = new URL(forwards.get(url.pathname));
      target.search = url.search;
      return redirect(target.toString(), 301);
    }
    if (elsewhere.has(url.pathname)) {
      return redirect(elsewhere.get(url.pathname), 302);
    }
    if (!kept.has(url.pathname)) {
      // An unknown path has no page to map to. 302, so a page added to the map
      // later is not hidden behind a cached redirect.
      return redirect(`${home}/`, 302);
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
