#!/usr/bin/env bash
# Pre-flight and post-flight check for the ouro-apex Worker.
#
#   scripts/verify-endpoints.sh [base-url] > snapshot.txt
#
# KEEP lines follow redirects and print the final status and the decoded body's
# sha256 for each path the Ouro MD app, its installer or its App Store listing
# fetches: the bytes a client ends up with. Diff the KEEP and SCHEMA lines of a
# before and an after snapshot; they must be identical, whichever host serves
# the bytes. HOP lines show only the first hop (status and Location): after the
# 2026-11-07 move every ouro.bot path is a single 301 to ouroboros.bot.
#
# stable.json is checked for its fields, not its hash, because the hourly
# refresh workflow (ourostack/ouroboros-website, cron "17 * * * *") rewrites it
# whenever Ouro MD ships. Take both snapshots within the same hour, away from
# :17 past the hour.
set -euo pipefail
base="${1:-https://ouro.bot}"
tmp="$(mktemp -d)"

# First hop only: status, content type, Location.
hop() {
  local kind="$1" host="$2" path="$3"
  local code ctype loc
  read -r code ctype < <(curl -sS -o /dev/null -D "$tmp/head" -w '%{http_code} %{content_type}\n' "$host$path")
  loc="$(grep -i '^location:' "$tmp/head" | tr -d '\r' | cut -d' ' -f2- || true)"
  printf '%s\t%s\t%s\t%s\n' "$kind" "$path" "$code" "${loc:--}"
}

# Follow redirects: final status, sha256 of the decoded body.
keep() {
  local path="$1" code sum
  code="$(curl -sSL --compressed -o "$tmp/body" -w '%{http_code}' "$base$path")"
  sum="$(shasum -a 256 "$tmp/body" | cut -c1-64)"
  printf 'KEEP\t%s\t%s\t%s\n' "$path" "$code" "$sum"
}

# The bytes clients fetch must not change.
for path in \
  /ouro-md-install.sh \
  /assets/ouro-md-editing.png \
  /assets/fonts/cormorant-regular.woff2 \
  /assets/brand/ouro.svg \
  /assets/brand/ouro-render-128.webp \
  /assets/media/ouro-md-typing-light-poster.png \
  /assets/media/ouro-md-typing-light.mp4; do
  keep "$path"
done

# stable.json: final status and whether the fields Ouro MD's page reads are present.
code="$(curl -sSL --compressed -o "$tmp/stable" -w '%{http_code}' "$base/apps/ouro-md/stable.json")"
fields="$(node -e '
  const r = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  const ok = ["appName", "subtitle", "version", "releaseURL", "bundleIdentifier", "downloads"].every((k) => r[k])
    && r.appName === "Ouro MD" && r.bundleIdentifier === "bot.ouro.md"
    && r.downloads.zip?.sha256 && r.downloads.manifest?.sha256;
  console.log(ok ? "fields-ok" : "fields-missing");
' "$tmp/stable" 2>/dev/null || echo not-json)"
printf 'SCHEMA\t%s\t%s\t%s\n' /apps/ouro-md/stable.json "$code" "$fields"
# The download page still answers 200 at the end of its redirects.
printf 'PAGE\t%s\t%s\n' /apps/ouro-md/ "$(curl -sSL -o /dev/null -w '%{http_code} %{url_effective}' "$base/apps/ouro-md/")"

minute="$(date -u +%M)"
if [ "$minute" -ge 12 ] && [ "$minute" -le 25 ]; then
  echo "warning: the hourly stable.json refresh runs at :17; take both snapshots away from it" >&2
fi

# Where each path goes: a 301 to its home on ouroboros.bot (302 to GitHub for
# /support/ and /privacy/), and a 301 to the same path on ouroboros.bot for any other path.
for path in /ouro-md-install.sh /apps/ouro-md/ "/apps/ouro-md/?x=1" /apps/ouro-md /apps/ouro-md/index.html /apps/ouro-md/stable.json \
  /assets/ouro-md-icon.png /assets/ouro-md-editing.png /assets/site-shell.js /styles.css /robots.txt /sitemap.xml \
  / "/?ref=check" /index.html /apps/ /apps/ouro-hx/ /apps/shepherd/ /favicon.ico /privacy/ /support/ /no-such-page /apps/ouro-md/nope /assets/nope.png /nope/; do
  hop HOP "$base" "$path"
done

# www.ouro.bot forwards like the apex; ui.ouro.bot goes to ui.ouroboros.bot.
if [ "$base" = "https://ouro.bot" ]; then
  for path in / /apps/ouro-hx/ /apps/ouro-md/ /ouro-md-install.sh /nope/; do
    hop WWW https://www.ouro.bot "$path"
  done
  for path in / /docs/ "/r/registry.json?x=1"; do
    hop UI https://ui.ouro.bot "$path"
  done
fi

# The installer's own dependencies are on GitHub, not ouro.bot. Check they answer.
api="https://api.github.com/repos/ourostack/ouro-md/releases/latest"
printf 'GITHUB\t%s\t%s\n' "$api" "$(curl -sS -o /dev/null -w '%{http_code}' "$api")"
