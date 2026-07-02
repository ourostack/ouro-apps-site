# ouro-apps-site

The marketing + distribution site for **[ouro.bot](https://ouro.bot)** — the
home for Ouro's native Mac apps. The homepage is the Ouro app family; the
`/apps/ouro-md/` page is the Ouro MD product page.

## Local development

```sh
npm ci
npm test                      # runs the site contract (scripts/check-site.mjs)
npm run build                 # contract check + assemble dist/
python3 -m http.server 4178   # then open http://localhost:4178/
```

`scripts/check-site.mjs` is a guardrail: it keeps the homepage the Ouro *family*
home (Workbench + the family framing must survive), the app page the Ouro MD
product page, the hero a real render, and telemetry lightweight. Change the IA
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

## Deployment

Production is **Cloudflare Pages** (project `ouro-apps-site`), fronted by the
`ouro-apex` Worker which routes `ouro.bot/*` to the Pages origin.

### Auto-deploy on push to `main`

The Pages project `ouro-apps-site` is a **direct-upload** project, so Cloudflare
Pages Git integration can't attach to it (that's fixed when a project is created).
Instead, the `deploy` job in `.github/workflows/ci.yml` deploys on push to `main`
via the Cloudflare API. It's **dormant until a token is set** — the deploy step
skips cleanly, so builds stay green until then. To turn on hands-free deploys:

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

`worker.js` + `wrangler.jsonc` define the `ouro-apex` Worker that proxies
`ouro.bot/*` to the Pages deployment. It rarely changes; redeploy only when you
edit those two files:

```sh
npx wrangler deploy
```
