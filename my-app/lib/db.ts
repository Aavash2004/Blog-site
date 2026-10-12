import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function initDb(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is not set in production environment");
    }
    throw new Error(
      "DATABASE_URL is not set. Please configure it in .env.local or run 'docker compose up -d' for local development."
    );
  }

  try {
    await query("SELECT 1");

    // 1. Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
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
      );
    `);

    // Safe column migrations for existing users table
    await query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    `);

    // 2. Posts Table
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
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
      );
    `);

    // Safe column migrations for existing posts table
    await query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    `);

    // 3. Activity Log Table
    await query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
      CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
      CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
    `);

    return true;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Postgres unavailable in production environment: ${(error as Error).message}`
      );
    }
    console.error("Database initialization failed:", error);
    throw error;
  }
}

// Single-flight memoized DB readiness check
let dbReadyPromise: Promise<boolean> | null = null;

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