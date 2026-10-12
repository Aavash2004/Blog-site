import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { assertLocalDatabase } from "./guard-local-db";
import { initDb, resetDbReadyPromise } from "../lib/db";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  assertLocalDatabase(connectionString);

  console.log("Resetting local database tables...");
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query("DROP TABLE IF EXISTS activity_log, posts, users CASCADE;");
    console.log("✓ Dropped all existing tables.");
  } finally {
    client.release();
    await pool.end();
  }

  resetDbReadyPromise();
  console.log("Running fresh schema migrations...");
  await initDb();
  console.log("✓ Database reset and migrated successfully.");
}

main().catch((err) => {
  console.error("db:reset failed:", err);
  process.exit(1);
});
