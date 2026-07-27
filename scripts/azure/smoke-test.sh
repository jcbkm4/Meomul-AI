#!/usr/bin/env bash
set -euo pipefail

# Required:
# FRONTEND_URL (e.g. https://meomul-frontend.<domain>)
# BACKEND_URL  (e.g. https://meomul-api.<domain>)
# Optional:
# TIMEOUT_SECONDS (default: 20)

: "${FRONTEND_URL:?FRONTEND_URL is required}"
: "${BACKEND_URL:?BACKEND_URL is required}"

TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-20}"

pass() { echo "[PASS] $1"; }
fail() { echo "[FAIL] $1"; exit 1; }

check_status() {
  local name="$1"
  local url="$2"
  local expected_regex="$3"

  local code
  code="$(curl -sS -L -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT_SECONDS" "$url" || true)"

  if [[ "$code" =~ $expected_regex ]]; then
    pass "$name ($code)"
  else
    fail "$name expected ${expected_regex}, got ${code} (${url})"
  fi
}

check_contains() {
  local name="$1"
  local url="$2"
  local needle="$3"

  local body
  body="$(curl -sS -L --max-time "$TIMEOUT_SECONDS" "$url" || true)"

  if echo "$body" | grep -q "$needle"; then
    pass "$name contains '${needle}'"
  else
    fail "$name missing '${needle}' (${url})"
  fi
}

echo "Running smoke tests..."

echo "1) Frontend root"
check_status "Frontend /" "${FRONTEND_URL}/" "^(200)$"
check_contains "Frontend HTML" "${FRONTEND_URL}/" "MEOMUL"

echo "2) Hotels page"
check_status "Frontend /hotels" "${FRONTEND_URL}/hotels" "^(200)$"

echo "3) Backend health"
check_status "Backend /health" "${BACKEND_URL}/health" "^(200)$"
check_contains "Backend health payload" "${BACKEND_URL}/health" '"status":"ok"'

echo "4) GraphQL reachability"
check_status "Backend /graphql" "${BACKEND_URL}/graphql" "^(200|400|405)$"

echo "5) Uploads route reachability"
check_status "Backend /uploads/default-avatar.png" "${BACKEND_URL}/uploads/default-avatar.png" "^(200|404)$"

cat <<OUT
Smoke tests passed.
Frontend: ${FRONTEND_URL}
Backend:  ${BACKEND_URL}
OUT
