FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Docker builds use the checked-in generated DTO types instead of the npm prebuild
# lifecycle because codegen.ts references the backend schema outside this build
# context. Keep backend-dtos.generated.ts committed before building the image.
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CHAT_SOCKET_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BUILD_ID
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_PUBLIC_GRAPHQL_URL=${NEXT_PUBLIC_GRAPHQL_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_CHAT_SOCKET_URL=${NEXT_PUBLIC_CHAT_SOCKET_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}

RUN npx next build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# The standalone server binds to $HOSTNAME, and Docker sets that to the container ID.
# Left alone it listens only on the container's own IP, so the proxy can reach it but
# nothing on loopback can — which silently breaks the HEALTHCHECK below.
ENV HOSTNAME=0.0.0.0

ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CHAT_SOCKET_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BUILD_ID
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_PUBLIC_GRAPHQL_URL=${NEXT_PUBLIC_GRAPHQL_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_CHAT_SOCKET_URL=${NEXT_PUBLIC_CHAT_SOCKET_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}

# `output: "standalone"` emits a server bundle containing only the modules actually
# imported, so there is no `npm ci` in this stage at all — the previous runtime carried a
# full production node_modules (~800MB) where the standalone tree is ~110MB.
#
# The three COPYs are the documented standalone layout: the server bundle, then static
# assets and public/, which Next deliberately leaves out so they can be served from a CDN.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Drop root — the server only ever reads from this filesystem.
USER node

EXPOSE 3000

# Probes the real app rather than the port: a Next server that boots but cannot render
# still answers TCP. wget ships with busybox on alpine.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

# The standalone build ships its own server entrypoint; `next start` is not available
# here because the Next CLI is not part of the bundle.
CMD ["node", "server.js"]
