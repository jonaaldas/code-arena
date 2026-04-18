# syntax=docker/dockerfile:1.7
# Build stage — pinned to the host arch so Vite/Nitro never run under QEMU
FROM --platform=$BUILDPLATFORM oven/bun:1 AS build
WORKDIR /app

ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1 \
    CI=true

COPY package.json bun.lock* ./

RUN --mount=type=cache,target=/root/.bun/install/cache,sharing=locked \
    bun install --frozen-lockfile --ignore-scripts

COPY . .

RUN --mount=type=cache,target=/app/node_modules/.cache \
    --mount=type=cache,target=/app/.nuxt/cache \
    --mount=type=cache,target=/app/.nitro/cache \
    bunx nuxt prepare && bun run build

# Production stage — runs on the target arch
FROM oven/bun:1-slim AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/.output /app

EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "/app/server/index.mjs"]
