# Meomul

Korean hotel-booking platform. Verified guest photos, transparent pricing, real-time
host/guest chat, and intent-based search.

**Status:** MVP Phase 1 — pre-launch. See [`docs/`](docs/) for the product brief and ER model.
v1 ships as a **reservation platform with pay-at-property settlement**; no payment
gateway is integrated.

## Layout

| Path | What it is |
|---|---|
| `meomul/` | Backend — NestJS 11 monorepo with two apps: `meomul-api` (GraphQL + REST upload + Socket.IO) and `meomul-batch` (cron worker) |
| `meomul-web/` | Frontend — Next.js 15 / React 19, Pages Router, 4 locales (en/ko/ru/uz) |
| `deploy/` | Caddy reverse-proxy config |
| `scripts/` | Deploy scripts (`digitalocean/`, `azure/`) and Python ERD generators |
| `docs/` | ER model, coverage notes, product/strategy brief |

**Stack:** NestJS · GraphQL (code-first, Apollo) · MongoDB Atlas + Mongoose · Redis ·
Socket.IO · JWT with httpOnly cookies · Next.js · Tailwind v4 · Apollo Client · Docker + Caddy

## Local development

Requires Node 20 and Docker.

```bash
# Infra only (Mongo + Redis)
docker compose up -d mongo redis

# Backend — copy meomul/.env.example to meomul/.env and fill it first
cd meomul && npm ci && npm run start:dev      # API on :3001
cd meomul && npm run start:batch              # cron worker (separate terminal)

# Frontend — copy meomul-web/.env.example to meomul-web/.env.local first
cd meomul-web && npm ci && npm run dev        # web on :3000
```

The whole stack in containers: `docker compose up --build`.

`npm` is the package manager for both apps — do not introduce a yarn lockfile.

## Testing and checks

```bash
cd meomul     && npm run lint && npm test && npm run build
cd meomul-web && npm run lint && npm test && npm run build
```

GraphQL types for the frontend are generated from the backend schema:
`cd meomul-web && npm run codegen:backend-types` (reads
`../meomul/apps/meomul-api/src/schema.gql`). It runs automatically via `prebuild`, but
**not** inside Docker — the generated `types/backend-dtos.generated.ts` is committed, so
regenerate and commit it whenever the API schema changes.

CI (`.github/workflows/ci.yml`) runs lint → test → build → `npm audit` on push to
`main`/`develop` and on PRs to `main`.

## Environment

Never commit a real `.env`. Templates:

- `meomul/.env.example`, `meomul/.env.production.example` — API + batch
- `meomul-web/.env.example`, `meomul-web/.env.production.example` — web
- `.env.production.example` — the combined file the production Compose stack reads

Both apps validate their environment at boot and **exit** if a required variable is
missing in production (`meomul/apps/meomul-api/src/config/env.validation.ts`,
`meomul-web/lib/config/env.ts`). `JWT_SECRET` and `COOKIE_SECRET` must be at least 32
characters.

Note that `NEXT_PUBLIC_*` variables are inlined into the frontend bundle at **build**
time, so they are passed as Docker build args — changing them requires a rebuild, not
just a restart.

## Database indexes

Production runs with `autoIndex: false`, so Mongoose does not build indexes on boot.
The batch worker owns this instead — it reconciles all 20 models (~102 indexes) at
startup when `RUN_INDEX_SYNC=true`, which is the default in the production Compose file.
It is idempotent and additive; it never drops an index.

To inspect or run it by hand:

```bash
cd meomul
npm run indexes:sync -- --dry-run   # report drift, change nothing
npm run indexes:sync                # create missing indexes
npm run indexes:sync -- --prune     # also drop indexes no longer in any schema
```

`--prune` is deliberately opt-in: dropping an index a still-running container depends on
degrades queries mid-deploy. Run it after a rollout settles, not during one.

## Deployment

Production runs as a Docker Compose stack behind Caddy (automatic TLS):
`caddy → frontend:3000 + api:3001`, plus `batch` and `redis`. MongoDB is hosted on Atlas.

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

`scripts/digitalocean/` and `scripts/azure/` hold deploy scripts for those providers.
**The current target is Google Cloud and that path is not yet built** — see the
production-readiness plan before deploying.

## Known pre-launch gaps

Do not treat `main` as production-ready yet. The tracked blockers:

- `resetPassword` verifies only nickname + phone — no token, no OTP
- No error tracking or metrics in either app
- Test coverage is ~2.6%; `booking.service.ts` is untested
- Socket auth relies on a `SameSite=None` cross-origin cookie, which Safari blocks
