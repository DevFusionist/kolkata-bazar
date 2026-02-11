import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const rawUrl = process.env.DATABASE_URL;

// Normalize SSL mode to avoid pg v9 warning: require/prefer/verify-ca → verify-full for current secure behavior
function normalizeConnectionString(url: string): string {
  try {
    const u = new URL(url);
    const ssl = u.searchParams.get("sslmode");
    if (ssl === "require" || ssl === "prefer" || ssl === "verify-ca") {
      u.searchParams.set("sslmode", "verify-full");
    }
    return u.toString();
  } catch {
    return url;
  }
}

const connectionString = rawUrl ? normalizeConnectionString(rawUrl) : null;

// Single pool when DATABASE_URL is set (Neon or any Postgres); otherwise storage uses MemStorage
const pool = connectionString
  ? new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      keepAlive: true,
    })
  : null;

export const db = pool
  ? drizzle({ schema, client: pool })
  : (null as unknown as ReturnType<typeof drizzle>);
