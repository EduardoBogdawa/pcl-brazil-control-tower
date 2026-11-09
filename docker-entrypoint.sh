#!/bin/sh
set -e

if [ ! -f /app/dist/index.html ]; then
  echo "[entrypoint] dist/index.html not found - the build stage did not produce the app" >&2
  exit 1
fi

echo "[entrypoint] starting on port ${PORT:-8080}"
exec "$@"
