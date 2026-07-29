#!/usr/bin/env bash
#
# Copy locally-held uploaded media to the VM.
#
# This is a real deploy step, not a convenience. 26 member records reference
# `uploads/...` paths, and those files exist only on the developer machine — the database
# rows survive a deploy, the images do not. Without this they 404 in production and it
# looks like data loss.
#
# The media is deliberately not in git: the repository is public, and member avatars and
# chat attachments are other people's personal data.
#
# Usage:
#   ./scripts/gcp/sync-uploads.sh
#
set -euo pipefail

VM_NAME="${VM_NAME:-mtechlab-vm}"
PROJECT="${PROJECT:-mtechlab-production}"
ZONE="${ZONE:-asia-northeast3-a}"
APP_DIR="${APP_DIR:-/opt/meomul}"
SOURCE="${SOURCE:-meomul/uploads}"

GCLOUD_ARGS=(--project "${PROJECT}" --zone "${ZONE}")

if [[ ! -d "${SOURCE}" ]]; then
  echo "ERROR: ${SOURCE} not found. Run this from the repository root."
  exit 1
fi

file_count="$(find "${SOURCE}" -type f | wc -l | tr -d ' ')"
total_size="$(du -sh "${SOURCE}" | cut -f1)"
echo "==> Copying ${file_count} files (${total_size}) to ${VM_NAME}:${APP_DIR}/data/uploads"

# Staged through /tmp because the target is root-owned and scp runs as your user.
gcloud compute ssh "${VM_NAME}" "${GCLOUD_ARGS[@]}" --command "rm -rf /tmp/meomul-uploads && mkdir -p /tmp/meomul-uploads"
gcloud compute scp --recurse "${SOURCE}"/* "${VM_NAME}:/tmp/meomul-uploads/" "${GCLOUD_ARGS[@]}"

# uid 1000 is the `node` user the containers run as. Without this the API cannot write
# new uploads into the directory it can already read.
gcloud compute ssh "${VM_NAME}" "${GCLOUD_ARGS[@]}" --command "\
  sudo mkdir -p ${APP_DIR}/data/uploads && \
  sudo cp -r /tmp/meomul-uploads/* ${APP_DIR}/data/uploads/ && \
  sudo chown -R 1000:1000 ${APP_DIR}/data/uploads && \
  rm -rf /tmp/meomul-uploads && \
  echo '    files now on the VM:' \$(sudo find ${APP_DIR}/data/uploads -type f | wc -l)"

echo "==> Done."
echo "    Verify after deploying:  curl -I https://\${APP_DOMAIN}/uploads/default-avatar.png"
