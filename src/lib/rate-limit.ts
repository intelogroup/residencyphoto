import "server-only";

import { sql } from "drizzle-orm";
import { getDatabase } from "@/db";

// Fixed-window counter backed by Postgres (Neon HTTP driver, so this is edge-safe).
// The upsert is a single atomic statement: Postgres serializes concurrent writers
// on the same key via the unique-index conflict, so no separate read-then-write
// race is possible even under concurrent requests for the same identifier.
async function checkRateLimit(prefix: string, identifier: string, limit: number, windowSeconds: number) {
  const key = `${prefix}:${identifier}`;
  const db = getDatabase();

  const result = await db.execute<{ count: number }>(sql`
    INSERT INTO rate_limits (key, window_start, count)
    VALUES (${key}, now(), 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_start < now() - (${windowSeconds} * interval '1 second')
        THEN 1
        ELSE rate_limits.count + 1
      END,
      window_start = CASE
        WHEN rate_limits.window_start < now() - (${windowSeconds} * interval '1 second')
        THEN now()
        ELSE rate_limits.window_start
      END
    RETURNING count
  `);

  const count = Number(result.rows[0]?.count ?? 1);
  return { success: count <= limit };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function checkCheckoutRateLimit(key: string) {
  return checkRateLimit("ratelimit:checkout", key, 10, 600);
}

export async function checkDownloadRateLimit(key: string) {
  return checkRateLimit("ratelimit:download", key, 20, 600);
}

export async function checkAuthRateLimit(key: string) {
  return checkRateLimit("ratelimit:auth", key, 10, 600);
}

export async function checkSupportRateLimit(key: string) {
  return checkRateLimit("ratelimit:support", key, 5, 600);
}

export async function checkNewsletterRateLimit(key: string) {
  return checkRateLimit("ratelimit:newsletter", key, 10, 600);
}
