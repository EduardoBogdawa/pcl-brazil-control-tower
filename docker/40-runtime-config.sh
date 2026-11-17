#!/bin/sh
# Writes browser-visible settings to runtime-config.js at container start.
# Only the allowlisted public keys below are read; every other variable (SQL_PASSWORD, secrets, ...) is ignored.
set -eu
# Patterns below contain glob characters; disable pathname expansion while iterating them.
set -f

# Outside the read-only web root so the container can run as a non-root user (see nginx.conf alias).
OUT="${RUNTIME_CONFIG_PATH:-/usr/share/nginx/runtime/runtime-config.js}"

GUID='[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}'
HTTPS_URL='https://[A-Za-z0-9.-]+(:[0-9]{1,5})?(/[A-Za-z0-9._~-]+)*/?'

# key|min length|max length|regex (values must match exactly; empty means "not set").
# Length limits live outside the regex: musl/BusyBox grep rejects {m,n} above RE_DUP_MAX (255).
ALLOWLIST="
VITE_ENTRA_TENANT_ID|1|253|($GUID|[A-Za-z0-9][A-Za-z0-9.-]*)
VITE_ENTRA_CLIENT_ID|36|36|$GUID
VITE_ENTRA_AUTHORITY|1|2048|$HTTPS_URL
VITE_ENTRA_API_SCOPE|1|256|[A-Za-z0-9:/._~-]+
VITE_SUPABASE_URL|1|2048|$HTTPS_URL
VITE_SUPABASE_ANON_KEY|20|4096|[A-Za-z0-9._-]+
"

set --
invalid=0
for entry in $ALLOWLIST; do
  key="${entry%%|*}"; rest="${entry#*|}"
  min="${rest%%|*}"; rest="${rest#*|}"
  max="${rest%%|*}"; pattern="${rest#*|}"
  value="$(printenv "$key" 2>/dev/null || true)"
  [ -z "$value" ] && continue
  len=${#value}
  if [ "$len" -ge "$min" ] && [ "$len" -le "$max" ] \
     && printf '%s' "$value" | grep -Eqx "$pattern" && [ "$(printf '%s' "$value" | wc -l)" -eq 0 ]; then
    set -- "$@" --arg "$key" "$value"
  else
    # Never echo the value itself.
    echo "runtime-config: $key has an invalid format" >&2
    invalid=1
  fi
done

[ "$invalid" -eq 0 ] || exit 1

for required in VITE_ENTRA_TENANT_ID VITE_ENTRA_CLIENT_ID VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY; do
  [ -n "$(printenv "$required" 2>/dev/null || true)" ] || echo "runtime-config: warning: $required is not set" >&2
done

# jq builds the JSON (proper escaping); "<" is escaped as well so the payload can never close a script tag.
json="$(jq -cn '$ARGS.named' "$@" | sed 's/</\\u003c/g')"
tmp="$OUT.tmp"
printf 'window.__RUNTIME_CONFIG__ = Object.freeze(%s);\n' "$json" > "$tmp"
mv "$tmp" "$OUT"
echo "runtime-config: wrote $(printf '%s' "$json" | jq -r 'keys | join(", ")') to $OUT"
