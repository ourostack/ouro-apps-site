(function () {
  var key = "phc_b79jp3gz9SekF6X1oEGW4BLFk2FZzzzj88PDHEUgf5a";
  var host = "https://us.i.posthog.com";
  var storageKey = "ouro_site_distinct_id";

  if (!key || navigator.doNotTrack === "1" || window.doNotTrack === "1") {
    return;
  }

  function distinctId() {
    try {
      var existing = window.localStorage.getItem(storageKey);
      if (existing) return existing;
      var id = "site_" + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
      window.localStorage.setItem(storageKey, id);
      return id;
    } catch (_) {
      return "site_anon";
    }
  }

  function bucketWidth() {
    var width = window.innerWidth || document.documentElement.clientWidth || 0;
    if (width < 520) return "phone";
    if (width < 900) return "tablet";
    if (width < 1280) return "laptop";
    return "wide";
  }

  function capture(event, properties) {
    var payload = {
      api_key: key,
      event: event,
      distinct_id: distinctId(),
      properties: Object.assign({
        app: "ouro_site",
        path: location.pathname,
        title: document.title,
        viewport: bucketWidth(),
        referrer_host: document.referrer ? new URL(document.referrer).host : ""
      }, properties || {})
    };
    var body = JSON.stringify(payload);
    var endpoint = host.replace(/\/$/, "") + "/capture/";
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(endpoint, {
      method: "POST",
      body: body,
      headers: { "content-type": "application/json" },
      keepalive: true
    }).catch(function () {});
  }

  window.ouroSiteTelemetry = { capture: capture };
  capture("ouro_site_page_view");

  document.addEventListener("click", function (event) {
    var target = event.target.closest && event.target.closest("a[data-telemetry]");
    if (!target) return;
    capture("ouro_site_cta_clicked", {
      target: target.getAttribute("data-telemetry"),
      href_host: target.href ? new URL(target.href).host : "",
      href_path: target.href ? new URL(target.href).pathname : ""
    });
  });
})();
