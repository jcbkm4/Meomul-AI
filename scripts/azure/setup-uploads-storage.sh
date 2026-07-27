#!/usr/bin/env bash
set -euo pipefail

# One-time setup and migration for production uploads.
# Required:
#   AZ_RESOURCE_GROUP, AZ_LOCATION, AZ_ENV_NAME
# Optional:
#   AZ_SUBSCRIPTION_ID
#   AZ_UPLOADS_STORAGE_NAME (default: meomuluploads)
#   AZ_UPLOADS_ACCOUNT_NAME (default: auto-generated)
#   AZ_UPLOADS_SHARE_NAME (default: meomul-uploads)
#   LOCAL_UPLOADS_DIR (default: <repo>/meomul/uploads)
#   AZ_UPLOADS_MOUNT_PATH (default: /app/uploads)

: "${AZ_RESOURCE_GROUP:?AZ_RESOURCE_GROUP is required}"
: "${AZ_LOCATION:?AZ_LOCATION is required}"
: "${AZ_ENV_NAME:?AZ_ENV_NAME is required}"

if [[ -n "${AZ_SUBSCRIPTION_ID:-}" ]]; then
  az account set --subscription "$AZ_SUBSCRIPTION_ID"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

AZ_UPLOADS_STORAGE_NAME="${AZ_UPLOADS_STORAGE_NAME:-meomuluploads}"
AZ_UPLOADS_SHARE_NAME="${AZ_UPLOADS_SHARE_NAME:-meomul-uploads}"
AZ_UPLOADS_MOUNT_PATH="${AZ_UPLOADS_MOUNT_PATH:-/app/uploads}"
LOCAL_UPLOADS_DIR="${LOCAL_UPLOADS_DIR:-${REPO_ROOT}/meomul/uploads}"

if [[ -z "${AZ_UPLOADS_ACCOUNT_NAME:-}" ]]; then
  base_name="${AZ_ENV_NAME//-/}uploads"
  base_name="$(echo "$base_name" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9')"
  suffix="$(date +%m%d%H%M%S)"
  AZ_UPLOADS_ACCOUNT_NAME="${base_name}${suffix}"
  AZ_UPLOADS_ACCOUNT_NAME="${AZ_UPLOADS_ACCOUNT_NAME:0:24}"
fi

if [[ ! -d "$LOCAL_UPLOADS_DIR" ]]; then
  echo "Local uploads directory not found: $LOCAL_UPLOADS_DIR"
  exit 1
fi

echo "[1/5] Creating storage account (if missing)..."
if ! az storage account show --name "$AZ_UPLOADS_ACCOUNT_NAME" --resource-group "$AZ_RESOURCE_GROUP" >/dev/null 2>&1; then
  az storage account create \
    --name "$AZ_UPLOADS_ACCOUNT_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --location "$AZ_LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 1>/dev/null
fi

AZ_UPLOADS_ACCOUNT_KEY="$(az storage account keys list --resource-group "$AZ_RESOURCE_GROUP" --account-name "$AZ_UPLOADS_ACCOUNT_NAME" --query '[0].value' -o tsv)"

echo "[2/5] Creating file share (if missing)..."
az storage share-rm create \
  --resource-group "$AZ_RESOURCE_GROUP" \
  --storage-account "$AZ_UPLOADS_ACCOUNT_NAME" \
  --name "$AZ_UPLOADS_SHARE_NAME" 1>/dev/null

echo "[3/5] Binding Azure File storage to Container Apps environment..."
az containerapp env storage set \
  --name "$AZ_ENV_NAME" \
  --resource-group "$AZ_RESOURCE_GROUP" \
  --storage-name "$AZ_UPLOADS_STORAGE_NAME" \
  --access-mode ReadWrite \
  --azure-file-account-name "$AZ_UPLOADS_ACCOUNT_NAME" \
  --azure-file-account-key "$AZ_UPLOADS_ACCOUNT_KEY" \
  --azure-file-share-name "$AZ_UPLOADS_SHARE_NAME" 1>/dev/null

echo "[4/5] Uploading local uploads directory to Azure File Share..."
az storage file upload-batch \
  --account-name "$AZ_UPLOADS_ACCOUNT_NAME" \
  --account-key "$AZ_UPLOADS_ACCOUNT_KEY" \
  --destination "$AZ_UPLOADS_SHARE_NAME" \
  --source "$LOCAL_UPLOADS_DIR" 1>/dev/null

echo "[5/5] Completed. Add these values to scripts/azure/.env"
cat <<OUT
AZ_UPLOADS_STORAGE_NAME=${AZ_UPLOADS_STORAGE_NAME}
AZ_UPLOADS_ACCOUNT_NAME=${AZ_UPLOADS_ACCOUNT_NAME}
AZ_UPLOADS_ACCOUNT_KEY=${AZ_UPLOADS_ACCOUNT_KEY}
AZ_UPLOADS_SHARE_NAME=${AZ_UPLOADS_SHARE_NAME}
AZ_UPLOADS_MOUNT_PATH=${AZ_UPLOADS_MOUNT_PATH}
OUT
