// The ouro-apex Worker's routing table (worker.js imports it; so do the tests).
//
// Ouro's public home is ouroboros.bot (Ari, 2026-11-06: "we need a unified
// domain"). Each old ouro.bot page forwards to its new home there. The files
// Ouro MD, its installer, its App Store listing and its download page depend on
// are still proxied to the Pages project unchanged.

export const origin = "https://ouro-apps-site.pages.dev";
export const home = "https://ouroboros.bot";
// The one host that serves the kept files. www.ouro.bot forwards like the apex,
// and sends a kept file here instead of serving a second copy.
export const apex = "https://ouro.bot";

// Old ouro.bot pages and their new homes. These are 301s: the move is permanent,
// and no kept path is ever redirected, so a cached 301 can't hide Ouro MD's files.
// ourostack/ouroboros-website tests/ouro-bot-forwards.test.mjs checks that each
// destination exists in that site's build; tests/worker.test.mjs checks them live.
export const forwards = new Map([
  ["/", `${home}/apps/`],
  ["/index.html", `${home}/apps/`],
  ["/apps", `${home}/apps/`],
  ["/apps/", `${home}/apps/`],
  ["/apps/index.html", `${home}/apps/`],
  ["/apps/ouro-hx", `${home}/ouro-hx/`],
  ["/apps/ouro-hx/", `${home}/ouro-hx/`],
  ["/apps/ouro-hx/index.html", `${home}/ouro-hx/`],
  // Shepherd superseded Workbench (Ari, 2026-10-31); neither ever had its own page here.
  ["/apps/shepherd", `${home}/apps/#shepherd`],
  ["/apps/shepherd/", `${home}/apps/#shepherd`],
  ["/apps/ouro-shepherd", `${home}/apps/#shepherd`],
  ["/apps/ouro-shepherd/", `${home}/apps/#shepherd`],
  ["/apps/ouro-workbench", `${home}/apps/#shepherd`],
  ["/apps/ouro-workbench/", `${home}/apps/#shepherd`],
  ["/favicon.ico", `${home}/favicon.ico`],
]);

// Ouro MD's App Store support and privacy URLs. They go where the app and its
// download page already send people: GitHub issues and PRIVACY.md. These stay
// 302s, because they move again when the App Store URLs move to ouroboros.bot.
export const elsewhere = new Map([
  ["/support", "https://github.com/ourostack/ouro-md/issues"],
  ["/support/", "https://github.com/ourostack/ouro-md/issues"],
  ["/privacy", "https://github.com/ourostack/ouro-md/blob/main/PRIVACY.md"],
  ["/privacy/", "https://github.com/ourostack/ouro-md/blob/main/PRIVACY.md"],
]);

// Only files that exist are kept. Pages has no page for an unknown path, so an
// unknown path, even under /apps/ouro-md/ or /assets/, goes to the ouroboros.bot
// homepage instead. A test checks that every
// file in apps/ouro-md/ and assets/ is listed here, and that every file the kept
// pages and styles.css load is too.
export const kept = new Set([
  "/ouro-md-install.sh",
  "/apps/ouro-md",
  "/apps/ouro-md/",
  "/apps/ouro-md/index.html",
  "/apps/ouro-md/stable.json",
  "/assets/apple-touch-icon.png",
  "/assets/brand/ouro-hx-render-128.webp",
  "/assets/brand/ouro-hx-render-256.webp",
  "/assets/brand/ouro-render-128.webp",
  "/assets/brand/ouro-render-256.webp",
  "/assets/brand/ouro-render.webp",
  "/assets/brand/ouro.svg",
  "/assets/brand/shepherd-render-128.webp",
  "/assets/brand/shepherd-render-256.webp",
  "/assets/brand/shepherd-render.webp",
  "/assets/clips.js",
  "/assets/favicon-32x32.png",
  "/assets/fonts/cormorant-regular.woff2",
  "/assets/fonts/jetbrains-mono.woff2",
  "/assets/fonts/outfit.woff2",
  "/assets/media/ouro-hx-spoonjoy-xray-dark.webp",
  "/assets/media/ouro-hx-spoonjoy-xray-light.webp",
  "/assets/media/ouro-hx-spoonjoy-xray-og.png",
  "/assets/media/ouro-hx-spoonjoy-xray-provenance.json",
  "/assets/media/ouro-md-agent-edit-dark-poster.png",
  "/assets/media/ouro-md-agent-edit-dark.mp4",
  "/assets/media/ouro-md-agent-edit-dark.webm",
  "/assets/media/ouro-md-agent-edit-light-poster.png",
  "/assets/media/ouro-md-agent-edit-light.mp4",
  "/assets/media/ouro-md-agent-edit-light.webm",
  "/assets/media/ouro-md-typing-dark-poster.png",
  "/assets/media/ouro-md-typing-dark.mp4",
  "/assets/media/ouro-md-typing-dark.webm",
  "/assets/media/ouro-md-typing-light-poster.png",
  "/assets/media/ouro-md-typing-light.mp4",
  "/assets/media/ouro-md-typing-light.webm",
  "/assets/ouro-md-editing.png",
  "/assets/ouro-md-hero.mp4",
  "/assets/ouro-md-hero.png",
  "/assets/ouro-md-icon.png",
  "/assets/site-shell.js",
  "/assets/site-telemetry.js",
  "/styles.css",
  "/robots.txt",
  "/sitemap.xml",
]);
