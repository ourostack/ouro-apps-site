<!-- ourostack:brand:start -->
<p align="center">
  <a href="https://github.com/ourostack"><img src="https://raw.githubusercontent.com/ourostack/.github/main/brand/headers/ouro-apps-site.webp" alt="Ouro beside a market stall with a green-and-cream awning full of wrapped gift boxes, one box glowing open" width="100%"></a>
</p>
<!-- ourostack:brand:end -->

# ouro-apps-site

> **Moved: Ouro's public site is now [ouroboros.bot](https://ouroboros.bot)**
> (ourostack/ouroboros-website). ouro.bot forwards every path there.
>
> - 2026-11-06: the apps shelf that was this site's homepage moved to
>   https://ouroboros.bot/apps/, and the Ouro HX page to https://ui.ouroboros.bot/, the Ouro UI site.
> - 2026-11-07: Ouro MD's download page moved from `/apps/ouro-md/` to
>   https://ouroboros.bot/ouro-md/download/, its release metadata to
>   https://ouroboros.bot/ouro-md/stable.json (refreshed hourly there), and
>   the installer to https://ouroboros.bot/ouro-md-install.sh, with the files
>   the page loaded. The page, its assets and the refresh workflow were removed
>   from this repository.
>
> **New work:** pages, copy, Ouro MD's download page, its release metadata and
> the hosted installer are all edited in ourostack/ouroboros-website now. Change
> this repository only for the `ouro-apex` Worker's routing.

## What is left: the ouro-apex Worker

`worker.js`, `routes.js` and `wrangler.jsonc` define the `ouro-apex` Worker that fronts `ouro.bot/*`, `www.ouro.bot/*` and `ui.ouro.bot/*` (no other host). It serves nothing itself; every path redirects. `routes.js` is the routing table:

- **`forwards`:** each old ouro.bot page or file and its new home on ouroboros.bot, with a 301 that keeps the query: `/` and `/apps/` to `/apps/`, `/apps/ouro-hx/` straight to https://ui.ouroboros.bot/ (Ouro HX's home since 2026-11-07), Shepherd and the retired Workbench to `/apps/#shepherd`, `/apps/ouro-md/` to `/ouro-md/download/`, `/apps/ouro-md/stable.json` to `/ouro-md/stable.json`, `/ouro-md-install.sh` to the same path, and each old `/assets/` file to its copy there. A test fails if any destination is missing from the live site (or from a built ouroboros-website `dist/`, with `OUROBOROS_DIST=<path>`); ouroboros-website's `tests/ouro-bot-forwards.test.mjs` checks the same list against its build.
- **`elsewhere`:** Ouro MD's App Store support and privacy URLs, with a 302: `/support/` to its GitHub issues and `/privacy/` to its `PRIVACY.md`.
- **Anything else** gets a 301 to the same path (and query) on ouroboros.bot. A page that exists there opens; a missing one gets ouroboros.bot's "Lost in the coils" page with a real 404.
- **`www.ouro.bot`** forwards exactly like the apex. **`ui.ouro.bot`** was Ouro UI's site, which now lives at `ui.ouroboros.bot` (served by `site/host` in ourostack/ouro-ui); every path on it 301s to the same path, query included, there.

Every response carries `Strict-Transport-Security: max-age=31536000`, as ouroboros.bot's do. Browsers record HSTS only from an https response, so it protects ouro.bot once a browser has reached it over https; on a plain-HTTP request the header does nothing, and that request already gets its redirect straight to https on the new host.

Why 301s: the unified domain is Ari's decision (2026-11-06, extended to Ouro MD on 2026-11-07), the move is permanent, and search engines should carry the old pages' standing to ouroboros.bot. `curl -fsSL https://ouro.bot/ouro-md-install.sh | bash` keeps working, because `-L` follows the 301. The App Store support and privacy URLs stay 302s because they may still change.

```sh
npm test   # the Worker's contract; one test fetches the live ouroboros.bot
```

## Deploying the Worker

Merging to `main` does not deploy the Worker. Redeploy it by hand, only when you edit those files, and check the endpoints before and after.

The hourly refresh in ouroboros-website (cron `17 * * * *`) rewrites `stable.json` whenever Ouro MD ships, so the check compares that file's fields, not its hash. Take both snapshots within the same hour, away from :17 past the hour; the script warns between :12 and :25.

```sh
npx wrangler deployments list --name ouro-apex   # record the current version id for rollback
scripts/verify-endpoints.sh > before.txt
npx wrangler deploy
scripts/verify-endpoints.sh > after.txt
diff <(grep -E '^(KEEP|SCHEMA|PAGE)' before.txt) <(grep -E '^(KEEP|SCHEMA|PAGE)' after.txt)   # the bytes clients get must not change
# If anything is wrong: npx wrangler rollback <version id>
```

The Cloudflare Pages project `ouro-apps-site` that served the old files is no longer behind any route; the Worker stopped proxying to it on 2026-11-07.
