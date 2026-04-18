import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../database/schema";

const appEnv = process.env.NUXT_APP_ENV === "prod" ? "prod" : "dev";

const url = appEnv === "prod"
  ? process.env.TURSO_PROD_DATABASE_URL
  : process.env.TURSO_DEV_DATABASE_URL;

const authToken = appEnv === "prod"
  ? process.env.TURSO_PROD_AUTH_TOKEN
  : process.env.TURSO_DEV_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(`Missing Turso credentials for env=${appEnv}`);
}

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
