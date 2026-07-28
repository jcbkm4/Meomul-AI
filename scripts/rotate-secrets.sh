#!/usr/bin/env bash
#
# Generate fresh application secrets and show exactly where each one has to be replaced.
#
# This prints values; it does not edit any file, because the same secrets live in more
# than one place (your workstation .env, the VM's .env.production) and a half-applied
# rotation locks you out of your own API.
#
# Usage:
#   ./scripts/rotate-secrets.sh
#
set -euo pipefail

gen() { node -e "console.log(require('crypto').randomBytes($1).toString('base64url'))"; }

JWT_SECRET="$(gen 64)"
COOKIE_SECRET="$(gen 32)"

cat <<EOF
================================================================================
 New application secrets
================================================================================

JWT_SECRET=${JWT_SECRET}
COOKIE_SECRET=${COOKIE_SECRET}

--------------------------------------------------------------------------------
 Where these go
--------------------------------------------------------------------------------

  1. meomul/.env                    (local development)
  2. /srv/meomul/.env.production    (on the VM)

Both apps validate at boot and refuse to start if either is shorter than 32
characters, so a truncated paste fails loudly rather than silently.

--------------------------------------------------------------------------------
 What this does NOT rotate — do these by hand
--------------------------------------------------------------------------------

  MongoDB Atlas password
    Atlas > Database Access > edit the user > Edit Password > Autogenerate.
    Then update MONGO_PROD in .env.production. This script cannot reach Atlas.

  SOLAPI API key/secret
    solapi.com console, if those credentials were ever exposed.

  Sentry DSNs
    Only if a DSN leaked somewhere it should not have. A DSN is write-only and
    is not a secret in the usual sense.

--------------------------------------------------------------------------------
 Effects to expect
--------------------------------------------------------------------------------

  Changing JWT_SECRET invalidates every access token immediately — all users are
  signed out. Refresh tokens live in the database and are unaffected by the
  secret change, so clients recover on their next silent refresh.

  Changing COOKIE_SECRET invalidates signed cookies.

  Rotate during a quiet window, and restart both api and batch afterwards:
    docker compose -f docker-compose.prod.yml --env-file .env.production up -d api batch

--------------------------------------------------------------------------------
 Why this is necessary
--------------------------------------------------------------------------------

  The previous values sat in plaintext in meomul/.env and scripts/azure/.env in a
  repository directory that was about to receive its first commit. Treat them as
  disclosed and replace them, even if no leak is known.

================================================================================
EOF
