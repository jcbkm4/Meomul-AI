#!/usr/bin/env bash
#
# Prepare a fresh Ubuntu 24.04 Compute Engine VM to run the Meomul stack.
# Run once, as root, on the VM itself.
#
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root (sudo bash bootstrap-vm.sh)."
  exit 1
fi

APP_DIR="${APP_DIR:-/srv/meomul}"

export DEBIAN_FRONTEND=noninteractive

echo "==> Installing prerequisites"
apt-get update
apt-get install -y ca-certificates curl gnupg git

echo "==> Installing Docker from the official repository"
install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

. /etc/os-release
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

echo "==> Preparing ${APP_DIR}"
mkdir -p "${APP_DIR}/data/uploads"
# The API container runs as the unprivileged `node` user (uid 1000). Without this the
# bind mount is root-owned and every upload fails with EACCES.
chown -R 1000:1000 "${APP_DIR}/data/uploads"

echo "==> Enabling swap"
# e2-medium has 4 GB. `next build` peaks above that and the OOM killer takes out the
# build with a confusing exit 137; swap absorbs the spike.
if [[ ! -f /swapfile ]]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
else
  echo "    swapfile already present"
fi

echo "==> Enabling weekly Docker cleanup"
# Rebuilding on every deploy accumulates dangling images and fills a 50 GB disk.
cat > /etc/cron.weekly/docker-prune <<'CRON'
#!/bin/sh
docker image prune -af --filter "until=168h" >/dev/null 2>&1
CRON
chmod +x /etc/cron.weekly/docker-prune

echo
echo "==> Bootstrap complete."
echo "    Next: place the repo and .env.production in ${APP_DIR}, then run deploy-vm.sh"
