# ouro-apps-site

Static app distribution site for `ouro.bot`.

## Local validation

```sh
npm ci
npm test
python3 -m http.server 4177
```

## Release metadata

Refresh Ouro MD stable metadata from GitHub Releases:

```sh
npm run refresh:ouro-md
npm test
```

The download page promotes the DMG automatically when the latest release has one.

## Deployment

GitHub Pages deploys on pushes to `main` at the GitHub-hosted preview URL.

Cloudflare Pages project:

```sh
npx wrangler pages deploy . --project-name ouro-apps-site --branch main
```

The intended app distribution route is `https://ouro.bot/apps/ouro-md/`.
`worker.js` and `wrangler.jsonc` proxy only the app-distribution paths from
`ouro.bot` to the Pages project so the existing apex-domain behavior can evolve
separately. `https://ouro.bot/` is intentionally not owned by this repo today.

```sh
npx wrangler deploy
```
