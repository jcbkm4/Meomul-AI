#!/usr/bin/env bash
#
# Create the Compute Engine VM that runs the Meomul stack, plus the firewall rules and
# a static IP for DNS.
#
# Run this from your workstation with gcloud authenticated — not on the VM.
# Idempotent: re-running skips anything that already exists.
#
# Usage:
#   PROJECT_ID=my-project ./scripts/gcp/create-vm.sh
#
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?PROJECT_ID is required}"
# asia-northeast3 is Seoul — keep the VM next to the users and the Atlas region.
ZONE="${ZONE:-asia-northeast3-a}"
REGION="${REGION:-asia-northeast3}"
VM_NAME="${VM_NAME:-meomul-prod}"
# e2-medium (2 vCPU / 4 GB) fits five containers plus builds. e2-small runs out of
# memory during `next build`.
MACHINE_TYPE="${MACHINE_TYPE:-e2-medium}"
DISK_SIZE="${DISK_SIZE:-50GB}"
IP_NAME="${IP_NAME:-meomul-ip}"

echo "==> Project ${PROJECT_ID}, zone ${ZONE}"
gcloud config set project "${PROJECT_ID}" >/dev/null

echo "==> Enabling required APIs"
gcloud services enable compute.googleapis.com --quiet

echo "==> Reserving static IP ${IP_NAME}"
if ! gcloud compute addresses describe "${IP_NAME}" --region "${REGION}" >/dev/null 2>&1; then
  gcloud compute addresses create "${IP_NAME}" --region "${REGION}"
else
  echo "    already exists"
fi
STATIC_IP="$(gcloud compute addresses describe "${IP_NAME}" --region "${REGION}" --format='value(address)')"

echo "==> Firewall rules"
# Caddy terminates TLS on the VM, so only 80/443 are exposed. Mongo is on Atlas and
# Redis stays on the Docker network — neither is reachable from outside.
if ! gcloud compute firewall-rules describe meomul-allow-http >/dev/null 2>&1; then
  gcloud compute firewall-rules create meomul-allow-http \
    --allow tcp:80,tcp:443 \
    --target-tags meomul \
    --description "Public HTTP/HTTPS for the Meomul Caddy front door"
else
  echo "    meomul-allow-http already exists"
fi

echo "==> Creating VM ${VM_NAME}"
if ! gcloud compute instances describe "${VM_NAME}" --zone "${ZONE}" >/dev/null 2>&1; then
  gcloud compute instances create "${VM_NAME}" \
    --zone "${ZONE}" \
    --machine-type "${MACHINE_TYPE}" \
    --image-family ubuntu-2404-lts-amd64 \
    --image-project ubuntu-os-cloud \
    --boot-disk-size "${DISK_SIZE}" \
    --boot-disk-type pd-balanced \
    --address "${STATIC_IP}" \
    --tags meomul \
    --metadata enable-oslogin=TRUE
else
  echo "    already exists"
fi

cat <<EOF

==> Done.

Static IP: ${STATIC_IP}

Next:
  1. Point DNS at that address:
       APP_DOMAIN  A  ${STATIC_IP}
       API_DOMAIN  A  ${STATIC_IP}
     Caddy cannot issue certificates until DNS resolves, so do this first.

  2. Allow the Atlas cluster to accept connections from ${STATIC_IP}
     (Atlas > Network Access > Add IP Address).

  3. Bootstrap the VM:
       gcloud compute ssh ${VM_NAME} --zone ${ZONE}
       sudo bash /path/to/bootstrap-vm.sh

  4. Copy the repo and .env.production to /srv/meomul, then run deploy-vm.sh.
     See scripts/gcp/README.md.
EOF
