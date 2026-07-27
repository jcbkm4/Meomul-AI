#!/usr/bin/env bash
set -euo pipefail

# Orchestrator: deploy -> smoke test -> auto rollback on failure
# Required env:
# AZ_RESOURCE_GROUP, AZ_API_APP_NAME, AZ_FRONTEND_APP_NAME, AZ_BATCH_APP_NAME
# plus all deploy-container-apps.sh required envs
# Optional:
# AZ_SUBSCRIPTION_ID, TIMEOUT_SECONDS, AUTO_ROLLBACK_ON_FAIL

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SCRIPT="${SCRIPT_DIR}/deploy-container-apps.sh"
SMOKE_SCRIPT="${SCRIPT_DIR}/smoke-test.sh"
ROLLBACK_SCRIPT="${SCRIPT_DIR}/rollback-container-apps.sh"

AUTO_ROLLBACK_ON_FAIL="${AUTO_ROLLBACK_ON_FAIL:-true}"

run_rollback() {
  echo "[ROLLBACK] Starting automatic rollback..."
  if [[ "${AUTO_ROLLBACK_ON_FAIL}" != "true" ]]; then
    echo "[ROLLBACK] Skipped (AUTO_ROLLBACK_ON_FAIL=${AUTO_ROLLBACK_ON_FAIL})"
    return 0
  fi

  if bash "${ROLLBACK_SCRIPT}"; then
    echo "[ROLLBACK] Completed successfully."
  else
    echo "[ROLLBACK] Failed. Manual intervention required."
  fi
}

echo "[1/4] Deploying API + frontend + batch..."
bash "${DEPLOY_SCRIPT}"

echo "[2/4] Resolving app URLs from Azure..."
if [[ -n "${AZ_SUBSCRIPTION_ID:-}" ]]; then
  az account set --subscription "$AZ_SUBSCRIPTION_ID"
fi

: "${AZ_RESOURCE_GROUP:?AZ_RESOURCE_GROUP is required}"
: "${AZ_API_APP_NAME:?AZ_API_APP_NAME is required}"
: "${AZ_FRONTEND_APP_NAME:?AZ_FRONTEND_APP_NAME is required}"

BACKEND_FQDN="$(az containerapp show --name "$AZ_API_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)"
FRONTEND_FQDN="$(az containerapp show --name "$AZ_FRONTEND_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)"

if [[ -z "$BACKEND_FQDN" || -z "$FRONTEND_FQDN" ]]; then
  echo "[ERROR] Could not resolve backend/frontend FQDN after deploy."
  run_rollback
  exit 1
fi

export BACKEND_URL="https://${BACKEND_FQDN}"
export FRONTEND_URL="https://${FRONTEND_FQDN}"

echo "[3/4] Running smoke tests..."
if bash "${SMOKE_SCRIPT}"; then
  echo "[4/4] Deployment verified successfully."
  cat <<OUT

SUCCESS
Frontend URL: ${FRONTEND_URL}
Backend URL:  ${BACKEND_URL}
Health URL:   ${BACKEND_URL}/health
GraphQL URL:  ${BACKEND_URL}/graphql

OUT
  exit 0
fi

echo "[ERROR] Smoke tests failed."
run_rollback
exit 1
