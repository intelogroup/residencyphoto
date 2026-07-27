import { describe, expect, it } from "vitest";
import { getNeonAuthConfig } from "./auth-config";

describe("Neon Auth configuration", () => {
  it("returns the server URL and signing secret", () => {
    expect(
      getNeonAuthConfig({
        NEON_AUTH_BASE_URL: "https://example.neonauth.aws.neon.tech/neondb/auth",
        NEON_AUTH_COOKIE_SECRET: "a".repeat(32),
      }),
    ).toEqual({
      baseUrl: "https://example.neonauth.aws.neon.tech/neondb/auth",
      cookies: { secret: "a".repeat(32) },
    });
  });

  it("fails fast when the auth URL is missing", () => {
    expect(() =>
      getNeonAuthConfig({ NEON_AUTH_COOKIE_SECRET: "a".repeat(32) }),
    ).toThrow("NEON_AUTH_BASE_URL");
  });

  it("rejects cookie secrets shorter than 32 characters", () => {
    expect(() =>
      getNeonAuthConfig({
        NEON_AUTH_BASE_URL: "https://example.neonauth.aws.neon.tech/neondb/auth",
        NEON_AUTH_COOKIE_SECRET: "too-short",
      }),
    ).toThrow("at least 32 characters");
  });
});
