# AGENTS.md

**Moved:** Ouro's public site is [ouroboros.bot](https://ouroboros.bot) (ourostack/ouroboros-website) since 2026-11-06 (Ari: "we need a unified domain"). The apps shelf moved to https://ouroboros.bot/apps/ and the Ouro HX page to https://ui.ouroboros.bot/, the Ouro UI site, its one home with UI and AX since 2026-11-07. ouro.bot forwards each old page straight to its home.

**Moved, 2026-11-07:** Ouro MD's download page moved from https://ouro.bot/apps/ouro-md/ to https://ouroboros.bot/ouro-md/download/ (Ari: "move every surface to ouroboros.bot and have ouro.bot forward"), with its release metadata (https://ouroboros.bot/ouro-md/stable.json and its hourly refresh workflow), the one-line installer (https://ouroboros.bot/ouro-md-install.sh) and the files the page loaded. They were removed from this repository after the forward went live; every old path 301s to its new home.

## Pull requests merge within 30 minutes

Follow ourostack's shared rule, [every PR merges within 30 minutes](https://github.com/ourostack/.github/blob/main/agents/prs-merge-within-30-minutes.md). Finish, review and validate on your branch first, then publish with `gh ouro-pr`, which turns auto-merge on so green means merged. When a PR here shows on the [PR clock](https://github.com/ourostack/.github/issues?q=is%3Aissue+is%3Aopen+label%3Apr-clock), act on it now: merge it if green, fix the cause if red (file an issue before any rerun), rebase it if conflicted, or close it with a reason if it isn't going anywhere.

## What still lives here

- The `ouro-apex` Worker: `worker.js`, its routing table `routes.js`, and `wrangler.jsonc`. It is deployed only by hand; see the README.

Don't add pages or files here.

## The rule for new work

- Pages, copy and product content go in ourostack/ouroboros-website. That includes Ouro MD's download page (`src/pages/ouro-md/download.astro`), its `stable.json` and the hosted installer; taste rounds on that page edit ouroboros-website.
- Change this repository only for the Worker's routing.
- When a page or file on ouroboros.bot that ouro.bot forwards to moves, update `forwards` in `routes.js` and ouroboros-website's `tests/ouro-bot-forwards.test.mjs` together.
- `npm test` runs the Worker tests; one of them fetches the live ouroboros.bot.

## Git

- Commit email: `16390116+arimendelow@users.noreply.github.com`.
- No AI attribution in commits or PRs.
