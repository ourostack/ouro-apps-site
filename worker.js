const origin = "https://ouro-apps-site.pages.dev";

export default {
  async fetch(request) {
    const url = new URL(request.url);
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
