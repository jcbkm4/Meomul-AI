# Production readiness — status

Snapshot of the production-readiness pass. Written to the repo so it survives the
session it came from.

## Where this landed

Everything that did not require a decision or an external console is done. What remains
is listed under [Still open](#still-open).

**Corrections to the original assessment.** Two of the findings I opened with turned out
to be wrong once checked against the real database and code, and are recorded here so the
history is not misleading:

- *"Production MongoDB indexes will never be created; every query is a collection scan."*
  False for this deployment. All 21 models were fully indexed, because `MONGO_DEV` and
  `MONGO_PROD` point at the same database and development mode creates indexes
  automatically. The index tooling is still required — it is what keeps indexes correct
  once `NODE_ENV=production` disables `autoIndex` — but the alarm was not accurate.
- *"Safari will block the auth cookie, breaking chat."* False. `getCookieDomain()` already
  derives `meomul.com` from `FRONTEND_URL`, and `api.meomul.com` shares that registrable
  domain, so the cookie is first-party and ITP does not apply. The real improvement was
  narrower: `SameSite` was unconditionally `none`, and is now `lax` whenever a cookie
  domain is derivable.

## Done

### Security
- **Password reset required only a nickname and a phone number** — both non-secret and
  enumerable, so any account was takeable over. Replaced with a two-step SMS one-time
  code: hashed storage, single use, 15-minute expiry checked at read time, 5-attempt cap,
  constant-time comparison, enumeration-safe responses, and full session revocation on
  success. 13 tests.
- **Upload authorization ran after the file was written.** Moved into multer's
  `fileFilter`, which runs before the storage engine, so an unauthorized upload never
  reaches disk.
- **Socket CORS accepted `localhost` in production.** All three gateways now share one
  policy that mirrors the HTTP CORS config.
- **Two criticals and a long tail of dependency advisories patched**, including a
  Next.js Middleware bypass affecting Pages Router with i18n and SSRF in rewrites — both
  of which this app is directly exposed to.
- Auth cookie `SameSite` narrowed from `none` to `lax` where a cookie domain exists.
- Containers no longer run as root; secrets are out of the repo and `.gitignore`d.

### Correctness
- **Two `unique` indexes had never existed in any environment.** MongoDB silently rejects
  `$ne` inside `partialFilterExpression`, so `Hotel(title, location, address)` and
  `Room(hotelId, roomNumber)` were unenforced — duplicate room numbers within a hotel were
  possible. Rewritten with `$in`/`$type` and verified to reject duplicates with E11000.
- **`docker-compose.yml` set `NODE_ENV=production` for local development**, which made
  `docker compose up` connect to the production Atlas cluster and ignore `MONGO_DEV`.
- **Index dry-run under-reported** what `--prune` would do, because it compared index keys
  and ignored options. Now folds in `unique`, `expireAfterSeconds`,
  `partialFilterExpression` and `sparse`.
- Four stale indexes pruned; three TTL indexes whose options had drifted were corrected.

### Operability
- MongoDB index management, run by the batch worker at boot (`RUN_INDEX_SYNC`), plus a
  CLI with `--dry-run` and `--prune`.
- Sentry across API, batch worker, and web, with PII stripped and replay disabled.
- Structured JSON logging with `x-request-id` correlation, health checks excluded, and
  credentials redacted before serialisation.
- Containers: non-root, `HEALTHCHECK`, `init: true`, and `depends_on` gated on
  `service_healthy` so Caddy does not route to an API that has not reached Mongo.
- Google Cloud deploy path (`scripts/gcp/`) — VM creation, bootstrap, and a deploy script
  that refuses to start on a missing variable and waits for containers to report healthy.

### Quality
- Tests: **13 → 91** on the API, covering refund maths across every policy boundary, the
  booking status machine, refresh-token handling, the cron lock, and password reset.
  Jest's `roots` excluded the entire batch app; fixed.
- CI had never passed. `npm run lint` ran with `--fix` (rewriting 26 files as a side
  effect of a "check"), 9 lint errors, 5 failing web tests that were never run, and a web
  build step that could not have succeeded. All fixed; `typecheck` added to both jobs.
- Web: SSR `lang` was hardcoded `en` for all four locales; `robots.txt` pointed staging at
  production's sitemap; no `hreflang` alternates existed; runtime image reduced from
  ~800MB to ~110MB via `output: standalone`.

## Still open

| Item | Why it is not done |
|---|---|
| **Rotate Atlas password and SOLAPI secret** | Both were pasted into a chat transcript and must be considered disclosed. `scripts/rotate-secrets.sh` handles the app secrets; these two live in consoles only you can reach. The SOLAPI secret can only be invalidated by regenerating it. |
| **FLEXIBLE same-day 50% refund tier** | `Math.ceil` on days-until-check-in means any future check-in rounds to at least 1, so the documented "same day = 50%" never applies and guests are refunded in full an hour before check-in. Changing it moves money; that is a product decision, not a bug fix. Current behaviour is pinned by a test either way. |
| **Split the i18n catalog per locale** | Measured at 144.8 KB raw / 35.7 KB gzipped, with ~19 KB gzipped wasted per user. The provider needs messages synchronously for SSR and 34 of 40 pages are client-rendered, so a dynamic import means non-English users see an English flash. Recommendation: not worth it at this stage. |
| **Uploads on the boot disk** | Works on a single VM, which is the current target, but caps the API at one instance. Moving to Cloud Storage is the prerequisite for scaling out. |
| **Dev and production share one database** | `MONGO_DEV` and `MONGO_PROD` both point at `Meomul`. Every local run reads and writes live customer data. Left as-is at your direction; note that with `NODE_ENV=production` locally, `autoIndex` is off, so schema index changes now need `npm run indexes:sync`. |
| **Remaining `npm audit` highs** | Dev tooling only, or the sole offered "fix" is a major downgrade (`@nestjs/apollo` 13→10). Audit is `continue-on-error` in CI rather than permanently red. |

## Known deferred debt

God-files (`pages/bookings/manage.tsx` 2,182 lines; `recommendation.service.ts` 1,573),
hand-rolled imperative form validation surfaced through modal alerts rather than inline
field errors, no per-route error boundaries, `noImplicitAny: false` in the backend
tsconfig, and no metrics or tracing (error tracking is wired; nothing measures throughput
or latency).
