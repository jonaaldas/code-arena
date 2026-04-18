# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **Bun** (see `bun.lock`).

```bash
bun install              # install deps
bun run dev              # nuxt dev server on :3000
bun run build            # nuxt build → .output/
bun run db:generate      # generate SQL from schema changes
bun run db:push          # push schema directly to the DB selected by NUXT_APP_ENV
bun run db:studio        # drizzle studio
```

Target a specific Turso DB by setting `NUXT_APP_ENV` for the command:

```bash
NUXT_APP_ENV=prod bun run db:push     # push schema to prod Turso
NUXT_APP_ENV=dev  bun run db:push     # default
```

No test runner is configured.

## Architecture

**Stack:** Nuxt 4 (SSR, Nitro) • Bun runtime • Vue 3 + Pinia • Tailwind v4 + shadcn-vue • Drizzle ORM • Turso (libSQL) • better-auth.

**Two-DB environment switch.** A single `NUXT_APP_ENV` env var (`dev` | `prod`) selects between two Turso databases. This switch lives in **two places** that must stay in sync:

- `drizzle.config.ts` — for migrations / `db:push`
- `server/utils/db.ts` — for the runtime drizzle client

Both read `TURSO_{PROD,DEV}_DATABASE_URL` and `TURSO_{PROD,DEV}_AUTH_TOKEN`. Any new DB tooling must follow the same pattern, or it will silently hit the wrong database.

**Auth.** `better-auth` is mounted as a Nitro catch-all at `server/api/auth/[...all].ts`, backed by `drizzleAdapter(db, { provider: "sqlite", schema })` in `server/utils/auth.ts`. The `user`, `session`, `account`, `verification` tables in `server/database/schema.ts` are **better-auth's required schema** — changes must remain compatible with better-auth's expectations. GitHub is the only configured social provider.

On the client, `app/lib/auth-client.ts` exposes better-auth's Vue client. Session state is cached in the Pinia store `app/stores/user.ts`, which hydrates via `GET /api/me` (forwarding cookies during SSR so the server-rendered page sees the logged-in user).

**Schema workflow.** There is no `migrations/` directory — this project uses `drizzle-kit push` (declarative sync), not generated migration files. To change schema: edit `server/database/schema.ts`, then `db:push` against each environment.

**Deploy.** `.github/workflows/deploy_prod.yaml` on push to `main`: builds a multi-arch image (`linux/amd64,linux/arm64`) via `docker buildx`, pushes to Docker Hub as `jonaaldas/code-arena:latest`, then SSHes to the VPS and runs `docker compose pull && up -d --force-recreate`. Runtime env (including `NUXT_APP_ENV` and Turso creds) lives in the VPS `docker-compose.yml` / `.env`, **not** in the image. Caddy on the VPS reverse-proxies `:3000`. See `README.md` for first-time VPS setup.

**Nuxt conventions to know here:**

- `app/` holds client code (Nuxt 4 `srcDir` layout); `server/` holds Nitro code.
- Server imports use the `~~/` alias (repo root), e.g. `~~/server/utils/auth`.
- `shadcn-vue` is configured with empty component prefix and `@/components/ui` dir — import as `@/components/ui/button` etc.
