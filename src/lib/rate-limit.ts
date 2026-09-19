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

// How long the middleware waits for the rate-limit DB query before giving up.
// A stalled query must never hang an auth request: the client-side sign-in has
// its own 15s timeout, but a hung middleware leaves the request with no
// response at all, so we bound it much tighter here.
export const RATE_LIMIT_CHECK_TIMEOUT_MS = 3000;

function logRateLimitCheckFailure(reason: "timeout" | "error") {
  // Edge-safe structured log (pino is node-only; middleware runs on the edge).
  // Deliberately no PII: never log the identifier (IP) or anything user-shaped.
  console.warn(
    JSON.stringify({
      event: "auth_rate_limit_check_failed",
      reason,
      failOpen: true,
    }),
  );
}

/**
 * Fail-open wrapper around the auth rate limiter for use in middleware.
 *
 * If the Postgres query stalls (> RATE_LIMIT_CHECK_TIMEOUT_MS) or throws, the
 * request is allowed through and the failure is logged. A broken/stalled
 * limiter must degrade to "allow" — never to a hung sign-in with zero
 * feedback, which is what users hit on 2026-09-19.
 */
export async function checkAuthRateLimitSafe(
  identifier: string,
  timeoutMs: number = RATE_LIMIT_CHECK_TIMEOUT_MS,
): Promise<{ success: boolean }> {
  const pending = checkAuthRateLimit(identifier);
  // If the timeout wins the race, the still-pending DB query must not surface
  // as an unhandled rejection when it eventually settles.
  pending.catch(() => {});
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      pending,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
    if (result === null) {
      logRateLimitCheckFailure("timeout");
      return { success: true };
    }
    return { success: result.success };
  } catch {
    logRateLimitCheckFailure("error");
    return { success: true };
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
