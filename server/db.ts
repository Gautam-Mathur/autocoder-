import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

let pool: InstanceType<typeof Pool> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  } catch (e) {
    console.warn('[db] Failed to connect to PostgreSQL — using in-memory storage.');
    pool = null;
    db = null as any;
  }
} else {
  console.info('[db] No DATABASE_URL set — using in-memory storage.');
}

export { pool, db };
