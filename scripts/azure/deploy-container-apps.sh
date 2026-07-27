#!/usr/bin/env bash
set -euo pipefail

# Required environment variables:
# AZ_RESOURCE_GROUP, AZ_LOCATION, AZ_ACR_NAME, AZ_ENV_NAME,
# AZ_API_APP_NAME, AZ_FRONTEND_APP_NAME, AZ_BATCH_APP_NAME,
# MONGO_PROD, JWT_SECRET, COOKIE_SECRET
# Optional:
# AZ_SUBSCRIPTION_ID, AZ_IMAGE_TAG, AZ_IMAGE_TAG_SUFFIX,
# AZ_API_CPU, AZ_API_MEMORY, AZ_API_MIN_REPLICAS, AZ_API_MAX_REPLICAS,
# AZ_FRONTEND_CPU, AZ_FRONTEND_MEMORY, AZ_FRONTEND_MIN_REPLICAS, AZ_FRONTEND_MAX_REPLICAS,
# AZ_BATCH_CPU, AZ_BATCH_MEMORY, BUILD_MODE,
# FRONTEND_URL, BACKEND_URL, SOCKET_CORS_ORIGINS,
# JWT_EXPIRES_IN, REDIS_URL, REDIS_SOCKET_ENABLED,
# AZ_UPLOADS_STORAGE_NAME, AZ_UPLOADS_ACCOUNT_NAME, AZ_UPLOADS_ACCOUNT_KEY, AZ_UPLOADS_SHARE_NAME, AZ_UPLOADS_MOUNT_PATH

: "${AZ_RESOURCE_GROUP:?AZ_RESOURCE_GROUP is required}"
: "${AZ_LOCATION:?AZ_LOCATION is required}"
: "${AZ_ACR_NAME:?AZ_ACR_NAME is required}"
: "${AZ_ENV_NAME:?AZ_ENV_NAME is required}"
: "${AZ_API_APP_NAME:?AZ_API_APP_NAME is required}"
: "${AZ_FRONTEND_APP_NAME:?AZ_FRONTEND_APP_NAME is required}"
: "${AZ_BATCH_APP_NAME:?AZ_BATCH_APP_NAME is required}"
: "${MONGO_PROD:?MONGO_PROD is required}"
: "${JWT_SECRET:?JWT_SECRET is required}"
: "${COOKIE_SECRET:?COOKIE_SECRET is required}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

ENV_RESOURCE_GROUP="${ENV_RESOURCE_GROUP:-}"
ENV_REFERENCE="${ENV_REFERENCE:-}"

AZ_IMAGE_TAG_BASE="${AZ_IMAGE_TAG:-release}"
AZ_IMAGE_TAG_SUFFIX="${AZ_IMAGE_TAG_SUFFIX:-$(date +%Y%m%d%H%M%S)}"
AZ_IMAGE_TAG="${AZ_IMAGE_TAG_BASE}-${AZ_IMAGE_TAG_SUFFIX}"
BUILD_MODE="${BUILD_MODE:-auto}" # auto | remote | local
JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-15m}"

AZ_API_CPU="${AZ_API_CPU:-0.5}"
AZ_API_MEMORY="${AZ_API_MEMORY:-1Gi}"
AZ_FRONTEND_CPU="${AZ_FRONTEND_CPU:-0.5}"
AZ_FRONTEND_MEMORY="${AZ_FRONTEND_MEMORY:-1Gi}"
AZ_BATCH_CPU="${AZ_BATCH_CPU:-0.25}"
AZ_BATCH_MEMORY="${AZ_BATCH_MEMORY:-0.5Gi}"

AZ_API_MIN_REPLICAS="${AZ_API_MIN_REPLICAS:-1}"
AZ_FRONTEND_MIN_REPLICAS="${AZ_FRONTEND_MIN_REPLICAS:-1}"
AZ_FRONTEND_MAX_REPLICAS="${AZ_FRONTEND_MAX_REPLICAS:-2}"
AZ_UPLOADS_MOUNT_PATH="${AZ_UPLOADS_MOUNT_PATH:-/app/uploads}"

if [[ -n "${REDIS_URL:-}" ]]; then
  REDIS_SOCKET_ENABLED="${REDIS_SOCKET_ENABLED:-true}"
  AZ_API_MAX_REPLICAS="${AZ_API_MAX_REPLICAS:-3}"
