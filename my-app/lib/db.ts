import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  username?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  avatar_url?: string | null;
};

export type SafeUser = Omit<UserRecord, "password">;

let poolInstance: Pool | null = null;
function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return poolInstance;
}

export async function query(text: string, params?: unknown[]) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export const DB_MIGRATION_LOCK_KEY = 74829104;

export async function runMigrationsOnClient(client: {
  query: (
    text: string,
    params?: unknown[]
  ) => Promise<{ rows: Record<string, unknown>[]; rowCount?: number | null }>;
}): Promise<boolean> {
  // Helper for resilient schema updates: logs harmless discrepancies instead of crashing the app
  const safeRun = async (label: string, sql: string) => {
    try {
      await client.query(sql);
    } catch (stepError) {
      console.warn(`[initDb] Notice during schema step "${label}": ${(stepError as Error).message}`);
    }
  };

  // 1. Users Table
  await safeRun(
    "Create users table",
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      username VARCHAR(50) UNIQUE,
      phone VARCHAR(20),
      address TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );`
  );

  // Safe column migrations for existing users table
  await safeRun(
    "Add users.role",
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';`
  );
  await safeRun(
    "Add users.username",
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);`
  );
  await safeRun(
    "Add users.phone",
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);`
  );
  await safeRun(
    "Add users.address",
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`
  );
  await safeRun(
    "Add users.avatar_url",
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`
  );
  await safeRun(
    "Add users.created_at",
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;`
  );

  // 2. Posts Table
  await safeRun(
    "Create posts table",
    `CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      featured_image TEXT,
      category VARCHAR(100) NOT NULL,
      status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
      author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );`
  );

  // Safe column migrations for existing posts table
  await safeRun(
    "Add posts.author_id",
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`
  );
  await safeRun(
    "Add posts.updated_at",
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;`
  );

  // 3. Activity Log Table
  await safeRun(
    "Create activity_log table",
    `CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      action VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );`
  );

  // Safe column migrations for existing activity_log table
  await safeRun(
    "Add activity_log.user_id",
    `ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`
  );

  // Safe backfill for existing records
  await safeRun(
    "Backfill null user roles",
    `UPDATE users SET role = 'user' WHERE role IS NULL;`
  );
  await safeRun(
    "Backfill null post updated_at",
    `UPDATE posts SET updated_at = created_at WHERE updated_at IS NULL;`
  );
  await safeRun(
    "Backfill null post status",
    `UPDATE posts SET status = 'DRAFT' WHERE status IS NULL;`
  );

  // Safe normalization of post status casing:
  // Legacy datasets or hand-crafted entries may have stored lowercase or mixed-case status
  // strings ('published', 'draft', etc.). Application queries strictly filter for
  // status = 'PUBLISHED', which would silently hide lowercase published posts from public views.
  // Note: We do NOT add CHECK constraints to existing tables unless existing data satisfies them.
  await safeRun(
    "Normalize post status casing",
    `UPDATE posts 
     SET status = UPPER(status) 
     WHERE status IN ('published', 'draft', 'Published', 'Draft');`
  );

  // 4. Indexes
  await safeRun(
    "Create idx_posts_slug",
    `CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);`
  );
  await safeRun(
    "Create idx_posts_status",
    `CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);`
  );
  await safeRun(
    "Create idx_activity_created",
    `CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);`
  );

  // 5. Verification step: verify every required column exists
  const colCheckResult = await client.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_name IN ('users', 'posts', 'activity_log');
  `);
  const existingCols = new Set(
    colCheckResult.rows.map(
      (r) => `${(r as { table_name: string; column_name: string }).table_name}.${(r as { table_name: string; column_name: string }).column_name}`
    )
  );

  const requiredCols = [
    "users.role",
    "users.username",
    "users.phone",
    "users.address",
    "users.avatar_url",
    "posts.author_id",
    "posts.updated_at",
    "posts.status",
    "posts.slug",
    "posts.category",
    "activity_log.user_id",
  ];

  const missingCols = requiredCols.filter((col) => !existingCols.has(col));
  if (missingCols.length > 0) {
    const errMsg = `Critical database migration verification failure: Missing required column(s): ${missingCols.join(", ")}`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(errMsg);
    } else {
      console.error(`[initDb] ⚠️ ${errMsg}`);
    }
  }

  return true;
}

