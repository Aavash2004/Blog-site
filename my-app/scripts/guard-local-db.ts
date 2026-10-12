/**
 * Guard utility for destructive database scripts.
 * Refuses execution if DATABASE_URL does not point to a local development database.
 */
export function assertLocalDatabase(
  urlStr?: string,
  options?: { requireTestDb?: boolean }
): { host: string; dbname: string } {
  if (!urlStr) {
    console.error("❌ DATABASE_URL is not configured.");
    process.exit(1);
  }

  let host = "";
  let dbname = "";
  try {
    const parsed = new URL(urlStr);
    host = parsed.hostname;
    dbname = parsed.pathname.replace(/^\//, "");
  } catch {
    const hostMatch = urlStr.match(/@([^:/]+)/);
    host = hostMatch ? hostMatch[1] : "";
    const dbMatch = urlStr.match(/\/([^/?]+)(\?|$)/);
    dbname = dbMatch ? dbMatch[1] : "";
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

  if (options?.requireTestDb && !dbname.endsWith("_test")) {
    console.error(
      `Refusing to run: simulation must target a test database ending in _test (got "${dbname}")`
    );
    process.exit(1);
  }

  console.log(`Target database: ${host}/${dbname}`);
  return { host, dbname };
}