else
  REDIS_SOCKET_ENABLED="${REDIS_SOCKET_ENABLED:-false}"
  AZ_API_MAX_REPLICAS="${AZ_API_MAX_REPLICAS:-1}"
fi

UPLOADS_STORAGE_ENABLED="false"
if [[ -n "${AZ_UPLOADS_STORAGE_NAME:-}" || -n "${AZ_UPLOADS_ACCOUNT_NAME:-}" || -n "${AZ_UPLOADS_ACCOUNT_KEY:-}" || -n "${AZ_UPLOADS_SHARE_NAME:-}" ]]; then
  : "${AZ_UPLOADS_STORAGE_NAME:?AZ_UPLOADS_STORAGE_NAME is required when uploads storage is enabled}"
  : "${AZ_UPLOADS_ACCOUNT_NAME:?AZ_UPLOADS_ACCOUNT_NAME is required when uploads storage is enabled}"
  : "${AZ_UPLOADS_ACCOUNT_KEY:?AZ_UPLOADS_ACCOUNT_KEY is required when uploads storage is enabled}"
  : "${AZ_UPLOADS_SHARE_NAME:?AZ_UPLOADS_SHARE_NAME is required when uploads storage is enabled}"
  UPLOADS_STORAGE_ENABLED="true"
fi

if [[ -n "${AZ_SUBSCRIPTION_ID:-}" ]]; then
  az account set --subscription "$AZ_SUBSCRIPTION_ID"
fi

echo "[1/11] Creating resource group..."
az group create --name "$AZ_RESOURCE_GROUP" --location "$AZ_LOCATION" 1>/dev/null

echo "[2/11] Creating ACR (if missing)..."
if ! az acr show --name "$AZ_ACR_NAME" --resource-group "$AZ_RESOURCE_GROUP" >/dev/null 2>&1; then
  az acr create \
    --name "$AZ_ACR_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --location "$AZ_LOCATION" \
    --sku Basic \
    --admin-enabled true 1>/dev/null
fi

ACR_LOGIN_SERVER="$(az acr show --name "$AZ_ACR_NAME" --resource-group "$AZ_RESOURCE_GROUP" --query loginServer -o tsv)"
ACR_USERNAME="$(az acr credential show --name "$AZ_ACR_NAME" --query username -o tsv)"
ACR_PASSWORD="$(az acr credential show --name "$AZ_ACR_NAME" --query 'passwords[0].value' -o tsv)"

