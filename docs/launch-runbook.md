# Launch runbook

Deploying Meomul onto `mtechlab-vm`, alongside the existing MTechLab stack.

**This host is already serving production traffic.** `mtechlab.co.kr` runs there, and its
Caddy owns ports 80 and 443. Meomul therefore runs without its own proxy and is routed by
that same Caddy. Exactly one step touches the existing stack — appending site blocks to
its Caddyfile in step 4 — and it is reversible.

| | |
|---|---|
| Host | `mtechlab-vm`, project `mtechlab-production`, zone `asia-northeast3-a` |
| IP | `34.50.43.73` (reserved static, `mtechlab-ip`) |
| Meomul lives in | `/opt/meomul` (the MTechLab stack is in `/opt/mtechlab` and is not moved) |
| Compose file | `docker-compose.shared-edge.yml` — no Caddy, no published ports |
| Domains | `meomul.dev`, `api.meomul.dev` |

---

> **Status: this setup is complete and the site is live.** Steps 1–7 are kept as the
> record of how production was built and what to repeat if it is ever rebuilt. For
> day-to-day work go straight to [Redeploying](#redeploying) — deploys are automatic now.

## 0. Prerequisites

- [x] Atlas password rotated, connection verified against the `Meomul` database
- [x] SOLAPI secret regenerated; sender `01059570418` approved
- [x] `.env.production` complete — no `REPLACE_` placeholders
- [x] Repo pushed, CI green
- [x] DNS serving `34.50.43.73` directly, no proxy in front
- [x] Atlas Network Access includes `34.50.43.73`

---

## 1. DNS — point straight at the VM

DNS is served by **name.com** (nameservers `ns1hwy`/`ns2dqr`/`ns3gmv`/`ns4kmw.name.com`),
with three A records:

```
@      A    34.50.43.73
api    A    34.50.43.73
www    A    34.50.43.73
```

Cloudflare was tried first and removed. With its proxy enabled the site returned HTTP 521
and, more importantly, Cloudflare intercepts the HTTP-01 challenge Caddy uses, so
certificate issuance fails. Nothing here needs a CDN in front, and going direct matches
how `mtechlab.co.kr` already works on this host.

The `www` record matters: the Caddyfile defines a `www.meomul.dev` redirect, and Caddy
requests a certificate for every configured hostname at startup — a name that does not
resolve produces repeated failures and burns Let's Encrypt rate limit.

Confirm both resolve to the VM, not to an intermediary:

```bash
dig +short meomul.dev api.meomul.dev      # expect 34.50.43.73 for both
```

> `.dev` is on the HSTS preload list, so browsers force HTTPS with no HTTP fallback. If
> the certificate fails, the site is unreachable rather than degraded — which is why DNS
> has to be right before deploying.

---

## 2. Atlas network access

Atlas → Network Access → Add IP Address → `34.50.43.73`.

Skipping this gives the most misleading failure available: the API starts, reports
healthy, then times out on every query with a server-selection error that reads like a
code fault.

---

## 3. Get the code and config onto the VM

```bash
# From your workstation
gcloud compute ssh mtechlab-vm --project mtechlab-production --zone asia-northeast3-a
```

```bash
# On the VM
sudo git clone https://github.com/jcbkm4/Meomul-AI.git /opt/meomul
sudo mkdir -p /opt/meomul/data/uploads
sudo chown -R 1000:1000 /opt/meomul/data/uploads    # uid 1000 = the `node` user in the containers
```

Then copy the environment file up:

```bash
# From your workstation, at the repo root
gcloud compute scp .env.production mtechlab-vm:/tmp/.env.production \
  --project mtechlab-production --zone asia-northeast3-a
gcloud compute ssh mtechlab-vm --project mtechlab-production --zone asia-northeast3-a \
  --command "sudo mv /tmp/.env.production /opt/meomul/.env.production && sudo chmod 600 /opt/meomul/.env.production"
```

---

## 4. Add the Meomul site blocks to the existing Caddy

The only change to the MTechLab stack. Back up first.

```bash
# On the VM
sudo cp /opt/mtechlab/Caddyfile /opt/mtechlab/Caddyfile.bak.$(date +%Y%m%d%H%M)
sudo sh -c 'cat /opt/meomul/deploy/Caddyfile.meomul-snippet >> /opt/mtechlab/Caddyfile'

# Validate BEFORE applying — this does not touch the running server
sudo docker exec mtechlab-caddy-1 caddy validate --config /etc/caddy/Caddyfile
```

Only if validation passes:

```bash
sudo docker exec mtechlab-caddy-1 caddy reload --config /etc/caddy/Caddyfile
curl -sI https://mtechlab.co.kr | head -1      # confirm the existing site still serves 200
```

`caddy reload` swaps configuration without dropping connections, and refuses to apply a
config that fails validation. To undo: restore the `.bak` file and reload again.

---

## 5. Copy the uploaded media

```bash
# From your workstation, at the repo root
./scripts/gcp/sync-uploads.sh
```

64 MB across 35 files. **Required:** 26 member records reference `uploads/...` paths whose
files exist only on your machine. The database rows survive a deploy; the files do not.

The media is deliberately not in git — the repository is public, and member avatars and
chat attachments are other people's personal data.

---

## 6. Deploy

```bash
# On the VM
cd /opt/meomul
sudo COMPOSE_FILE=docker-compose.shared-edge.yml APP_DIR=/opt/meomul \
  bash scripts/gcp/deploy-vm.sh
```

The script refuses to start on a missing variable or a leftover `REPLACE_` placeholder,
builds both images, and waits for containers to report healthy — a broken rollout fails
the command and prints the failing service's logs.

First run takes several minutes. Expect memory pressure: `next build` competes with the
MTechLab API on a shared 8 GB host. Watch with `free -h` in another shell if concerned.

---

## 7. Verify

```bash
cd /opt/meomul
COMPOSE="docker compose -f docker-compose.shared-edge.yml --env-file .env.production"

sudo $COMPOSE ps                                    # healthy, not merely running
sudo $COMPOSE logs meomul-batch | grep -i "index sync"
sudo docker exec $(sudo $COMPOSE ps -q meomul-api) whoami   # node, not root
```

```bash
curl -sS  https://api.meomul.dev/health                       # {"status":"ok","db":"connected",...}
curl -sI  https://meomul.dev | head -1                        # 200 with a valid certificate
curl -sI  https://meomul.dev/uploads/default-avatar.png | head -1
curl -s   https://meomul.dev/robots.txt | tail -1             # Sitemap → meomul.dev
curl -s   https://meomul.dev/ko | grep -o '<html lang="ko"'
curl -sI  https://mtechlab.co.kr | head -1                    # the other site is unaffected
```

In a browser:

- [ ] Sign up, sign out, sign in — session survives a refresh
- [ ] **Password reset end to end** — SMS actually arrives. The only path that cannot be
      checked from the command line, and the first real exercise of the SOLAPI credentials.
- [ ] Chat connects and stays connected
- [ ] Image upload works
- [ ] A booking completes

---

## 8. After launch

- **Atlas backups** — confirm enabled, and do a restore drill. Nothing else protects this data.
- **Uptime monitor** on `https://api.meomul.dev/health`.
- **Sentry** — set `SENTRY_DSN_API`, `SENTRY_DSN_WEB`, `NEXT_PUBLIC_SENTRY_DSN`, redeploy.
  The browser DSN is inlined at build time, so it needs a rebuild, not a restart.
- **Restrict the SOLAPI key by IP** to `34.50.43.73`.
- Consider re-enabling the Cloudflare proxy later with SSL mode **Full (strict)** once
  Caddy holds a valid certificate.

---

## Redeploying

**Deploys are automatic.** Pushing to `main` runs CI, and if both test jobs pass, the
deploy job builds images, pushes them to Artifact Registry, and updates the VM. No manual
step, and nothing reaches production on a red build.

Watch a deploy:

```bash
gh run watch          # or: gh run list --limit 3
```

The workflow bumps `NEXT_PUBLIC_BUILD_ID` to the commit SHA on the VM, so the Apollo
cache key changes on every deploy without anyone remembering to do it.

**Rolling back** to any previously built commit — images are retained by tag, so this is
a pull rather than a rebuild:

```bash
# On the VM
cd /opt/meomul
TAG=<12-char commit sha>
sudo env MEOMUL_IMAGE_PREFIX=asia-northeast3-docker.pkg.dev/mtechlab-production/meomul \
         MEOMUL_IMAGE_TAG=$TAG \
  docker compose -f docker-compose.shared-edge.yml --env-file .env.production up -d --no-build
```

**Manual deploy** (if CI is unavailable) still works — it builds on the VM:

```bash
cd /opt/meomul && sudo git pull
sudo COMPOSE_FILE=docker-compose.shared-edge.yml APP_DIR=/opt/meomul bash scripts/gcp/deploy-vm.sh
```

Note this builds on the production host and competes for memory with the MTechLab stack,
which is the situation CD exists to avoid. Prefer pushing to `main`.

---

## If something goes wrong

| Symptom | Cause |
|---|---|
| HTTP 521 from Cloudflare | Proxy still enabled (step 1), or the stack is not running. |
| No certificate / TLS errors | DNS not yet pointing at the VM, or Cloudflare still proxying. |
| API healthy, then every query times out | `34.50.43.73` missing from Atlas Network Access. |
| API exits at boot | Missing variable, or `SMS_PROVIDER=log` in production — deliberate; it would print reset codes to stdout. |
| Broken avatars | Step 5 skipped. |
| `mtechlab.co.kr` breaks after step 4 | Restore `/opt/mtechlab/Caddyfile.bak.*` and `caddy reload`. |
| Build killed, exit 137 | Out of memory — another build or the MTechLab API is competing. Retry when quiet. |
| Users logged out | Expected: `JWT_SECRET` was rotated. Refresh tokens recover on next silent refresh. |

**Rolling back Meomul entirely**, leaving MTechLab untouched:

```bash
cd /opt/meomul && sudo docker compose -f docker-compose.shared-edge.yml down
sudo cp /opt/mtechlab/Caddyfile.bak.<timestamp> /opt/mtechlab/Caddyfile
sudo docker exec mtechlab-caddy-1 caddy reload --config /etc/caddy/Caddyfile
```
