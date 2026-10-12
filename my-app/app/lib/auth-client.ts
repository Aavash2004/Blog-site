export interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  username?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  avatar_url?: string | null;
}

let cachedUser: StoredUser | null = null;
let fetchPromise: Promise<StoredUser | null> | null = null;

/**
 * Fetches the currently authenticated user from `/api/me`.
 * Uses HTTP-only cookie authentication automatically sent by the browser.
 */
export async function fetchCurrentUser(forceRefresh = false): Promise<StoredUser | null> {
  if (typeof window === "undefined") return null;

  if (cachedUser && !forceRefresh) {
    return cachedUser;
  }

  if (fetchPromise && !forceRefresh) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        cachedUser = null;
        return null;
      }

      const data = await res.json();
      if (data.success && data.user) {
        cachedUser = data.user as StoredUser;
        return cachedUser;
      }

      cachedUser = null;
      return null;
    } catch {
      cachedUser = null;
      return null;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function getCurrentUser(): StoredUser | null {
  return cachedUser;
}

export function setCurrentUser(user: StoredUser | null): void {
  cachedUser = user;
}

export async function logout(): Promise<void> {
  cachedUser = null;
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Best-effort logout request
  }
}

// ==========================================
// Compatibility adapters for existing views
// ==========================================

export function getUser(): StoredUser | null {
  return cachedUser;
}

export function setUser(user: StoredUser | null): void {
  cachedUser = user;
}

export function clearUser(): void {
  cachedUser = null;
}

export function getToken(): string | null {
  // Authentication token is stored in an HTTP-only cookie.
  // Not accessible from JavaScript (XSS protected).
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setToken(_token?: string): void {
  // No-op: auth cookies are set directly by the server in Set-Cookie response header
}

export function clearToken(): void {
  // Handled by calling logout()
}