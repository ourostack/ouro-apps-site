// ouro-apex: fronts ouro.bot/*, www.ouro.bot/* and ui.ouro.bot/*. routes.js says where each path goes;
// tests/worker.test.mjs is the contract.

import { origin, home, apex, uiOld, uiHome, forwards, elsewhere, kept } from "./routes.js";

function redirect(location, status) {
  return new Response(null, {
    status,
    headers: { location, "x-ouro-apps-site": "cloudflare-worker-forward" },
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname === uiOld) {
      return redirect(`${uiHome}${url.pathname}${url.search}`, 301);
    }

    if (forwards.has(url.pathname)) {
      const target = new URL(forwards.get(url.pathname));
      target.search = url.search;
      return redirect(target.toString(), 301);
    }
    if (elsewhere.has(url.pathname)) {
      return redirect(elsewhere.get(url.pathname), 302);
    }
    if (!kept.has(url.pathname)) {
      // Any other path goes to the same path on ouroboros.bot, so a page that
      // exists there opens, and a missing one gets that site's real 404.
      return redirect(`${home}${url.pathname}${url.search}`, 301);
    }
    if (url.hostname !== new URL(apex).hostname) {
      // www.ouro.bot: the same file, from the one host that serves it.
      return redirect(`${apex}${url.pathname}${url.search}`, 301);
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
