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

### Auto-deploy on push to `main` (Cloudflare Pages Git integration)

Connect the repo once in the Cloudflare dashboard → **Workers & Pages → Pages →
the `ouro-apps-site` project → Settings → Builds & deployments → connect to Git**,
then set:

| Setting                | Value                    |
| ---------------------- | ------------------------ |
| Production branch      | `main`                   |
| Framework preset       | None                     |
| Build command          | `npm ci && npm run build`|
| Build output directory | `dist`                   |

After that, every push to `main` builds and deploys automatically — no secrets,
no GitHub Action required. The GitHub Actions workflow in `.github/workflows/ci.yml`
only runs the contract check (it does **not** deploy).

### Manual deploy (verification / until Git integration is connected)

```sh
npm run build
npx wrangler pages deploy dist --project-name ouro-apps-site --branch main
```

### The apex Worker (separate — only when it changes)

`worker.js` + `wrangler.jsonc` define the `ouro-apex` Worker that proxies
`ouro.bot/*` to the Pages deployment. It rarely changes; redeploy only when you
edit those two files:

```sh
npx wrangler deploy
```
