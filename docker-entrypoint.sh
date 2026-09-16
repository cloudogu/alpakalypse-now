#!/bin/sh

set -eu

secret_file=/data/better-auth-secret

: "${BETTER_AUTH_URL:=http://localhost:3000}"
export BETTER_AUTH_URL

if [ -z "${BETTER_AUTH_SECRET:-}" ]; then
  if [ ! -s "$secret_file" ]; then
    umask 077
    node -e 'process.stdout.write(`${require("node:crypto").randomBytes(32).toString("base64")}\n`)' > "$secret_file"
  fi

  IFS= read -r BETTER_AUTH_SECRET < "$secret_file"
  export BETTER_AUTH_SECRET
fi

exec "$@"