build_remote() {
  local image_name="$1"
  local context_path="$2"
  local dockerfile_name="$3"
  shift 3

  local args=(az acr build --registry "$AZ_ACR_NAME" --image "${image_name}:${AZ_IMAGE_TAG}" -f "$dockerfile_name")
  while (($#)); do
    args+=(--build-arg "$1")
    shift
  done
  args+=("$context_path")

  "${args[@]}" 1>/dev/null
}

build_local() {
  local image_name="$1"
  local context_path="$2"
  local dockerfile_name="$3"
  shift 3

  az acr login --name "$AZ_ACR_NAME" 1>/dev/null

  local -a build_args=()
  while (($#)); do
    build_args+=(--build-arg "$1")
    shift
  done

  local -a docker_cmd=()
  if docker buildx version >/dev/null 2>&1; then
    docker_cmd=(
      docker buildx build
      --platform linux/amd64
      -f "${context_path}/${dockerfile_name}"
      -t "${ACR_LOGIN_SERVER}/${image_name}:${AZ_IMAGE_TAG}"
    )
    if ((${#build_args[@]})); then
      docker_cmd+=("${build_args[@]}")
    fi
    docker_cmd+=(
      --push
      "$context_path"
    )
    "${docker_cmd[@]}"
  else
    docker_cmd=(
      docker build
      --platform linux/amd64
      -f "${context_path}/${dockerfile_name}"
      -t "${ACR_LOGIN_SERVER}/${image_name}:${AZ_IMAGE_TAG}"
    )
    if ((${#build_args[@]})); then
      docker_cmd+=("${build_args[@]}")
    fi
    docker_cmd+=(
      "$context_path"
    )
    "${docker_cmd[@]}"
    docker push "${ACR_LOGIN_SERVER}/${image_name}:${AZ_IMAGE_TAG}"
  fi
}

build_and_push_image() {
  local image_name="$1"
  local context_path="$2"
  local dockerfile_name="$3"
  shift 3

  if [[ "$BUILD_MODE" == "remote" || "$BUILD_MODE" == "auto" ]]; then
    if build_remote "$image_name" "$context_path" "$dockerfile_name" "$@"; then
      echo "Built remotely in ACR: ${image_name}:${AZ_IMAGE_TAG}"
      return 0
    fi

    if [[ "$BUILD_MODE" == "remote" ]]; then
      echo "Remote ACR build failed and BUILD_MODE=remote; aborting."
      exit 1
    fi

    echo "Remote ACR build failed. Falling back to local Docker build/push..."
  fi

  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required for local build fallback but not found."
    exit 1
  fi

  build_local "$image_name" "$context_path" "$dockerfile_name" "$@"
}

ensure_multiple_revision_mode() {
  local app_name="$1"
  az containerapp revision set-mode \
    --name "$app_name" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --mode multiple 1>/dev/null
}

configure_uploads_storage() {
  if [[ "$UPLOADS_STORAGE_ENABLED" != "true" ]]; then
    return 0
  fi

  az containerapp env storage set \
    --name "$AZ_ENV_NAME" \
    --resource-group "$ENV_RESOURCE_GROUP" \
    --storage-name "$AZ_UPLOADS_STORAGE_NAME" \
    --access-mode ReadWrite \
    --azure-file-account-name "$AZ_UPLOADS_ACCOUNT_NAME" \
    --azure-file-account-key "$AZ_UPLOADS_ACCOUNT_KEY" \
    --azure-file-share-name "$AZ_UPLOADS_SHARE_NAME" 1>/dev/null
}

attach_uploads_volume_to_api() {
  if [[ "$UPLOADS_STORAGE_ENABLED" != "true" ]]; then
    return 0
  fi

  local tmp_yaml
  tmp_yaml="$(mktemp)"

  az containerapp show \
    --name "$AZ_API_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    -o json > "$tmp_yaml"

  python3 - "$tmp_yaml" "$AZ_UPLOADS_STORAGE_NAME" "$AZ_UPLOADS_MOUNT_PATH" <<'PY'
import json
import sys

path = sys.argv[1]
storage_name = sys.argv[2]
mount_path = sys.argv[3]

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

template = data.setdefault('properties', {}).setdefault('template', {})
template['volumes'] = [
    {
        'name': 'uploads-volume',
        'storageType': 'AzureFile',
        'storageName': storage_name,
    }
]

containers = template.get('containers', [])
if containers:
    containers[0]['volumeMounts'] = [
        {
            'volumeName': 'uploads-volume',
            'mountPath': mount_path,
        }
    ]

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f)
PY

  az containerapp update \
    --name "$AZ_API_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --yaml "$tmp_yaml" 1>/dev/null

  rm -f "$tmp_yaml"
}

secret_set_if_exists() {
  local app_name="$1"
  shift
  if (($#)); then
    az containerapp secret set \
      --name "$app_name" \
      --resource-group "$AZ_RESOURCE_GROUP" \
      --secrets "$@" 1>/dev/null
  fi
}

echo "[3/11] Creating Log Analytics workspace (if missing)..."
LAW_NAME="${AZ_ENV_NAME}-logs"
if [[ -z "$ENV_RESOURCE_GROUP" ]]; then
  ENV_RESOURCE_GROUP="$(az containerapp env list --query "[?name=='${AZ_ENV_NAME}'].resourceGroup | [0]" -o tsv)"
fi

if [[ -z "$ENV_RESOURCE_GROUP" || "$ENV_RESOURCE_GROUP" == "null" ]]; then
  ENV_RESOURCE_GROUP="$AZ_RESOURCE_GROUP"
fi

if ! az monitor log-analytics workspace show --resource-group "$ENV_RESOURCE_GROUP" --workspace-name "$LAW_NAME" >/dev/null 2>&1; then
  az monitor log-analytics workspace create \
    --resource-group "$ENV_RESOURCE_GROUP" \
    --workspace-name "$LAW_NAME" \
    --location "$AZ_LOCATION" 1>/dev/null
fi
LAW_ID="$(az monitor log-analytics workspace show --resource-group "$ENV_RESOURCE_GROUP" --workspace-name "$LAW_NAME" --query customerId -o tsv)"
LAW_KEY="$(az monitor log-analytics workspace get-shared-keys --resource-group "$ENV_RESOURCE_GROUP" --workspace-name "$LAW_NAME" --query primarySharedKey -o tsv)"

echo "[4/11] Creating Container Apps environment (if missing)..."
if ! az containerapp env show --name "$AZ_ENV_NAME" --resource-group "$ENV_RESOURCE_GROUP" >/dev/null 2>&1; then
  az containerapp env create \
    --name "$AZ_ENV_NAME" \
    --resource-group "$ENV_RESOURCE_GROUP" \
    --location "$AZ_LOCATION" \
    --logs-workspace-id "$LAW_ID" \
    --logs-workspace-key "$LAW_KEY" 1>/dev/null
fi

ENV_REFERENCE="$(az containerapp env show --name "$AZ_ENV_NAME" --resource-group "$ENV_RESOURCE_GROUP" --query id -o tsv)"

if [[ "$UPLOADS_STORAGE_ENABLED" == "true" ]]; then
  echo "[4.1/11] Configuring Azure Files storage for uploads..."
  configure_uploads_storage
fi

DEFAULT_DOMAIN="$(az containerapp env show --name "$AZ_ENV_NAME" --resource-group "$ENV_RESOURCE_GROUP" --query properties.defaultDomain -o tsv)"
DEFAULT_FRONTEND_URL="https://${AZ_FRONTEND_APP_NAME}.${DEFAULT_DOMAIN}"
DEFAULT_BACKEND_URL="https://${AZ_API_APP_NAME}.${DEFAULT_DOMAIN}"
FRONTEND_PUBLIC_URL="${FRONTEND_URL:-$DEFAULT_FRONTEND_URL}"
BACKEND_PUBLIC_URL="${BACKEND_URL:-$DEFAULT_BACKEND_URL}"
SOCKET_CORS_VALUE="${SOCKET_CORS_ORIGINS:-$FRONTEND_PUBLIC_URL}"
NEXT_PUBLIC_BUILD_ID="${NEXT_PUBLIC_BUILD_ID:-$AZ_IMAGE_TAG}"

echo "Using immutable image tag: ${AZ_IMAGE_TAG}"

echo "[5/11] Building API image in ACR..."
build_and_push_image "meomul-api" "${REPO_ROOT}/meomul" "Dockerfile"

echo "[6/11] Building batch image in ACR..."
build_and_push_image "meomul-batch" "${REPO_ROOT}/meomul" "Dockerfile.batch"

echo "[7/11] Deploying API container app..."
API_SECRETS=(mongo-prod="$MONGO_PROD" jwt-secret="$JWT_SECRET" cookie-secret="$COOKIE_SECRET")
if [[ -n "${REDIS_URL:-}" ]]; then
  API_SECRETS+=(redis-url="$REDIS_URL")
fi
API_ENV_VARS=(
  NODE_ENV=production
  PORT_API=3001
  MONGO_PROD=secretref:mongo-prod
  JWT_SECRET=secretref:jwt-secret
  JWT_EXPIRES_IN="$JWT_EXPIRES_IN"
  COOKIE_SECRET=secretref:cookie-secret
  FRONTEND_URL="$FRONTEND_PUBLIC_URL"
  SOCKET_CORS_ORIGINS="$SOCKET_CORS_VALUE"
  REDIS_SOCKET_ENABLED="$REDIS_SOCKET_ENABLED"
)
if [[ -n "${REDIS_URL:-}" ]]; then
  API_ENV_VARS+=(REDIS_URL=secretref:redis-url)
fi

if az containerapp show --name "$AZ_API_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" >/dev/null 2>&1; then
  ensure_multiple_revision_mode "$AZ_API_APP_NAME"
  secret_set_if_exists "$AZ_API_APP_NAME" "${API_SECRETS[@]}"
  az containerapp update \
    --name "$AZ_API_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --image "${ACR_LOGIN_SERVER}/meomul-api:${AZ_IMAGE_TAG}" \
    --set-env-vars "${API_ENV_VARS[@]}" \
    --cpu "$AZ_API_CPU" \
    --memory "$AZ_API_MEMORY" \
    --min-replicas "$AZ_API_MIN_REPLICAS" \
    --max-replicas "$AZ_API_MAX_REPLICAS" 1>/dev/null
else
  az containerapp create \
    --name "$AZ_API_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --environment "$ENV_REFERENCE" \
    --image "${ACR_LOGIN_SERVER}/meomul-api:${AZ_IMAGE_TAG}" \
    --revisions-mode multiple \
    --env-vars "${API_ENV_VARS[@]}" \
    --secrets "${API_SECRETS[@]}" \
    --cpu "$AZ_API_CPU" \
    --memory "$AZ_API_MEMORY" \
    --min-replicas "$AZ_API_MIN_REPLICAS" \
    --max-replicas "$AZ_API_MAX_REPLICAS" \
    --ingress external \
    --target-port 3001 \
    --registry-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD" 1>/dev/null
fi

if [[ "$UPLOADS_STORAGE_ENABLED" == "true" ]]; then
  attach_uploads_volume_to_api
fi

API_FQDN="$(az containerapp show --name "$AZ_API_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)"
API_DIRECT_URL="https://${API_FQDN}"
API_LATEST_REVISION="$(az containerapp revision list --name "$AZ_API_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" --query "sort_by([], &properties.createdTime)[-1].name" -o tsv)"
if [[ -n "$API_LATEST_REVISION" && "$API_LATEST_REVISION" != "null" ]]; then
  az containerapp ingress traffic set \
    --name "$AZ_API_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --revision-weight "${API_LATEST_REVISION}=100" 1>/dev/null
fi

echo "[8/11] Deploying batch container app..."
BATCH_SECRETS=(mongo-prod="$MONGO_PROD" jwt-secret="$JWT_SECRET" cookie-secret="$COOKIE_SECRET")
if [[ -n "${REDIS_URL:-}" ]]; then
  BATCH_SECRETS+=(redis-url="$REDIS_URL")
fi
BATCH_ENV_VARS=(
  NODE_ENV=production
  PORT_BATCH=3003
  MONGO_PROD=secretref:mongo-prod
  JWT_SECRET=secretref:jwt-secret
  JWT_EXPIRES_IN="$JWT_EXPIRES_IN"
  COOKIE_SECRET=secretref:cookie-secret
  FRONTEND_URL="$FRONTEND_PUBLIC_URL"
  SOCKET_CORS_ORIGINS="$SOCKET_CORS_VALUE"
  REDIS_SOCKET_ENABLED="$REDIS_SOCKET_ENABLED"
)
if [[ -n "${REDIS_URL:-}" ]]; then
  BATCH_ENV_VARS+=(REDIS_URL=secretref:redis-url)
fi

if az containerapp show --name "$AZ_BATCH_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" >/dev/null 2>&1; then
  ensure_multiple_revision_mode "$AZ_BATCH_APP_NAME"
  secret_set_if_exists "$AZ_BATCH_APP_NAME" "${BATCH_SECRETS[@]}"
  az containerapp update \
    --name "$AZ_BATCH_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --image "${ACR_LOGIN_SERVER}/meomul-batch:${AZ_IMAGE_TAG}" \
    --set-env-vars "${BATCH_ENV_VARS[@]}" \
    --cpu "$AZ_BATCH_CPU" \
    --memory "$AZ_BATCH_MEMORY" \
    --min-replicas 1 \
    --max-replicas 1 1>/dev/null
else
  az containerapp create \
    --name "$AZ_BATCH_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --environment "$ENV_REFERENCE" \
    --image "${ACR_LOGIN_SERVER}/meomul-batch:${AZ_IMAGE_TAG}" \
    --revisions-mode multiple \
    --env-vars "${BATCH_ENV_VARS[@]}" \
    --secrets "${BATCH_SECRETS[@]}" \
    --cpu "$AZ_BATCH_CPU" \
    --memory "$AZ_BATCH_MEMORY" \
    --min-replicas 1 \
    --max-replicas 1 \
    --registry-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD" 1>/dev/null
fi

echo "[9/11] Building frontend image in ACR..."
build_and_push_image \
  "meomul-frontend" \
  "${REPO_ROOT}/meomul-web" \
  "Dockerfile" \
  "NEXT_PUBLIC_GRAPHQL_URL=${BACKEND_PUBLIC_URL}/graphql" \
  "NEXT_PUBLIC_API_URL=${BACKEND_PUBLIC_URL}" \
  "NEXT_PUBLIC_CHAT_SOCKET_URL=${BACKEND_PUBLIC_URL}" \
  "NEXT_PUBLIC_SITE_URL=${FRONTEND_PUBLIC_URL}" \
  "NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}"

echo "[10/11] Deploying frontend container app..."
FRONTEND_ENV_VARS=(
  NODE_ENV=production
  NEXT_PUBLIC_GRAPHQL_URL="${BACKEND_PUBLIC_URL}/graphql"
  NEXT_PUBLIC_API_URL="$BACKEND_PUBLIC_URL"
  NEXT_PUBLIC_CHAT_SOCKET_URL="$BACKEND_PUBLIC_URL"
  NEXT_PUBLIC_SITE_URL="$FRONTEND_PUBLIC_URL"
  NEXT_PUBLIC_BUILD_ID="$NEXT_PUBLIC_BUILD_ID"
)
if az containerapp show --name "$AZ_FRONTEND_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" >/dev/null 2>&1; then
  ensure_multiple_revision_mode "$AZ_FRONTEND_APP_NAME"
  az containerapp update \
    --name "$AZ_FRONTEND_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --image "${ACR_LOGIN_SERVER}/meomul-frontend:${AZ_IMAGE_TAG}" \
    --set-env-vars "${FRONTEND_ENV_VARS[@]}" \
    --cpu "$AZ_FRONTEND_CPU" \
    --memory "$AZ_FRONTEND_MEMORY" \
    --min-replicas "$AZ_FRONTEND_MIN_REPLICAS" \
    --max-replicas "$AZ_FRONTEND_MAX_REPLICAS" 1>/dev/null
else
  az containerapp create \
    --name "$AZ_FRONTEND_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --environment "$ENV_REFERENCE" \
    --image "${ACR_LOGIN_SERVER}/meomul-frontend:${AZ_IMAGE_TAG}" \
    --revisions-mode multiple \
    --env-vars "${FRONTEND_ENV_VARS[@]}" \
    --cpu "$AZ_FRONTEND_CPU" \
    --memory "$AZ_FRONTEND_MEMORY" \
    --min-replicas "$AZ_FRONTEND_MIN_REPLICAS" \
    --max-replicas "$AZ_FRONTEND_MAX_REPLICAS" \
    --ingress external \
    --target-port 3000 \
    --registry-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USERNAME" \
    --registry-password "$ACR_PASSWORD" 1>/dev/null
fi

FRONTEND_FQDN="$(az containerapp show --name "$AZ_FRONTEND_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)"
FRONTEND_DIRECT_URL="https://${FRONTEND_FQDN}"
FRONTEND_LATEST_REVISION="$(az containerapp revision list --name "$AZ_FRONTEND_APP_NAME" --resource-group "$AZ_RESOURCE_GROUP" --query "sort_by([], &properties.createdTime)[-1].name" -o tsv)"
if [[ -n "$FRONTEND_LATEST_REVISION" && "$FRONTEND_LATEST_REVISION" != "null" ]]; then
  az containerapp ingress traffic set \
    --name "$AZ_FRONTEND_APP_NAME" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --revision-weight "${FRONTEND_LATEST_REVISION}=100" 1>/dev/null
fi

echo "[11/11] Deployment complete"
cat <<OUT

Frontend URL:      ${FRONTEND_PUBLIC_URL}
Frontend direct:   ${FRONTEND_DIRECT_URL:-$DEFAULT_FRONTEND_URL}
Backend URL:       ${BACKEND_PUBLIC_URL}
Backend direct:    ${API_DIRECT_URL:-$DEFAULT_BACKEND_URL}
Health URL:        ${BACKEND_PUBLIC_URL}/health
GraphQL URL:       ${BACKEND_PUBLIC_URL}/graphql
Batch App:    ${AZ_BATCH_APP_NAME}
Image Tag:    ${AZ_IMAGE_TAG}

OUT
