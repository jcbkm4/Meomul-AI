#!/usr/bin/env bash
#
# Build and (re)start the Meomul stack on the VM. Safe to re-run; this is the normal
# deploy command.
#
# Usage (on the VM):
#   sudo bash /srv/meomul/scripts/gcp/deploy-vm.sh
#
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/meomul}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"

cd "${APP_DIR}"

if [[ ! -f .env.production ]]; then
  echo "ERROR: .env.production is missing in ${APP_DIR}"
  echo "Copy .env.production.example and fill it in first."
  exit 1
fi

# Fail early and loudly rather than letting a container abort on boot with a partial
# environment. Both apps validate their own env too, but a failed deploy is easier to
# read here than in container logs.
echo "==> Checking required environment variables"
missing=()
placeholder=()
while read -r key; do
  [[ -z "${key}" ]] && continue
  if ! grep -qE "^${key}=.+" .env.production; then
    missing+=("${key}")
  # A non-empty value is not necessarily a real one. The prepared .env.production ships
  # REPLACE_ markers for the secrets that must be rotated first, and those would
  # otherwise pass an is-it-set check and fail later as an auth error against Atlas or
  # SOLAPI — far from the cause.
  elif grep -qE "^${key}=.*REPLACE" .env.production; then
    placeholder+=("${key}")
  fi
done <<'KEYS'
APP_DOMAIN
API_DOMAIN
LETSENCRYPT_EMAIL
MONGO_PROD
JWT_SECRET
COOKIE_SECRET
FRONTEND_URL
NEXT_PUBLIC_GRAPHQL_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_CHAT_SOCKET_URL
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_BUILD_ID
SMS_PROVIDER
SOLAPI_API_KEY
SOLAPI_API_SECRET
SOLAPI_SENDER
KEYS

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "ERROR: these are unset or empty in .env.production:"
  printf '  - %s\n' "${missing[@]}"
  exit 1
fi

if [[ ${#placeholder[@]} -gt 0 ]]; then
  echo "ERROR: these still hold REPLACE_ placeholders in .env.production:"
  printf '  - %s\n' "${placeholder[@]}"
  echo
  echo "Rotate them first — see docs/launch-runbook.md step 1."
  exit 1
fi

# NEXT_PUBLIC_* values are inlined into the frontend bundle at build time, so the build
# id must change for each deploy or clients keep serving a stale cache key.
mkdir -p data/uploads
chown -R 1000:1000 data/uploads

echo "==> Pulling base images"
${COMPOSE} pull caddy redis || true

echo "==> Building and starting"
${COMPOSE} up -d --build

echo "==> Waiting for containers to report healthy"
# depends_on gates startup ordering, but this gives the deploy a pass/fail result
# instead of leaving a broken rollout looking successful.
deadline=$(( $(date +%s) + 180 ))
while :; do
  unhealthy="$(${COMPOSE} ps --format '{{.Service}} {{.Health}}' | awk '$2 != "healthy" && $2 != "" {print $1}')"
  if [[ -z "${unhealthy}" ]]; then
    echo "    all healthy"
    break
  fi
  if [[ $(date +%s) -ge ${deadline} ]]; then
    echo "ERROR: still unhealthy after 180s: ${unhealthy}"
    ${COMPOSE} ps
    echo
    echo "Logs from the failing services:"
    for svc in ${unhealthy}; do
      echo "----- ${svc} -----"
      ${COMPOSE} logs --tail 40 "${svc}"
    done
    exit 1
  fi
  sleep 5
done

echo
${COMPOSE} ps
echo
echo "==> Deploy complete."
echo "    Index sync runs automatically in the batch worker (RUN_INDEX_SYNC)."
echo "    Verify with: ${COMPOSE} logs batch | grep -i 'index sync'"
