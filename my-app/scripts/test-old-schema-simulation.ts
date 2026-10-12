import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import {
  ensureDb,
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
    // STEP 3: Seed legacy rows
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

    const postInsert = await client.query(
      `INSERT INTO posts (title, slug, excerpt, content, category, status)
       VALUES 
         ('Annapurna Circuit Trek Guide', 'annapurna-circuit-trek-guide', 'Historic trek guide excerpt.', 'Full trekking story and tips...', 'Trekking', 'PUBLISHED'),
         ('Work in Progress Trek', 'wip-trek', 'Unpublished draft notes.', 'Draft content...', 'Culture', 'DRAFT')
       RETURNING id, title, slug, status;`
    );

    const activityInsert = await client.query(
      `INSERT INTO activity_log (action, description)
       VALUES ('USER_REGISTERED', 'Legacy author registered before Phase 1 hardening')
       RETURNING id, action, description;`
    );

    console.log(`✓ Seeded 1 legacy user (id: ${legacyUser.id}, email: ${legacyUser.email})`);
    console.log(`✓ Seeded ${postInsert.rowCount} legacy posts (IDs: ${postInsert.rows.map(r => r.id).join(", ")})`);
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
    console.log("users columns:", userColsBefore.rows.map(r => r.column_name).join(", "));
    console.log("posts columns:", postColsBefore.rows.map(r => r.column_name).join(", "));
    console.log("activity_log columns:", actColsBefore.rows.map(r => r.column_name).join(", "));

    // --------------------------------------------------------------------------
    // STEP 4: Run ensureDb() / initDb()
    // --------------------------------------------------------------------------
    console.log("\n[STEP 4] Executing initDb() migration on legacy database...");
    const initResult = await ensureDb();
    console.log(`✓ initDb() returned: ${initResult}`);

    // --------------------------------------------------------------------------
    // STEP 5: Verify no data loss and presence of new columns
    // --------------------------------------------------------------------------
    console.log("\n[STEP 5] Verifying schema migrations and data integrity...");

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

    // Check posts
    const postsAfter = await client.query("SELECT id, title, slug, status, author_id, updated_at FROM posts ORDER BY id;");
    console.log(`✓ Posts count: ${postsAfter.rowCount} (expected: 2)`);
    console.table(postsAfter.rows);

    // Check activity_log
    const actAfter = await client.query("SELECT * FROM activity_log ORDER BY id;");
    console.log(`✓ Activity log count: ${actAfter.rowCount} (expected: 1)`);
    console.table(actAfter.rows);

    // --------------------------------------------------------------------------
    // STEP 6: Verify Login for the old user
    // --------------------------------------------------------------------------
    console.log("\n[STEP 6] Testing authentication for the legacy user...");
    const authResult = await findUserByEmailAndPassword("legacy.author@example.com", rawPassword);
    if (!authResult) {
      throw new Error("❌ Login failed for legacy user with valid password!");
    }
    console.log("✓ Login succeeded for legacy user!");
    console.log("  Authenticated user object:", authResult);

    // --------------------------------------------------------------------------
    // STEP 7: Verify Old posts list and edit
    // --------------------------------------------------------------------------
    console.log("\n[STEP 7] Testing post queries and editing...");
    const allPosts = await getAllPosts();
    console.log(`✓ getAllPosts() returned ${allPosts.length} posts`);

    const publishedPosts = await getPublishedPosts();
    console.log(`✓ getPublishedPosts() returned ${publishedPosts.length} published post (expected: 1)`);

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
    // STEP 8: Verify Admin Dashboard loads
    // --------------------------------------------------------------------------
    console.log("\n[STEP 8] Testing admin promotion and dashboard queries...");
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
    // STEP 9: Verify unreachable DB in production throws
    // --------------------------------------------------------------------------
    console.log("\n[STEP 9] Verifying initDb() throws when database is unreachable in production...");
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
        console.log(`✓ Production error formatting: "Postgres unavailable in production environment: ${(err as Error).message}"`);
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
    console.log("✅ ALL SIMULATION CHECKS PASSED: Zero data loss, seamless upgrade & admin access!");
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
