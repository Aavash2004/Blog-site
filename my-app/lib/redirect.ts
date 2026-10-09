/**
 * Validates and sanitizes internal redirect URLs to prevent open-redirect vulnerabilities.
 * 
 * Rules:
 * - Must start with a single "/"
 * - Must NOT start with "//" or "/\" (protocol-relative attempts)
 * - Must NOT contain a URL scheme/protocol (e.g., http:, https:, javascript:)
 * - Falls back to default if invalid
 */
export function sanitizeRedirect(url: string | null | undefined, fallback = "/dashboard"): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();

  // Must begin with a single slash, not followed by / or \
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // Must not contain schemes like http:, https:, javascript:, data:, etc.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  // Ensure it can be parsed as a safe relative pathname without changing host
  try {
    const dummyOrigin = "http://localhost.localdomain";
    const parsed = new URL(trimmed, dummyOrigin);
    if (parsed.origin !== dummyOrigin) {
      return fallback;
    }
    // Return relative path + search + hash
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
