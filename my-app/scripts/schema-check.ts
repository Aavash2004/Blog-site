import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function inspectSchema() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    const tables = ["users", "posts", "activity_log"];

    console.log("==================================================================");
    console.log("DATABASE SCHEMA INSPECTION REPORT (READ-ONLY)");
    console.log(`Connection: ${connectionString.replace(/:[^:@]+@/, ":****@")}`);
    console.log("==================================================================\n");

    for (const table of tables) {
      console.log(`------------------------------------------------------------------`);
      console.log(`TABLE: ${table.toUpperCase()}`);
      console.log(`------------------------------------------------------------------`);

      // 1. Columns
      const colRes = await client.query(
        `SELECT 
           column_name, 
           data_type, 
           character_maximum_length,
           is_nullable, 
           column_default
         FROM information_schema.columns
         WHERE table_name = $1
         ORDER BY ordinal_position;`,
        [table]
      );

      if (colRes.rowCount === 0) {
        console.log(`[!] Table "${table}" DOES NOT EXIST in the current database.\n`);
        continue;
      }

      console.log("\n[Columns]");
      console.table(
        colRes.rows.map((r) => ({
          column: r.column_name,
          type: r.character_maximum_length ? `${r.data_type}(${r.character_maximum_length})` : r.data_type,
          nullable: r.is_nullable,
          default: r.column_default ?? "NULL",
        }))
      );

      // 2. Constraints
      const conRes = await client.query(
        `SELECT
           tc.constraint_name,
           tc.constraint_type,
           kcu.column_name,
           ccu.table_name AS foreign_table,
           ccu.column_name AS foreign_column
         FROM information_schema.table_constraints tc
         LEFT JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
         LEFT JOIN information_schema.constraint_column_usage ccu
           ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
         WHERE tc.table_name = $1
         ORDER BY tc.constraint_type, tc.constraint_name;`,
        [table]
      );

      console.log("[Constraints]");
      if (conRes.rowCount && conRes.rowCount > 0) {
        console.table(
          conRes.rows.map((r) => ({
            name: r.constraint_name,
            type: r.constraint_type,
            column: r.column_name ?? "—",
            references: r.foreign_table ? `${r.foreign_table}(${r.foreign_column})` : "—",
          }))
        );
      } else {
        console.log("  (None found)");
      }

      // 3. Indexes
      const idxRes = await client.query(
        `SELECT indexname, indexdef
         FROM pg_indexes
         WHERE tablename = $1
         ORDER BY indexname;`,
        [table]
      );

      console.log("[Indexes]");
      if (idxRes.rowCount && idxRes.rowCount > 0) {
        idxRes.rows.forEach((r) => {
          console.log(`  - ${r.indexname}: ${r.indexdef}`);
        });
      } else {
        console.log("  (None found)");
      }
      console.log("\n");
    }
  } finally {
    client.release();
    await pool.end();
  }
}

inspectSchema().catch((err) => {
  console.error("Schema inspection failed:", err);
  process.exit(1);
});
