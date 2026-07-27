import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// ponytail: one shared limiter config per call site, not per-route tuning
const checkoutLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 m"),
  prefix: "ratelimit:checkout",
});

const downloadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 m"),
  prefix: "ratelimit:download",
});

const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 m"),
  prefix: "ratelimit:auth",
});

const supportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:support",
});

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function checkCheckoutRateLimit(key: string) {
  return checkoutLimiter.limit(key);
}

export async function checkDownloadRateLimit(key: string) {
  return downloadLimiter.limit(key);
}

export async function checkAuthRateLimit(key: string) {
  return authLimiter.limit(key);
}

export async function checkSupportRateLimit(key: string) {
  return supportLimiter.limit(key);
}
