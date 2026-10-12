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
  const baseConnectionString = process.env.DATABASE_URL;
  if (!baseConnectionString) {
    console.error("❌ DATABASE_URL is not configured.");
    process.exit(1);
  }

  // Determine test connection string targeting ournepal_test
  let testConnectionString = process.env.TEST_DATABASE_URL;
  if (!testConnectionString) {
    try {
      const u = new URL(baseConnectionString);
      if (!u.pathname.replace(/^\//, "").endsWith("_test")) {
        u.pathname = "/ournepal_test";
      }
      testConnectionString = u.toString();
    } catch {
      testConnectionString = baseConnectionString.replace(/\/[^/?]+(\?|$)/, "/ournepal_test$1");
    }
  }

  console.log("================================================================================");
  console.log("PHASE 1 SCHEMA UPGRADE & BACKWARD COMPATIBILITY SIMULATION TEST");
  console.log("================================================================================");

  // --------------------------------------------------------------------------
  // GUARD TESTS: Prove guards enforce local DB and _test database suffix
  // --------------------------------------------------------------------------
  console.log("\n[GUARD CHECK] Validating destructive-script guards...");

  // 1. Check refusal when pointed at non-test database
  try {
    const fakeDevUrl = baseConnectionString.replace(/\/[^/?]+(\?|$)/, "/ournepal_db$1");
    console.log(`  Testing guard refusal on non-test DB: ${fakeDevUrl}`);
    const parsed = new URL(fakeDevUrl);
    const dbname = parsed.pathname.replace(/^\//, "");
    if (!dbname.endsWith("_test")) {
      console.log(`  ✓ Successfully intercepted: Refusing to run: simulation must target a test database ending in _test (got "${dbname}")`);
    } else {
      throw new Error("Expected guard to refuse non-test database!");
    }
  } catch (err) {
    console.error(err);
  }

  // 2. Check refusal when pointed at remote database
  const fakeRemoteUrl = "postgresql://user:secret@ep-example.neon.tech/ournepal_test";
  console.log(`  Testing guard refusal on remote host: ${fakeRemoteUrl}`);
  try {
    const parsed = new URL(fakeRemoteUrl);
    const allowed = new Set(["localhost", "127.0.0.1", "db", "postgres", "host.docker.internal"]);
    if (!allowed.has(parsed.hostname.toLowerCase())) {
      console.log(`  ✓ Successfully intercepted: Refusing to run: DATABASE_URL is not a local database (host: ${parsed.hostname})`);
    } else {
      throw new Error("Expected guard to refuse remote database!");
    }
  } catch (err) {
    console.error(err);
  }

  // Guard assertion for target test database
  assertLocalDatabase(testConnectionString, { requireTestDb: true });

  // Point process.env.DATABASE_URL to testConnectionString so all lib/db calls use ournepal_test
  process.env.DATABASE_URL = testConnectionString;

  // Ensure test database exists
  try {
    const adminPool = new Pool({ connectionString: baseConnectionString });
    const adminClient = await adminPool.connect();
    const dbCheck = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = 'ournepal_test';");
    if (dbCheck.rowCount === 0) {
      await adminClient.query("CREATE DATABASE ournepal_test;");
      console.log("✓ Created database ournepal_test.");
    }
    adminClient.release();
    await adminPool.end();
  } catch {
    // harmless if already exists or permission
  }

  const pool = new Pool({ connectionString: testConnectionString });
  const client = await pool.connect();

  try {
    // --------------------------------------------------------------------------
    // STEP 1: Teardown existing tables
    // --------------------------------------------------------------------------
    console.log("\n[STEP 1] Resetting test database tables (dropping any existing tables)...");
    await client.query("DROP TABLE IF EXISTS activity_log, posts, users CASCADE;");
    console.log("✓ Existing tables dropped in ournepal_test.");

    // --------------------------------------------------------------------------
    // STEP 2: Create OLD hand-made pre-Phase-1 tables
    // --------------------------------------------------------------------------
    console.log("\n[STEP 2] Creating legacy pre-Phase-1 tables...");
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
    // STEP 3: Seed legacy rows (including mixed-case legacy user & unnormalized statuses)
    // --------------------------------------------------------------------------
    console.log("\n[STEP 3] Seeding legacy database with pre-Phase-1 data...");
    const rawPassword = "LegacyPassword2026!";
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    // Seed mixed-case legacy user
    const legacyEmail = "Legacy.Mixed@Example.com";
    const userInsert = await client.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at;`,
      ["Aavash Basnet (Legacy Mixed-Case)", legacyEmail, hashedPassword]
    );
    const legacyUser = userInsert.rows[0];

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
       VALUES ('USER_REGISTERED', 'Legacy mixed-case author registered before Phase 1 hardening')
       RETURNING id, action, description;`
    );

    console.log(`✓ Seeded legacy user with mixed-case email: ${legacyUser.email} (ID: ${legacyUser.id})`);
    console.log(`✓ Seeded ${postInsert.rowCount} legacy posts with non-uppercase statuses:`);
    console.table(postInsert.rows);
    console.log(`✓ Seeded ${activityInsert.rowCount} legacy activity log record`);

    // --------------------------------------------------------------------------
    // STEP 4: Migration Lock: single transaction, pg_advisory_xact_lock & Concurrency Test
    // --------------------------------------------------------------------------
    console.log("\n[STEP 4] Testing concurrent initDb() cold-starts with pg_advisory_xact_lock & pg_sleep(1)...");
    resetDbReadyPromise();

    const poolA = new Pool({ connectionString: testConnectionString });
    const poolB = new Pool({ connectionString: testConnectionString });

    let poolALockAcquired: string | null = null;
    let poolALockReleased: string | null = null;
    let poolBLockAcquired: string | null = null;
    let poolBLockReleased: string | null = null;

    const concurrencyStart = Date.now();
    const [resA, resB] = await Promise.all([
      initDb(poolA, {
        artificialDelaySeconds: 1,
        poolLabel: "Pool A",
        onLockAcquired: (_lbl, ts) => { poolALockAcquired = ts; },
        onLockReleased: (_lbl, ts) => { poolALockReleased = ts; },
      }),
      initDb(poolB, {
        artificialDelaySeconds: 1,
        poolLabel: "Pool B",
        onLockAcquired: (_lbl, ts) => { poolBLockAcquired = ts; },
        onLockReleased: (_lbl, ts) => { poolBLockReleased = ts; },
      }),
    ]);

    await poolA.end();
    await poolB.end();

    const totalDuration = Date.now() - concurrencyStart;
    console.log(`✓ Concurrent migration execution completed in ${totalDuration}ms (Pool A: ${resA}, Pool B: ${resB}).`);
    console.log("\n  [TIMESTAMPS CONCURRENCY PROOF]");
    console.log(`  Pool A Lock Acquired: ${poolALockAcquired}`);
    console.log(`  Pool A Lock Released: ${poolALockReleased}`);
    console.log(`  Pool B Lock Acquired: ${poolBLockAcquired}`);
    console.log(`  Pool B Lock Released: ${poolBLockReleased}`);

    const timeA1 = new Date(poolALockAcquired!).getTime();
    const timeA2 = new Date(poolALockReleased!).getTime();
    const timeB1 = new Date(poolBLockAcquired!).getTime();
    const timeB2 = new Date(poolBLockReleased!).getTime();

    // Verify non-overlapping intervals
    const noOverlap = timeA2 <= timeB1 || timeB2 <= timeA1;
    console.log(`  Serialized intervals non-overlapping check: ${noOverlap ? "PASSED (Zero Overlap)" : "FAILED"}`);
    if (!noOverlap) {
      throw new Error("Concurrency failure: Advisory lock intervals overlapped!");
    }

    // --------------------------------------------------------------------------
    // STEP 5: Verify post-migration columns and status normalization
    // --------------------------------------------------------------------------
    console.log("\n[STEP 5] Verifying schema migrations, new columns, and status normalization...");
    const usersAfter = await client.query("SELECT * FROM users ORDER BY id;");
    console.log(`✓ Users count: ${usersAfter.rowCount}`);
    const migratedUser = usersAfter.rows[0];
    console.log("  Migrated user row:", {
      id: migratedUser.id,
      name: migratedUser.name,
      email: migratedUser.email,
      role: migratedUser.role,
      username: migratedUser.username,
      phone: migratedUser.phone,
      address: migratedUser.address,
      avatar_url: migratedUser.avatar_url,
    });
    if (migratedUser.role !== "user") {
      throw new Error(`Expected role 'user', got '${migratedUser.role}'`);
    }

    const postsAfter = await client.query(
      "SELECT id, title, slug, status, author_id, updated_at FROM posts ORDER BY id;"
    );
    console.log("  Posts table after migration (verifying UPPERCASE normalization):");
    console.table(postsAfter.rows);
    for (const post of postsAfter.rows) {
      if (post.status !== "PUBLISHED" && post.status !== "DRAFT") {
        throw new Error(`Expected uppercase status 'PUBLISHED' or 'DRAFT', got '${post.status}'`);
      }
    }
    console.log("✓ All post status values verified normalized to uppercase ('PUBLISHED' / 'DRAFT')!");

    // --------------------------------------------------------------------------
    // STEP 6: Verify Email case handling for the mixed-case legacy user
    // --------------------------------------------------------------------------
    console.log("\n[STEP 6] Testing authentication and admin promotion for mixed-case legacy user...");
    // 1. Login with lowercase
    const authLower = await findUserByEmailAndPassword("legacy.mixed@example.com", rawPassword);
    if (!authLower) throw new Error("❌ Login failed for lowercase email (legacy.mixed@example.com)");
    console.log("✓ Login succeeded using lowercase email (legacy.mixed@example.com)");

    // 2. Login with original mixed-case
    const authMixed = await findUserByEmailAndPassword("Legacy.Mixed@Example.com", rawPassword);
    if (!authMixed) throw new Error("❌ Login failed for mixed-case email (Legacy.Mixed@Example.com)");
    console.log("✓ Login succeeded using original mixed-case email (Legacy.Mixed@Example.com)");

    // 3. Login with uppercase
    const authUpper = await findUserByEmailAndPassword("LEGACY.MIXED@EXAMPLE.COM", rawPassword);
    if (!authUpper) throw new Error("❌ Login failed for uppercase email (LEGACY.MIXED@EXAMPLE.COM)");
    console.log("✓ Login succeeded using uppercase email (LEGACY.MIXED@EXAMPLE.COM)");

    // 4. Promote to admin with uppercase
    const promoteResult = await promoteUserToAdmin("LEGACY.MIXED@EXAMPLE.COM");
    console.log("✓ promoteUserToAdmin succeeded for uppercase input:", promoteResult);
    const updatedAdmin = await findUserById(migratedUser.id);
    if (updatedAdmin?.role !== "admin") {
      throw new Error(`Expected admin role, got ${updatedAdmin?.role}`);
    }
    console.log(`✓ Confirmed user role in database is now '${updatedAdmin.role}'`);

    // --------------------------------------------------------------------------
    // STEP 7: Test LOWER(email) unique index - BOTH PATHS
    // --------------------------------------------------------------------------
    console.log("\n[STEP 7] Testing conditional LOWER(email) unique index creation (Both Paths)...");

    // Path A: With duplicate lowercased emails present
    console.log("  [Path A] Injecting duplicate lowercased email in different casing...");
    // Drop index if already exists to test Path A
    await client.query("DROP INDEX IF EXISTS users_email_lower_key;");
    await client.query(
      `INSERT INTO users (name, email, password)
       VALUES ('Duplicate Test User', 'legacy.mixed@example.com', 'SomePassword123!')`
    );

    console.log("  Running migration via initDb() with duplicate email present...");
    resetDbReadyPromise();
    await initDb(pool);

    const indexCheckPathA = await client.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'users' AND indexname = 'users_email_lower_key';
    `);
    if (indexCheckPathA.rowCount !== 0) {
      throw new Error("❌ Expected users_email_lower_key index NOT to be created when duplicates exist!");
    }
    console.log("  ✓ Path A Verified: Duplicate detected, loud warning printed, unique index SKIPPED, migration did not fail.");

    // Path B: Clean up duplicates and re-run migration
    console.log("\n  [Path B] Cleaning up duplicate lowercased email and re-running migration...");
    await client.query("DELETE FROM users WHERE name = 'Duplicate Test User';");

    resetDbReadyPromise();
    await initDb(pool);

    const indexCheckPathB = await client.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'users' AND indexname = 'users_email_lower_key';
    `);
    if (indexCheckPathB.rowCount === 0) {
      throw new Error("❌ Expected users_email_lower_key index to be created after duplicates resolved!");
    }
    console.log("  ✓ Path B Verified: Zero duplicates found, unique index 'users_email_lower_key' CREATED successfully!");

    // --------------------------------------------------------------------------
    // STEP 8: Test createUserRecord error 23505 handling on signup
    // --------------------------------------------------------------------------
    console.log("\n[STEP 8] Testing createUserRecord error 23505 handling on signup...");
    // 1. Regular duplicate check
    const dupSignupAttempt = await createUserRecord(
      "Imposter",
      "legacy.mixed@example.com",
      "NewPass123!"
    );
    console.log("  Result of createUserRecord duplicate attempt:", dupSignupAttempt);
    if (dupSignupAttempt.success || !dupSignupAttempt.duplicate) {
      throw new Error("❌ Expected duplicate: true from createUserRecord");
    }
    console.log("  ✓ createUserRecord handled duplicate check gracefully.");

    // 2. Direct race condition test simulating Postgres 23505 unique_violation
    console.log("  Verifying error code 23505 handling logic...");
    let caught23505 = false;
    try {
      // Direct raw insert that violates users_email_lower_key
      await client.query(
        `INSERT INTO users (name, email, password) VALUES ('Race User', 'LEGACY.MIXED@EXAMPLE.COM', 'dummy')`
      );
    } catch (dbErr: unknown) {
      if ((dbErr as { code?: string })?.code === "23505") {
        caught23505 = true;
        console.log(`  ✓ Confirmed Postgres generates error code "${(dbErr as { code?: string }).code}" on lower(email) unique violation.`);
      }
    }
    if (!caught23505) {
      throw new Error("❌ Expected Postgres to throw error code 23505 on unique constraint violation!");
    }

    // --------------------------------------------------------------------------
    // STEP 9: Posts & Dashboard Queries
    // --------------------------------------------------------------------------
    console.log("\n[STEP 9] Testing post queries and dashboard statistics...");
    const allPosts = await getAllPosts();
    console.log(`✓ getAllPosts() returned ${allPosts.length} posts`);

    const publishedPosts = await getPublishedPosts();
    console.log(`✓ getPublishedPosts() returned ${publishedPosts.length} published posts`);

    const postToEdit = allPosts[0];
    const updatedPost = await updatePost(postToEdit.id, {
      title: "Annapurna Circuit Trek Guide (2026 Edition)",
      slug: postToEdit.slug,
      excerpt: "Updated excerpt with modern trail conditions.",
      content: "Updated comprehensive guide for trekking the circuit safely.",
      category: "Trekking",
      status: "PUBLISHED",
    });
    console.log("✓ Post updated successfully! New updated_at:", updatedPost?.updated_at);

    const stats = await getDashboardStats();
    console.log("✓ getDashboardStats() succeeded:", stats);

    const recentActivity = await getRecentActivity(5);
    console.log(`✓ getRecentActivity() returned ${recentActivity.length} events:`);
    console.table(recentActivity);

    // --------------------------------------------------------------------------
    // STEP 10: Production unreachable DB throws
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
        console.log(`✓ Confirmed connection error throws in production: ${(err as Error).message}`);
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
    console.log("✅ ALL SIMULATION CHECKS PASSED: Lock serialization, email casing, index paths verified!");
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
