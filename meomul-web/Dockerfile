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

ENV NEXT_PUBLIC_GRAPHQL_URL=${NEXT_PUBLIC_GRAPHQL_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_CHAT_SOCKET_URL=${NEXT_PUBLIC_CHAT_SOCKET_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}

RUN npx next build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CHAT_SOCKET_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BUILD_ID

ENV NEXT_PUBLIC_GRAPHQL_URL=${NEXT_PUBLIC_GRAPHQL_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_CHAT_SOCKET_URL=${NEXT_PUBLIC_CHAT_SOCKET_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["npm", "run", "start"]
