# Meomul — working notes for Claude

Read `README.md` first for layout, commands, and env handling. This file covers the
conventions and traps that aren't obvious from the code.

## Repo shape

Single monorepo, one git history at the root. `meomul/` (backend) and `meomul-web/`
(frontend) used to be separate nested repos; that history is archived as git bundles
outside the repo and is **not** in this one. Do not re-add nested `.git` directories.

## Backend (`meomul/`)

- NestJS monorepo, two apps declared in `nest-cli.json`: `meomul-api` and `meomul-batch`.
  Jest's `roots` is currently scoped to `apps/meomul-api/`, so **batch code is excluded
  from `npm test`** — fix this before relying on test results for cron jobs.
- **GraphQL is code-first.** `schema.gql` is generated, never hand-edited. After changing
  a resolver or DTO, regenerate it, then regenerate the frontend types too.
- Feature code lives in `apps/meomul-api/src/components/<feature>/` as
  module + service + resolver. Mongoose models are in `src/schemas/`, shared code in
  `src/libs/` (`dto/`, `types/`, `enums/`, `guards/`, `interceptor/`, `utils/`).
- **Auth is deny-by-default.** `AuthGuard`, `RolesGuard`, and `GqlThrottlerGuard` are
  registered globally as `APP_GUARD`. A new endpoint is authenticated unless you add
  `@Public()` — prefer leaving it protected.
- Access tokens are read from the `meomul_at` httpOnly cookie first, `Authorization`
  header second. Refresh tokens are 40 random bytes stored SHA-256-hashed and are
  individually revocable.
- Indentation is tabs. ESLint 9 flat config with `recommendedTypeChecked`; note that
  `noImplicitAny` is off and `no-floating-promises` is only a warning.
- Cron jobs must go through `CronLockService` (`apps/meomul-batch/src/common/`) so they
  stay single-runner across replicas.

## Frontend (`meomul-web/`)

- Next.js **Pages** Router, not App Router. Tailwind v4.
- No global state library. Apollo's `InMemoryCache` plus per-page hooks in `lib/hooks/`
  is the pattern; follow it rather than introducing Redux/Zustand.
- **The access token is not readable from JS** — it's an httpOnly cookie. Never try to
  attach an `Authorization` header from the client; rely on `credentials: "include"`.
- In the browser, GraphQL goes to a same-origin `/graphql` that `next.config.mjs`
  rewrites to the API. This is deliberate — it keeps the auth cookie first-party. Do not
  point the browser client directly at the API origin.
- `next.config.mjs` is the live config (a duplicate `.ts` was removed; don't reintroduce it).
- `types/backend-dtos.generated.ts` is generated and committed. Regenerate after any API
  schema change, otherwise the committed types silently drift from the deployed API.
- The codebase has **zero `any`, zero `@ts-ignore`, and zero `console.log`**. Keep it
  that way — it's the main quality invariant here.
- All 4 locales ship in `lib/i18n/messages.ts`. Add user-facing strings there, not inline.

## Conventions

- Branches: `feat/`, `fix/`, `refactor/`. PR review before merging to `main`.
- Never commit a real `.env`, `.next/`, `dist/`, or uploaded media.
- v1 has **no payment gateway**. `PaymentStatus`/`paidAmount`/refund logic is a state
  machine only; money settles at the property. Don't write copy or code implying
  automatic online refunds.
