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

GitHub Pages deploys on pushes to `main`.

Cloudflare Pages project:

```sh
npx wrangler pages deploy . --project-name ouro-apps-site --branch main
```

The intended custom domain is `ouro.bot`.