export async function initDb(customPool?: Pool): Promise<boolean> {
  const targetPool = customPool || getPool();

  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is not set in production environment");
    }
    throw new Error(
      "DATABASE_URL is not set. Please configure it in .env.local or run 'docker compose up -d' for local development."
    );
  }

  // 1. Connectivity test: MUST throw in production if database is unreachable
  let client;
  try {
    client = await targetPool.connect();
    await client.query("SELECT 1");
  } catch (connError) {
    const errorMsg = `Postgres unavailable in production environment: ${(connError as Error).message}`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMsg);
    }
    console.error("Database connection failed:", connError);
    throw connError;
  }

  try {
    // 2. Wrap migration in pg_advisory_lock so concurrent cold starts run one at a time
    await client.query("SELECT pg_advisory_lock($1)", [DB_MIGRATION_LOCK_KEY]);

    try {
      return await runMigrationsOnClient(client);
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [DB_MIGRATION_LOCK_KEY]).catch((unlockErr) => {
        console.warn("[initDb] Notice releasing advisory lock:", unlockErr);
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Postgres unavailable in production environment: ${(error as Error).message}`
      );
    }
    console.error("Database initialization failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Single-flight memoized DB readiness check
let dbReadyPromise: Promise<boolean> | null = null;

export function resetDbReadyPromise(): void {
  dbReadyPromise = null;
}

export function ensureDb(): Promise<boolean> {
  if (!dbReadyPromise) {
    dbReadyPromise = initDb().catch((err) => {
      dbReadyPromise = null;
      throw err;
    });
  }
  return dbReadyPromise;
}

function stripPassword(user: UserRecord): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function createUserRecord(name: string, email: string, password: string) {
  await ensureDb();
  const normalizedEmail = email.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 12);
  const role = "user" as const;

  const existing = await query("SELECT 1 FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
  if (existing.rowCount && existing.rowCount > 0) {
    return { success: false, duplicate: true } as const;
  }

  const result = await query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, username, phone, address, avatar_url, created_at`,
    [name, normalizedEmail, hashedPassword, role]
  );

  return { success: true, user: result.rows[0] as SafeUser } as const;
}

export async function updateUserPassword(userId: number, currentPassword: string, newPassword: string) {
  await ensureDb();

  const result = await query("SELECT * FROM users WHERE id = $1", [userId]);
  const user = result.rows[0] as UserRecord | undefined;
  if (!user) return { success: false, error: "User not found" } as const;

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) return { success: false, error: "Current password is incorrect" } as const;

  const hashedNew = await bcrypt.hash(newPassword, 12);
  await query("UPDATE users SET password = $1 WHERE id = $2", [hashedNew, userId]);

  return { success: true } as const;
}

export async function deleteUserAccount(userId: number) {
  await ensureDb();

  const result = await query("DELETE FROM users WHERE id = $1", [userId]);
  if (result.rowCount === 0) {
    return { success: false, error: "User not found" } as const;
  }

  return { success: true } as const;
}

export async function findUserByEmailAndPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  await ensureDb();

  const result = await query(
    "SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1",
    [normalizedEmail]
  );

  const user = result.rows[0] as UserRecord | undefined;
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return null;

  return stripPassword(user);
}

/**
 * Promotes an existing user to admin. Does not create accounts or print password hashes.
 */
export async function promoteUserToAdmin(email: string) {
  await ensureDb();
  const normalizedEmail = email.trim().toLowerCase();

  const result = await query("SELECT * FROM users WHERE LOWER(email) = $1", [normalizedEmail]);
  const user = result.rows[0] as UserRecord | undefined;
  if (!user) {
    return {
      success: false,
      error: `No registered user found with email "${email}". The user must create an account first.`,
    } as const;
  }

  if (user.role === "admin") {
    return {
      success: true,
      alreadyAdmin: true,
      user: stripPassword(user),
    } as const;
  }

  const updateResult = await query(
    `UPDATE users 
     SET role = 'admin' 
     WHERE id = $1 
     RETURNING id, name, email, role, username, phone, address, avatar_url, created_at`,
    [user.id]
  );

  const updatedUser = updateResult.rows[0] as SafeUser;

  await logActivity(
    "ADMIN_PROMOTED",
    `User ${updatedUser.email} was promoted to admin via CLI seed script`,
    updatedUser.id
  );

  return {
    success: true,
    alreadyAdmin: false,
    user: updatedUser,
  } as const;
}

/**
 * Fetches fresh authenticated user record directly from the database.
 * Single source of truth for authorization freshness and Phase 2 banned checks.
 */
export async function getAuthUserFresh(userId: number): Promise<SafeUser | null> {
  await ensureDb();

  const result = await query(
    "SELECT id, name, email, role, username, phone, address, avatar_url, created_at FROM users WHERE id = $1",
    [userId]
  );
  const user = (result.rows[0] as SafeUser | undefined) || null;
  if (!user) return null;

  // Single hook point for Phase 2: if (user.is_banned) return null;
  return user;
}

export async function findUserById(userId: number): Promise<SafeUser | null> {
  return getAuthUserFresh(userId);
}

export async function updateUserProfile(userId: number, name: string) {
  await ensureDb();

  const result = await query(
    "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role, username, phone, address, avatar_url, created_at",
    [name, userId]
  );

  if (result.rowCount === 0) {
    return { success: false, error: "User not found" } as const;
  }

  return { success: true, user: result.rows[0] as SafeUser } as const;
}

