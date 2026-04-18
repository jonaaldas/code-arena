import { defineConfig } from "drizzle-kit";

const appEnv = process.env.NUXT_APP_ENV === "prod" ? "prod" : "dev";

const url = appEnv === "prod"
  ? process.env.TURSO_PROD_DATABASE_URL!
  : process.env.TURSO_DEV_DATABASE_URL!;

const authToken = appEnv === "prod"
  ? process.env.TURSO_PROD_AUTH_TOKEN!
  : process.env.TURSO_DEV_AUTH_TOKEN!;

export default defineConfig({
  schema: "./server/database/schema.ts",
  out: "./server/database/migrations",
  dialect: "turso",
  dbCredentials: { url, authToken },
});
