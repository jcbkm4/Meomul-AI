# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build meomul-api

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Uploads land here via a bind mount. Create it owned by `node` so the unprivileged
# process can write to it; the host-side directory needs the same owner (uid 1000) —
# see the deployment notes in README.md.
RUN mkdir -p /app/uploads && chown -R node:node /app

# Drop root. Otherwise a process compromise starts with full write access to the
# container filesystem.
USER node

EXPOSE 3001

# /health already performs a real Mongo readyState check, so this reflects genuine
# readiness rather than just "the process is alive". wget ships with busybox on alpine.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health >/dev/null 2>&1 || exit 1

CMD ["node", "dist/apps/meomul-api/main"]
