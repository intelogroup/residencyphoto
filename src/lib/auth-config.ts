export function getNeonAuthConfig(env: Record<string, string | undefined>) {
  const baseUrl = env.NEON_AUTH_BASE_URL?.trim();
  const secret = env.NEON_AUTH_COOKIE_SECRET?.trim();

  if (!baseUrl) throw new Error("NEON_AUTH_BASE_URL is required");
  if (!secret || secret.length < 32) {
    throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters");
  }

  return {
    baseUrl,
    cookies: { secret },
  };
}
