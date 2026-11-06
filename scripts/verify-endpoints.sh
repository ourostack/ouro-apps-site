#!/usr/bin/env bash
# Pre-flight and post-flight check for the ouro.bot forward.
#
#   scripts/verify-endpoints.sh [base-url] > snapshot.txt
#
# Prints one line per path the app, its installer, its App Store listing or its
# product page fetches: status, content type, decoded body sha256 and Location. Run it
# before and after deploying the ouro-apex Worker and diff the "KEEP" and "SCHEMA"
# lines; they must be identical. The "FORWARD" block shows where everything else goes.
#
# apps/ouro-md/stable.json is checked for its fields, not its hash, because the
# hourly refresh workflow (cron "17 * * * *") rewrites it whenever Ouro MD ships.
# Take both snapshots within the same hour, away from :17 past the hour.
set -euo pipefail
base="${1:-https://ouro.bot}"
tmp="$(mktemp -d)"

probe() {
  local kind="$1" path="$2"
  local code ctype loc sum
  read -r code ctype < <(curl -sS --compressed -o "$tmp/body" -D "$tmp/head" -w '%{http_code} %{content_type}\n' "$base$path")
  loc="$(grep -i '^location:' "$tmp/head" | tr -d '\r' | cut -d' ' -f2- || true)"
  sum="$(shasum -a 256 "$tmp/body" | cut -c1-64)"
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$kind" "$path" "$code" "${ctype:--}" "$sum" "${loc:--}"
}

# Must be unchanged by the forward.
for path in \
  /ouro-md-install.sh \
  /apps/ouro-md/ \
  /apps/ouro-md \
  /apps/ouro-md/index.html \
  /assets/ouro-md-icon.png \
  /assets/ouro-md-hero.png \
  /assets/ouro-md-hero.mp4 \
  /assets/ouro-md-editing.png \
  /assets/site-telemetry.js \
  /assets/favicon-32x32.png \
  /assets/apple-touch-icon.png \
  /styles.css \
  /robots.txt \
  /sitemap.xml; do
  probe KEEP "$path"
done

# stable.json: status, content type and whether the fields Ouro MD's page reads are present.
read -r code ctype < <(curl -sS --compressed -o "$tmp/stable" -w '%{http_code} %{content_type}\n' "$base/apps/ouro-md/stable.json")
fields="$(node -e '
  const r = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  const ok = ["appName", "subtitle", "version", "releaseURL", "bundleIdentifier", "downloads"].every((k) => r[k])
    && r.appName === "Ouro MD" && r.bundleIdentifier === "bot.ouro.md"
    && r.downloads.zip?.sha256 && r.downloads.manifest?.sha256;
  console.log(ok ? "fields-ok" : "fields-missing");
' "$tmp/stable" 2>/dev/null || echo not-json)"
printf 'SCHEMA\t%s\t%s\t%s\t%s\n' /apps/ouro-md/stable.json "$code" "${ctype:--}" "$fields"

minute="$(date -u +%M)"
if [ "$minute" -ge 12 ] && [ "$minute" -le 25 ]; then
  echo "warning: the hourly stable.json refresh runs at :17; take both snapshots away from it" >&2
fi

# Expected to change: 302 to ouroboros.bot, or to GitHub for /support/ and /privacy/.
for path in / "/?ref=check" /index.html /privacy/ /support/ /no-such-page /apps/ /apps/ouro-md/nope /assets/nope.png; do
  probe FORWARD "$path"
done

# The installer's own dependencies are on GitHub, not ouro.bot. Check they answer.
api="https://api.github.com/repos/ourostack/ouro-md/releases/latest"
printf 'GITHUB\t%s\t%s\n' "$api" "$(curl -sS -o /dev/null -w '%{http_code}' "$api")"
