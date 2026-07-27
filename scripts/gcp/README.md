# Google Cloud deployment (Compute Engine VM)

The production stack runs as Docker Compose on a single Compute Engine VM, behind Caddy
for automatic TLS. MongoDB stays on Atlas; Redis runs in a container alongside the apps.

This mirrors the local Compose setup exactly, so what you run locally is what ships.
Cloud Run was considered and rejected for now: its containers are stateless, so the
uploads bind mount would have to move to Cloud Storage first.

## One-time setup

**1. Create the VM, static IP, and firewall rules** — from your workstation:

```bash
PROJECT_ID=your-project ./scripts/gcp/create-vm.sh
```

Defaults to `e2-medium` in `asia-northeast3` (Seoul). The script prints the static IP.

**2. Point DNS at the static IP** before going further — Caddy cannot issue certificates
until the domains resolve:

```
APP_DOMAIN   A   <static ip>     # meomul.com
API_DOMAIN   A   <static ip>     # api.meomul.com
```

**3. Allowlist the VM in Atlas** — Network Access → Add IP Address → the static IP.
Without this the API starts and then fails every query with a server-selection timeout.

**4. Bootstrap the VM:**

```bash
gcloud compute ssh meomul-prod --zone asia-northeast3-a
sudo bash /srv/meomul/scripts/gcp/bootstrap-vm.sh
```

Installs Docker, creates `/srv/meomul/data/uploads` owned by uid 1000 (the containers run
as non-root), adds 2 GB of swap so `next build` doesn't get OOM-killed on a 4 GB machine,
and schedules a weekly image prune.

**5. Get the code and config onto the VM:**

```bash
# On the VM
sudo git clone <your-repo-url> /srv/meomul
cd /srv/meomul
sudo cp .env.production.example .env.production
sudo nano .env.production        # fill in every value
```

Generate the secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))"   # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"   # COOKIE_SECRET
```

## Deploying

```bash
sudo bash /srv/meomul/scripts/gcp/deploy-vm.sh
```

The script refuses to start if a required variable is missing, builds and starts
everything, then waits for every container to report healthy — so a broken rollout fails
the command instead of looking successful.

For subsequent deploys, pull first and bump the build id:

```bash
cd /srv/meomul
sudo git pull
sudo sed -i "s/^NEXT_PUBLIC_BUILD_ID=.*/NEXT_PUBLIC_BUILD_ID=deploy-$(date +%Y%m%d%H%M)/" .env.production
sudo bash scripts/gcp/deploy-vm.sh
```

`NEXT_PUBLIC_BUILD_ID` is inlined into the frontend bundle at build time and is the cache
key for the persisted Apollo cache — leaving it unchanged serves clients stale data.

## Verifying

```bash
cd /srv/meomul
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"

$COMPOSE ps                                   # every service should read "healthy"
$COMPOSE logs batch | grep -i "index sync"    # indexes built at boot
curl -sS https://api.<your-domain>/health     # {"status":"ok","db":"connected",...}
docker exec $($COMPOSE ps -q api) whoami      # node, not root
```

## Operations

| Task | Command |
|---|---|
| Tail logs | `$COMPOSE logs -f api` |
| Restart one service | `$COMPOSE restart api` |
| Check index drift | `docker exec $($COMPOSE ps -q batch) node -e "…"` or run `npm run indexes:sync -- --dry-run` locally against the prod URI |
| Back up uploads | `tar czf uploads-$(date +%F).tar.gz -C /srv/meomul/data uploads` |
| Disk usage | `df -h /` then `docker system df` |

## Known limitations

- **Single VM, no redundancy.** A VM restart is downtime. Acceptable pre-launch; revisit
  with a managed instance group or Cloud Run once traffic justifies it.
- **Uploads live on the boot disk.** They are not backed up automatically and they pin
  the API to one instance. Moving them to Cloud Storage is the prerequisite for scaling
  out — see the production-readiness plan.
- **No automated rollback.** `git checkout <previous-sha> && deploy-vm.sh` is the manual
  path; because images are rebuilt on the VM rather than pulled from a registry, this
  means a rebuild rather than an image swap.
