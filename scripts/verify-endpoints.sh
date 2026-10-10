#!/usr/bin/env bash
# Pre-flight and post-flight check for the ouro.bot forward.
#
#   scripts/verify-endpoints.sh [base-url] > snapshot.txt
#
# Prints one line per path the app, its installer, its App Store listing or its
# product page fetches: status, content type, decoded body sha256 and Location. Run it
# before and after deploying the ouro-apex Worker and diff the two "KEEP" blocks;
# they must be identical. The "FORWARD" block shows where everything else goes.
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
  /apps/ouro-md/stable.json \
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

# Expected to change: 302 to ouroboros.bot (or GitHub issues for /support/).
for path in / "/?ref=check" /index.html /privacy/ /support/ /no-such-page; do
  probe FORWARD "$path"
done

# The installer's own dependencies are on GitHub, not ouro.bot. Check they answer.
api="https://api.github.com/repos/ourostack/ouro-md/releases/latest"
printf 'GITHUB\t%s\t%s\n' "$api" "$(curl -sS -o /dev/null -w '%{http_code}' "$api")"
