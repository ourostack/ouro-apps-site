# AGENTS.md

**Moved:** Ouro's public site is [ouroboros.bot](https://ouroboros.bot) (ourostack/ouroboros-website) since 2026-11-06 (Ari: "we need a unified domain"). The apps shelf moved to https://ouroboros.bot/apps/ and the Ouro HX page to https://ouroboros.bot/ouro-hx/. ouro.bot forwards each old page there.

## What still lives here

- Ouro MD's download page, `apps/ouro-md/index.html`, served at https://ouro.bot/apps/ouro-md/. It is Ouro MD's App Store marketing URL, so it stays on ouro.bot until that URL changes in App Store Connect.
- `apps/ouro-md/stable.json`, rewritten hourly by `.github/workflows/refresh-ouromd-release.yml`.
- The installer, `ouro-md-install.sh`, at https://ouro.bot/ouro-md-install.sh.
- The files those load (`assets/`, `styles.css`).
- The `ouro-apex` Worker: `worker.js`, its routing table `routes.js`, and `wrangler.jsonc`. It is deployed only by hand; see the README.

The old homepage (`index.html`) and `apps/ouro-hx/` were removed on 2026-11-06, after the forward went live. Don't add pages here.

## The rule for new work

- Pages, copy and product content go in ourostack/ouroboros-website.
- Change this repository only for Ouro MD's download page, its release metadata, the installer, or the Worker's routing.
- When a page on ouroboros.bot that ouro.bot forwards to moves, update `forwards` in `routes.js` and ouroboros-website's `tests/ouro-bot-forwards.test.mjs` together.
- `npm test` runs the site contract and the Worker tests; one of them fetches the live ouroboros.bot.

## Git

- Commit email: `16390116+arimendelow@users.noreply.github.com`.
- No AI attribution in commits or PRs.