export async function updateUserContactInfo(
  userId: number,
  username: string,
  phone: string,
  address: string
) {
  await ensureDb();

  const result = await query(
    "UPDATE users SET username = $1, phone = $2, address = $3 WHERE id = $4 RETURNING id, name, email, role, username, phone, address, avatar_url, created_at",
    [username, phone, address, userId]
  );

  if (result.rowCount === 0) {
    return { success: false, error: "User not found" } as const;
  }

  return { success: true, user: result.rows[0] as SafeUser } as const;
}

export async function updateUserAvatar(userId: number, avatarUrl: string) {
  await ensureDb();

  const result = await query(
    "UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, role, username, phone, address, avatar_url, created_at",
    [avatarUrl, userId]
  );

  if (result.rowCount === 0) {
    return { success: false, error: "User not found" } as const;
  }

  return { success: true, user: result.rows[0] as SafeUser } as const;
}


export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  author_id: number | null;
  created_at: string;
  updated_at: string;
}

export async function getAllPosts() {
  await ensureDb();
  const result = await query("SELECT * FROM posts ORDER BY created_at DESC");
  return result.rows as Post[];
}

export async function getPublishedPosts() {
  await ensureDb();
  const result = await query(
    "SELECT * FROM posts WHERE status = 'PUBLISHED' ORDER BY created_at DESC"
  );
  return result.rows as Post[];
}

export async function getPostsForUser(authorId: number) {
  await ensureDb();
  const result = await query(
    "SELECT * FROM posts WHERE status = 'PUBLISHED' OR author_id = $1 ORDER BY created_at DESC",
    [authorId]
  );
  return result.rows as Post[];
}

export async function getPostById(id: number) {
  await ensureDb();
  const result = await query("SELECT * FROM posts WHERE id = $1", [id]);
  return (result.rows[0] as Post | undefined) || null;
}

export async function getPostBySlug(slug: string) {
  await ensureDb();
  const result = await query(
    "SELECT * FROM posts WHERE slug = $1 AND status = 'PUBLISHED'",
    [slug]
  );
  return (result.rows[0] as Post | undefined) || null;
}

export async function isSlugTaken(slug: string, excludeId?: number) {
  await ensureDb();
  if (excludeId) {
    const result = await query(
      "SELECT 1 FROM posts WHERE slug = $1 AND id != $2",
      [slug, excludeId]
    );
    return (result.rowCount ?? 0) > 0;
  }
  const result = await query("SELECT 1 FROM posts WHERE slug = $1", [slug]);
  return (result.rowCount ?? 0) > 0;
}

export async function createPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  authorId: number;
}) {
  await ensureDb();
  const result = await query(
    `INSERT INTO posts (title, slug, excerpt, content, featured_image, category, status, author_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.featuredImage || null,
      data.category,
      data.status,
      data.authorId,
    ]
  );
  return result.rows[0] as Post;
}

export async function updatePost(
  id: number,
  data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage?: string;
    category: string;
    status: "DRAFT" | "PUBLISHED";
  }
) {
  await ensureDb();
  const result = await query(
    `UPDATE posts
     SET title = $1, slug = $2, excerpt = $3, content = $4,
         featured_image = $5, category = $6, status = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING *`,
    [
      data.title,
      data.slug,
      data.excerpt,
      data.content,
      data.featuredImage || null,
      data.category,
      data.status,
      id,
    ]
  );
  return (result.rows[0] as Post | undefined) || null;
}

export async function deletePost(id: number) {
  await ensureDb();
  const result = await query("DELETE FROM posts WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

// --- Activity Log ---

export async function logActivity(
  action: string,
  description: string,
  userId: number | null
) {
  await ensureDb();
  const result = await query(
    `INSERT INTO activity_log (action, description, user_id)
     VALUES ($1, $2, $3)
     RETURNING id, action, description, user_id, created_at`,
    [action, description, userId]
  );
  return result.rows[0];
}

export async function getRecentActivity(limit: number = 10) {
  await ensureDb();
  const result = await query(
    `SELECT id, action, description, user_id, created_at
     FROM activity_log
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function getDashboardStats() {
  await ensureDb();
  const [usersResult, newUsersResult, postsResult, activityResult] =
    await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM users`),
      query(
        `SELECT COUNT(*)::int AS count FROM users
         WHERE created_at >= date_trunc('month', CURRENT_DATE)`
      ),
      query(`SELECT COUNT(*)::int AS count FROM posts`),
      query(`SELECT COUNT(*)::int AS count FROM activity_log`),
    ]);

  return {
    totalUsers: usersResult.rows[0].count,
    newUsers: newUsersResult.rows[0].count,
    totalPosts: postsResult.rows[0].count,
    totalActivity: activityResult.rows[0].count,
  };
}