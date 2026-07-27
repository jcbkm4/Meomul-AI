#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/meomul}"

cd "$APP_DIR"

mkdir -p data/uploads

if [[ ! -f .env.production ]]; then
  echo ".env.production is missing in $APP_DIR"
  exit 1
fi

docker compose -f docker-compose.prod.yml --env-file .env.production pull caddy redis || true
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

docker compose -f docker-compose.prod.yml --env-file .env.production ps
