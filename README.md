<!-- ourostack:brand:start -->
<p align="center">
  <a href="https://github.com/ourostack"><img src="https://raw.githubusercontent.com/ourostack/.github/main/brand/headers/ouro-apps-site.webp" alt="Ouro beside a market stall with a green-and-cream awning full of wrapped gift boxes, one box glowing open" width="100%"></a>
</p>
<!-- ourostack:brand:end -->

# ouro-apps-site

> **Moved: Ouro's public site is now [ouroboros.bot](https://ouroboros.bot)**
> (ourostack/ouroboros-website), since 2026-11-06. The apps shelf that was this
> site's homepage is at https://ouroboros.bot/apps/, and the Ouro HX page is at
> https://ouroboros.bot/ouro-hx/. ouro.bot forwards each old page there.
>
> **What still lives here, on ouro.bot:** Ouro MD's download page
> (`/apps/ouro-md/`, its App Store marketing URL), `apps/ouro-md/stable.json`,
> the installer (`/ouro-md-install.sh`), the files those load, and the
> `ouro-apex` Worker (`worker.js`, `routes.js`).
>
> **New work:** pages, copy and product content go in ourostack/ouroboros-website.
> Change this repository only for Ouro MD's download page, its release metadata,
> the installer, or the Worker's routing. The old homepage (`index.html`) and
> `apps/ouro-hx/` were removed on 2026-11-06, after the forward went live.

The header, footer, fonts and colour tokens mirror ouroboros.bot's
`src/components/Nav.astro`, `Footer.astro` and `src/styles/global.css`. Change
them in both repositories together.

## Local development

```sh
npm ci
npm test                      # runs the site contract (scripts/check-site.mjs)
npm run build                 # contract check + assemble dist/
python3 -m http.server 4178   # then open http://localhost:4178/apps/ouro-md/
```

`scripts/check-site.mjs` is a guardrail: it keeps the shared ouroboros.bot
header and footer on Ouro MD's download page, the page the Ouro MD product page
(Shepherd, never the retired Workbench), its media real, and telemetry
lightweight. Change the IA
freely — just update the contract to match, keeping that spirit.

## Product imagery

The product shots (`assets/ouro-md-hero.png`, `assets/ouro-md-editing.png`) are
the **real Ouro MD rendering** of `scripts/hero-doc.md`, generated through the
app's own web layer (Vditor + Mermaid + KaTeX). They're committed; regenerate
only when the sample doc or the app's rendering changes:

```sh
npm run render:hero           # needs a sibling ouro-md checkout, or OURO_MD_WEB=...
```

## Release metadata

Refresh Ouro MD stable metadata from GitHub Releases (the download buttons and
version/signing badges read `apps/ouro-md/stable.json` at runtime):

```sh
npm run refresh:ouro-md
npm test
```

`.github/workflows/refresh-ouromd-release.yml` performs this refresh hourly and
commits changes after validating/building the site. When
`CLOUDFLARE_API_TOKEN` is configured, the same run deploys the refreshed build
to Pages; without it, source stays current but production deployment is skipped
with a warning.

## Deployment

Production is **Cloudflare Pages** (project `ouro-apps-site`), fronted by the
`ouro-apex` Worker which routes `ouro.bot/*` to the Pages origin.

### Auto-deploy on push to `main`

The Pages project `ouro-apps-site` is a **direct-upload** project, so Cloudflare
Pages Git integration can't attach to it (that's fixed when a project is created).
Instead, the `deploy` job in `.github/workflows/ci.yml` deploys on every push to
`main` via the Cloudflare API. The scoped **Cloudflare Pages · Edit** token and
Mendelow Studio account ID are configured as repo secrets.

To rotate the deploy token:

1. Create a scoped token: Cloudflare dashboard → **My Profile → API Tokens →
   Create Token**, permission **Account · Cloudflare Pages · Edit**.
2. Add it as a repo secret (`CLOUDFLARE_ACCOUNT_ID` is already set):

   ```sh
   gh secret set CLOUDFLARE_API_TOKEN --repo ourostack/ouro-apps-site
   ```

From then on, every push to `main` builds and deploys automatically.

### Manual deploy (interim / verification)

```sh
npm run deploy   # build + wrangler pages deploy dist
```

### The apex Worker (separate — only when it changes)

`worker.js`, `routes.js` and `wrangler.jsonc` define the `ouro-apex` Worker that fronts `ouro.bot/*` (not `ui.ouro.bot` or any other host). `routes.js` is the routing table:

- **`forwards`:** each old ouro.bot page and its new home on ouroboros.bot, with a 301. `/` and `/apps/` go to `/apps/`, `/apps/ouro-hx/` to `/ouro-hx/`, Shepherd and the retired Workbench to `/apps/#shepherd`. A test fails if any destination is missing from the live site (or from a built ouroboros-website `dist/`, with `OUROBOROS_DIST=<path>`); ouroboros-website's `tests/ouro-bot-forwards.test.mjs` checks the same list against its build.
- **`elsewhere`:** Ouro MD's App Store support and privacy URLs, with a 302: `/support/` to its GitHub issues and `/privacy/` to its `PRIVACY.md`.
- **`kept`:** the exact files proxied to Pages unchanged: the installer, Ouro MD's download page and `stable.json`, every file in `assets/`, `/styles.css`, `/robots.txt` and `/sitemap.xml`. When you add a file under `apps/ouro-md/` or `assets/`, add it here; a test fails until you do, and another fails if the download page or `styles.css` loads a file that is not kept.
- **Anything else** gets a 302 to the ouroboros.bot homepage, so no old ouro.bot link ends on a Pages error page.

Why 301 for the page forwards: the unified domain is Ari's decision (2026-11-06), the move is permanent, and search engines should carry the old pages' standing to ouroboros.bot. No kept path is ever redirected, so a cached 301 cannot hide Ouro MD's files. The App Store URLs and unknown paths stay 302s because they may still change.

Merging to `main` does not deploy the Worker; the Pages deploy in CI never touches it. Until someone runs `npx wrangler deploy`, `worker.js` on `main` can differ from the deployed Worker. Redeploy it by hand, only when you edit those files, and check the kept paths before and after.

The hourly refresh workflow (cron `17 * * * *`) rewrites `apps/ouro-md/stable.json` whenever Ouro MD ships, so the check compares that file's fields, not its hash. Take both snapshots within the same hour, away from :17 past the hour; the script warns between :12 and :25.

```sh
npx wrangler deployments list --name ouro-apex   # record the current version id for rollback
scripts/verify-endpoints.sh > before.txt
npx wrangler deploy
scripts/verify-endpoints.sh > after.txt
diff <(grep -E '^(KEEP|SCHEMA)' before.txt) <(grep -E '^(KEEP|SCHEMA)' after.txt)   # must print nothing
# If anything is wrong: npx wrangler rollback <version id>
```
