// The ouro-apex Worker's routing table (worker.js imports it; so do the tests).
//
// Ouro's public home is ouroboros.bot (Ari, 2026-11-06: "we need a unified
// domain"). Each old ouro.bot page forwards to its new home there. Ouro MD's
// download page, its release metadata, its installer and the files the page
// loaded followed on 2026-11-07 (Ari: "move every surface to ouroboros.bot and
// have ouro.bot forward"), so ouro.bot serves no files of its own any more.

export const home = "https://ouroboros.bot";
// Ouro UI's site moved from ui.ouro.bot to ui.ouroboros.bot (Ari, 2026-11-07); every path
// on the old host forwards to the same path there. ourostack/ouro-ui site/host serves it.
export const uiOld = "ui.ouro.bot";
export const uiHome = "https://ui.ouroboros.bot";

const download = `${home}/ouro-md/download/`;
const mdIcon = `${home}/brand/ouro-md-icon.png`;

// Old ouro.bot paths and their new homes. These are 301s: the move is permanent.
// ourostack/ouroboros-website tests/ouro-bot-forwards.test.mjs checks that each
// destination exists in that site's build; tests/worker.test.mjs checks them live.
export const forwards = new Map([
  ["/", `${home}/apps/`],
  ["/index.html", `${home}/apps/`],
  ["/apps", `${home}/apps/`],
  ["/apps/", `${home}/apps/`],
  ["/apps/index.html", `${home}/apps/`],
  // Ouro HX's page lives on the Ouro UI site, its one home with UI and AX (Ari, 2026-11-07: "let's unify"); straight there, one hop.
  ["/apps/ouro-hx", `${uiHome}/`],
  ["/apps/ouro-hx/", `${uiHome}/`],
  ["/apps/ouro-hx/index.html", `${uiHome}/`],
  // Shepherd superseded Workbench (Ari, 2026-10-31); neither ever had its own page here.
  ["/apps/shepherd", `${home}/apps/#shepherd`],
  ["/apps/shepherd/", `${home}/apps/#shepherd`],
  ["/apps/ouro-shepherd", `${home}/apps/#shepherd`],
  ["/apps/ouro-shepherd/", `${home}/apps/#shepherd`],
  ["/apps/ouro-workbench", `${home}/apps/#shepherd`],
  ["/apps/ouro-workbench/", `${home}/apps/#shepherd`],
  ["/favicon.ico", `${home}/favicon.ico`],

  // Ouro MD's download page (its App Store marketing URL once), its release
  // metadata and its one-line installer. curl -L follows the installer's 301.
  ["/apps/ouro-md", download],
  ["/apps/ouro-md/", download],
  ["/apps/ouro-md/index.html", download],
  ["/apps/ouro-md/stable.json", `${home}/ouro-md/stable.json`],
  ["/ouro-md-install.sh", `${home}/ouro-md-install.sh`],

  // The files the download page loaded, each to its copy on ouroboros.bot
  // (byte for byte, except where noted).
  ["/assets/ouro-md-editing.png", `${home}/images/workshop/ouro-md-editing.png`],
  ...["typing", "agent-edit"].flatMap((clip) => ["light", "dark"].flatMap((theme) => [
    [`/assets/media/ouro-md-${clip}-${theme}.mp4`, `${home}/images/workshop/ouro-md-${clip}-${theme}.mp4`],
    [`/assets/media/ouro-md-${clip}-${theme}.webm`, `${home}/images/workshop/ouro-md-${clip}-${theme}.webm`],
    [`/assets/media/ouro-md-${clip}-${theme}-poster.png`, `${home}/images/workshop/ouro-md-${clip}-${theme}-poster.png`],
  ])),
  // The Ouro HX page's files: the X-ray shots and the mark on the Ouro UI site (byte for byte at 1600 wide),
  // their provenance in its repository, and its old share image the site's own card.
  ["/assets/media/ouro-hx-spoonjoy-xray-dark.webp", `${uiHome}/showcase/spoonjoy-xray-dark-1600.webp`],
  ["/assets/media/ouro-hx-spoonjoy-xray-light.webp", `${uiHome}/showcase/spoonjoy-xray-light-1600.webp`],
  ["/assets/media/ouro-hx-spoonjoy-xray-provenance.json", "https://github.com/ourostack/ouro-ui/blob/main/site/showcase/provenance.json"],
  ["/assets/media/ouro-hx-spoonjoy-xray-og.png", `${uiHome}/og/home.jpg`],
  ...["ouro-hx-render-128.webp", "ouro-hx-render-256.webp"].map((file) => [`/assets/brand/${file}`, `${uiHome}/brand/${file}`]),
  ...["ouro.svg", "ouro-render.webp", "ouro-render-128.webp", "ouro-render-256.webp", "shepherd-render.webp", "shepherd-render-128.webp", "shepherd-render-256.webp"]
    .map((file) => [`/assets/brand/${file}`, `${home}/brand/${file}`]),
  ...["cormorant-regular.woff2", "jetbrains-mono.woff2", "outfit.woff2"].map((file) => [`/assets/fonts/${file}`, `${home}/fonts/${file}`]),
  // Ouro MD's icon, at the sizes ouro.bot served it: the same art, at 256px.
  ["/assets/ouro-md-icon.png", mdIcon],
  ["/assets/apple-touch-icon.png", mdIcon],
  ["/assets/favicon-32x32.png", mdIcon],
  // The old hero shot and clip, retired before the move: their successors, the typing clip.
  ["/assets/ouro-md-hero.png", `${home}/images/workshop/ouro-md-typing-light-poster.png`],
  ["/assets/ouro-md-hero.mp4", `${home}/images/workshop/ouro-md-typing-light.mp4`],
  // The page's own code and stylesheet: ouroboros.bot's layout replaced them, so they lead to the page.
  ["/styles.css", download],
  ["/assets/site-shell.js", download],
  ["/assets/clips.js", download],
  ["/assets/site-telemetry.js", download],
  ["/robots.txt", `${home}/robots.txt`],
  // ouroboros.bot's /sitemap.xml redirects to its index; go there in one hop.
  ["/sitemap.xml", `${home}/sitemap-index.xml`],
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
