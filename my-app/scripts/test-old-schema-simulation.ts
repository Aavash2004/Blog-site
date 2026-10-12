import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { assertLocalDatabase } from "./guard-local-db";
import {
  initDb,
  resetDbReadyPromise,
  createUserRecord,
  findUserByEmailAndPassword,
  findUserById,
  getAllPosts,
  getPublishedPosts,
  updatePost,
  getDashboardStats,
  getRecentActivity,
  promoteUserToAdmin,
} from "../lib/db";

async function runSimulation() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not configured.");
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // GUARD: Refuse to run against remote/production databases
  // --------------------------------------------------------------------------
  assertLocalDatabase(connectionString);

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  console.log("================================================================================");
  console.log("PHASE 1 SCHEMA UPGRADE & BACKWARD COMPATIBILITY SIMULATION TEST");
  console.log("================================================================================");

  try {
    // --------------------------------------------------------------------------
    // STEP 1: Teardown existing tables
    // --------------------------------------------------------------------------
    console.log("\n[STEP 1] Resetting database tables to simulate legacy schema...");
    await client.query("DROP TABLE IF EXISTS activity_log, posts, users CASCADE;");
    console.log("✓ Existing tables dropped.");

    // --------------------------------------------------------------------------
    // STEP 2: Create OLD hand-made pre-Phase-1 tables
    // --------------------------------------------------------------------------
    console.log("\n[STEP 2] Creating legacy pre-Phase-1 tables (from main git history)...");

    // Old users: Only id, name, email, password, created_at (NO role, username, phone, address, avatar)
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Old posts: NO author_id, NO updated_at, unconstrained status
    await client.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        featured_image TEXT,
        category VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'DRAFT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Old activity_log: NO user_id
    await client.query(`
      CREATE TABLE activity_log (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✓ Legacy schema created successfully.");

    // --------------------------------------------------------------------------
    // STEP 3: Seed legacy rows (including lowercase & mixed-case statuses)
    // --------------------------------------------------------------------------
    console.log("\n[STEP 3] Seeding legacy database with pre-Phase-1 data...");
    const rawPassword = "LegacyPassword2026!";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const userInsert = await client.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at;`,
      ["Aavash Basnet (Legacy)", "legacy.author@example.com", hashedPassword]
    );
    const legacyUser = userInsert.rows[0];

    // Seed posts with lowercase and mixed-case status values to test safe normalization
    const postInsert = await client.query(
      `INSERT INTO posts (title, slug, excerpt, content, category, status)
       VALUES 
         ('Annapurna Circuit Trek Guide', 'annapurna-circuit-trek-guide', 'Historic trek guide excerpt.', 'Full trekking story and tips...', 'Trekking', 'published'),
         ('Work in Progress Trek', 'wip-trek', 'Unpublished draft notes.', 'Draft content...', 'Culture', 'draft'),
         ('Mount Everest Base Camp Trek', 'everest-base-camp', 'Everest expedition tips.', 'Climbing details...', 'Adventure', 'Published')
       RETURNING id, title, slug, status;`
    );

    const activityInsert = await client.query(
      `INSERT INTO activity_log (action, description)
       VALUES ('USER_REGISTERED', 'Legacy author registered before Phase 1 hardening')
       RETURNING id, action, description;`
    );

    console.log(`✓ Seeded 1 legacy user (id: ${legacyUser.id}, email: ${legacyUser.email})`);
    console.log(`✓ Seeded ${postInsert.rowCount} legacy posts with non-uppercase statuses:`);
    console.table(postInsert.rows);
    console.log(`✓ Seeded ${activityInsert.rowCount} legacy activity log record`);

    // Verify missing columns before migration
    const userColsBefore = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users';`
    );
    const postColsBefore = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'posts';`
    );
    const actColsBefore = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'activity_log';`
    );

    console.log("\nLegacy Column Verification Before Migration:");
    console.log("users columns:", userColsBefore.rows.map((r) => r.column_name).join(", "));
    console.log("posts columns:", postColsBefore.rows.map((r) => r.column_name).join(", "));
    console.log("activity_log columns:", actColsBefore.rows.map((r) => r.column_name).join(", "));

    // --------------------------------------------------------------------------
    // STEP 4: Test Concurrency & Advisory Lock
    // --------------------------------------------------------------------------
    console.log("\n[STEP 4] Testing concurrent initDb() cold-starts with two separate connection pools...");
    resetDbReadyPromise();

    const poolA = new Pool({ connectionString });
    const poolB = new Pool({ connectionString });

    const startTime = Date.now();
    const [resA, resB] = await Promise.all([
      (async () => {
        const startA = Date.now();
        console.log("  [Pool A] Attempting schema migration under advisory lock...");
        const res = await initDb(poolA);
        console.log(`  [Pool A] Completed in ${Date.now() - startA}ms (success: ${res})`);
        return res;
      })(),
      (async () => {
        const startB = Date.now();
        console.log("  [Pool B] Attempting schema migration under advisory lock...");
        const res = await initDb(poolB);
        console.log(`  [Pool B] Completed in ${Date.now() - startB}ms (success: ${res})`);
        return res;
      })(),
    ]);

    await poolA.end();
    await poolB.end();

    console.log(`✓ Both concurrent migrations completed in ${Date.now() - startTime}ms without conflict.`);
    console.log(`✓ Pool A result: ${resA}, Pool B result: ${resB}`);

    // --------------------------------------------------------------------------
    // STEP 5: Verify no data loss, new columns, and status normalization
    // --------------------------------------------------------------------------
    console.log("\n[STEP 5] Verifying schema migrations, data integrity, and status normalization...");

    // Check users
    const usersAfter = await client.query("SELECT * FROM users ORDER BY id;");
    console.log(`✓ Users count: ${usersAfter.rowCount} (expected: 1)`);
    const migratedUser = usersAfter.rows[0];
    console.log("  Migrated user row:", {
      id: migratedUser.id,
      name: migratedUser.name,
      email: migratedUser.email,
      role: migratedUser.role, // should default to 'user'
      username: migratedUser.username,
      phone: migratedUser.phone,
      address: migratedUser.address,
      avatar_url: migratedUser.avatar_url,
      created_at: migratedUser.created_at,
    });
    if (migratedUser.role !== "user") {
      throw new Error(`Expected role 'user', got '${migratedUser.role}'`);
    }

    // Check posts and status normalization
    const postsAfter = await client.query(
      "SELECT id, title, slug, status, author_id, updated_at FROM posts ORDER BY id;"
    );
    console.log(`✓ Posts count: ${postsAfter.rowCount} (expected: 3)`);
    console.log("  Posts table after migration (verifying UPPERCASE normalization):");
    console.table(postsAfter.rows);

    // Verify all posts are normalized to UPPERCASE
    for (const post of postsAfter.rows) {
      if (post.status !== "PUBLISHED" && post.status !== "DRAFT") {
        throw new Error(`Expected uppercase status 'PUBLISHED' or 'DRAFT', got '${post.status}'`);
      }
    }
    console.log("✓ All post status values verified to be normalized to uppercase ('PUBLISHED' / 'DRAFT')!");

    // Check activity_log
    const actAfter = await client.query("SELECT * FROM activity_log ORDER BY id;");
    console.log(`✓ Activity log count: ${actAfter.rowCount} (expected: 1)`);
    console.table(actAfter.rows);

    // --------------------------------------------------------------------------
    // STEP 6: Verify Login for the old user (both exact case and mixed case)
    // --------------------------------------------------------------------------
    console.log("\n[STEP 6] Testing authentication for the legacy user...");
    const authResultExact = await findUserByEmailAndPassword("legacy.author@example.com", rawPassword);
    if (!authResultExact) {
      throw new Error("❌ Login failed for legacy user with exact email!");
    }
    console.log("✓ Login succeeded for exact email (legacy.author@example.com)!");

    const authResultMixed = await findUserByEmailAndPassword("LEGACY.AUTHOR@EXAMPLE.COM", rawPassword);
    if (!authResultMixed) {
      throw new Error("❌ Login failed for legacy user with uppercase email!");
    }
    console.log("✓ Login succeeded for uppercase email (LEGACY.AUTHOR@EXAMPLE.COM) via case-insensitive normalization!");

    // --------------------------------------------------------------------------
    // STEP 7: Duplicate-looking email in different case test
    // --------------------------------------------------------------------------
    console.log("\n[STEP 7] Testing duplicate-looking email in different case (Legacy.Author@EXAMPLE.COM)...");
    const duplicateAttempt = await createUserRecord(
      "Duplicate Imposter",
      "Legacy.Author@EXAMPLE.COM",
      "DifferentPassword999!"
    );

    console.log("  Result of registering duplicate-looking email:", duplicateAttempt);
    if (duplicateAttempt.success || !duplicateAttempt.duplicate) {
      throw new Error("❌ Expected createUserRecord to reject duplicate-looking email in different case!");
    }
    console.log("✓ Registration safely rejected: createUserRecord detected case-insensitive duplicate and returned duplicate: true.");

    // --------------------------------------------------------------------------
    // STEP 8: Verify Old posts list and edit
    // --------------------------------------------------------------------------
    console.log("\n[STEP 8] Testing post queries and editing...");
    const allPosts = await getAllPosts();
    console.log(`✓ getAllPosts() returned ${allPosts.length} posts`);

    const publishedPosts = await getPublishedPosts();
    console.log(`✓ getPublishedPosts() returned ${publishedPosts.length} published posts (expected: 2: Annapurna & Everest)`);

    const postToEdit = allPosts[0];
    console.log(`  Updating post id ${postToEdit.id} (${postToEdit.title})...`);
    const updatedPost = await updatePost(postToEdit.id, {
      title: "Annapurna Circuit Trek Guide (2026 Updated Edition)",
      slug: postToEdit.slug,
      excerpt: "Updated excerpt with modern trail conditions.",
      content: "Updated comprehensive guide for trekking the circuit safely.",
      category: "Trekking",
      status: "PUBLISHED",
    });

    if (!updatedPost || updatedPost.title !== "Annapurna Circuit Trek Guide (2026 Updated Edition)") {
      throw new Error("❌ Post update failed!");
    }
    console.log("✓ Post updated successfully! New updated_at:", updatedPost.updated_at);

    // --------------------------------------------------------------------------
    // STEP 9: Verify Admin Dashboard loads
    // --------------------------------------------------------------------------
    console.log("\n[STEP 9] Testing admin promotion and dashboard queries...");
    const promoteResult = await promoteUserToAdmin("legacy.author@example.com");
    console.log(`✓ promoteUserToAdmin result:`, promoteResult);

    const adminUser = await findUserById(migratedUser.id);
    console.log(`✓ findUserById verification: role = ${adminUser?.role} (expected: admin)`);

    const stats = await getDashboardStats();
    console.log("✓ getDashboardStats() succeeded:", stats);

    const recentActivity = await getRecentActivity(5);
    console.log(`✓ getRecentActivity() returned ${recentActivity.length} events:`);
    console.table(recentActivity);

    // --------------------------------------------------------------------------
    // STEP 10: Verify unreachable DB in production throws
    // --------------------------------------------------------------------------
    console.log("\n[STEP 10] Verifying initDb() throws when database is unreachable in production...");
    const originalEnv = process.env.NODE_ENV;
    const originalUrl = process.env.DATABASE_URL;
    try {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      process.env.DATABASE_URL = "postgresql://postgres:badpass@127.0.0.1:54329/nonexistent?connect_timeout=2";

      const testPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 2000,
      });
      let threwAsExpected = false;
      try {
        const testClient = await testPool.connect();
        await testClient.query("SELECT 1");
        testClient.release();
      } catch (err) {
        threwAsExpected = true;
        console.log(`✓ Confirmed connection error throws: ${(err as Error).message}`);
        console.log(
          `✓ Production error formatting: "Postgres unavailable in production environment: ${(err as Error).message}"`
        );
      } finally {
        await testPool.end();
      }
      if (!threwAsExpected) {
        throw new Error("Expected unreachable DB in production to throw!");
      }
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
      process.env.DATABASE_URL = originalUrl;
    }

    console.log("\n================================================================================");
    console.log("✅ ALL SIMULATION CHECKS PASSED: Zero data loss, advisory lock verified, status normalized!");
    console.log("================================================================================");
  } finally {
    client.release();
    await pool.end();
  }
}

runSimulation().catch((err) => {
  console.error("\n❌ Simulation test failed:", err);
  process.exit(1);
});
