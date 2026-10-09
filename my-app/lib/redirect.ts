/**
 * Validates and sanitizes internal redirect URLs to prevent open-redirect vulnerabilities.
 * 
 * Security Rules:
 * - Must start with a single "/"
 * - Must NOT start with "//" or "/\" (protocol-relative attempts)
 * - Must NOT contain any backslash ('\') anywhere in the URL (browsers normalize '\' to '/')
 * - Must NOT contain any ASCII control characters (\t, \n, \r, chars < 0x20)
 * - Must NOT contain percent-encoded control characters or backslashes (%00-%1F, %5C, %7F)
 * - Must NOT start with percent-encoded double slash (%2f%2f or /%2f)
 * - Must NOT contain URL schemes (e.g. http:, https:, javascript:, data:)
 * - Must remain on the local origin when parsed
 * - Falls back to safe default if invalid
 * 
 * Test examples:
 * - sanitizeRedirect("/dashboard") === "/dashboard" (ok)
 * - sanitizeRedirect("//evil.com") === "/dashboard" (rejected)
 * - sanitizeRedirect("/\\evil.com") === "/dashboard" (rejected)
 * - sanitizeRedirect("/\t/evil.com") === "/dashboard" (rejected)
 * - sanitizeRedirect("https://evil.com") === "/dashboard" (rejected)
 * - sanitizeRedirect("javascript:alert(1)") === "/dashboard" (rejected)
 * - sanitizeRedirect("/%09/evil.com") === "/dashboard" (rejected)
 * - sanitizeRedirect("/%5c/evil.com") === "/dashboard" (rejected)
 * - sanitizeRedirect("%2f%2fevil.com") === "/dashboard" (rejected)
 */
export function sanitizeRedirect(url: string | null | undefined, fallback = "/dashboard"): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();

  // Reject empty or non-relative starts
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  // Reject any backslash anywhere (browsers often normalize '\' to '/')
  if (trimmed.includes("\\")) {
    return fallback;
  }

  // Reject ASCII control characters (\t, \n, \r, chars < 0x20, and DEL 0x7F)
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return fallback;
  }

  // Reject percent-encoded control chars (%00-%1F), percent-encoded backslash (%5C), DEL (%7F)
  if (/%(?:0[0-9a-fA-F]|1[0-9a-fA-F]|5[cC]|7[fF])/.test(trimmed)) {
    return fallback;
  }

  // Reject percent-encoded double slash attempts at the start (e.g. /%2f or %2f%2f)
  if (/^(\/|%2[fF])(\/|%2[fF])/.test(trimmed) || /^\/%2[fF]/.test(trimmed)) {
    return fallback;
  }

  // Reject explicit protocols/schemes (e.g. http:, https:, javascript:, data:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  // Ensure parsing as a relative URL against a dummy origin stays strictly relative
  try {
    const dummyOrigin = "http://localhost.localdomain";
    const parsed = new URL(trimmed, dummyOrigin);
    if (parsed.origin !== dummyOrigin) {
      return fallback;
    }

    // Must still start with a single slash and not double slash
    if (!parsed.pathname.startsWith("/") || parsed.pathname.startsWith("//")) {
      return fallback;
    }

    // Ensure pathname doesn't have normalized backslashes
    if (parsed.pathname.includes("\\")) {
      return fallback;
    }

    // Return safe relative path + search + hash
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
