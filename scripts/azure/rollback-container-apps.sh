#!/usr/bin/env bash
set -euo pipefail

# Required:
# AZ_RESOURCE_GROUP, AZ_API_APP_NAME, AZ_FRONTEND_APP_NAME, AZ_BATCH_APP_NAME
# Optional:
# AZ_SUBSCRIPTION_ID
# AZ_API_REVISION, AZ_FRONTEND_REVISION, AZ_BATCH_REVISION

: "${AZ_RESOURCE_GROUP:?AZ_RESOURCE_GROUP is required}"
: "${AZ_API_APP_NAME:?AZ_API_APP_NAME is required}"
: "${AZ_FRONTEND_APP_NAME:?AZ_FRONTEND_APP_NAME is required}"
: "${AZ_BATCH_APP_NAME:?AZ_BATCH_APP_NAME is required}"

if [[ -n "${AZ_SUBSCRIPTION_ID:-}" ]]; then
  az account set --subscription "$AZ_SUBSCRIPTION_ID"
fi

pick_previous_revision() {
  local app_name="$1"
  az containerapp revision list \
    --name "$app_name" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --query "sort_by([], &properties.createdTime)[-2].name" \
    -o tsv
}

activate_ingress_revision() {
  local app_name="$1"
  local revision_name="$2"

  if [[ -z "$revision_name" || "$revision_name" == "null" ]]; then
    echo "No rollback revision found for ${app_name}."
    return 1
  fi

  echo "Routing ${app_name} traffic to revision: ${revision_name}"
  az containerapp revision set-mode \
    --name "$app_name" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --mode multiple 1>/dev/null

  az containerapp revision activate \
    --name "$app_name" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --revision "$revision_name" 1>/dev/null

  az containerapp ingress traffic set \
    --name "$app_name" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --revision-weight "${revision_name}=100" 1>/dev/null
}

activate_background_revision() {
  local app_name="$1"
  local revision_name="$2"

  if [[ -z "$revision_name" || "$revision_name" == "null" ]]; then
    echo "No rollback revision found for ${app_name}."
    return 1
  fi

  echo "Activating ${app_name} revision: ${revision_name}"
  az containerapp revision set-mode \
    --name "$app_name" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --mode multiple 1>/dev/null

  az containerapp revision activate \
    --name "$app_name" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --revision "$revision_name" 1>/dev/null
}

API_REVISION="${AZ_API_REVISION:-$(pick_previous_revision "$AZ_API_APP_NAME")}"
FRONTEND_REVISION="${AZ_FRONTEND_REVISION:-$(pick_previous_revision "$AZ_FRONTEND_APP_NAME")}"
BATCH_REVISION="${AZ_BATCH_REVISION:-$(pick_previous_revision "$AZ_BATCH_APP_NAME")}"

activate_ingress_revision "$AZ_API_APP_NAME" "$API_REVISION"
activate_ingress_revision "$AZ_FRONTEND_APP_NAME" "$FRONTEND_REVISION"
activate_background_revision "$AZ_BATCH_APP_NAME" "$BATCH_REVISION"

API_FQDN="$(az containerapp show --name "$AZ_API_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)"
FRONTEND_FQDN="$(az containerapp show --name "$AZ_FRONTEND_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)"

cat <<OUT
Rollback complete.
API revision:      ${API_REVISION}
Frontend revision: ${FRONTEND_REVISION}
Batch revision:    ${BATCH_REVISION}
API URL:           https://${API_FQDN}
Frontend URL:      https://${FRONTEND_FQDN}
OUT
