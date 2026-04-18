# syntax=docker/dockerfile:1.7
# Build stage
FROM oven/bun:1 AS build
WORKDIR /app

ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1

COPY package.json bun.lock* ./

# Cache the bun package store so reinstalls are near-instant
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts

COPY . .

# Cache Nuxt/Nitro/Vite build artefacts across runs.
# These caches are NOT copied into the final image — they just speed up rebuilds.
RUN --mount=type=cache,target=/app/node_modules/.cache \
    --mount=type=cache,target=/app/.nuxt/cache \
    --mount=type=cache,target=/app/.nitro/cache \
    bun run build

# Production stage — only the built output ships
FROM oven/bun:1-slim AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/.output /app

EXPOSE 3000/tcp
ENTRYPOINT ["bun", "--bun", "run", "/app/server/index.mjs"]
