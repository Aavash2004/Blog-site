/**
 * Guard utility for destructive database scripts.
 * Refuses execution if DATABASE_URL does not point to a local development database.
 */
export function assertLocalDatabase(urlStr?: string): string {
  if (!urlStr) {
    console.error("❌ DATABASE_URL is not configured.");
    process.exit(1);
  }

  let host = "";
  try {
    const parsed = new URL(urlStr);
    host = parsed.hostname;
  } catch {
    const match = urlStr.match(/@([^:/]+)/);
    host = match ? match[1] : "";
  }

  const allowedHosts = new Set([
    "localhost",
    "127.0.0.1",
    "db",
    "postgres",
    "host.docker.internal",
  ]);

  if (!allowedHosts.has(host.toLowerCase())) {
    console.error("Refusing to run: DATABASE_URL is not a local database");
    process.exit(1);
  }

  console.log(`Target database host: ${host}`);
  return host;
}
