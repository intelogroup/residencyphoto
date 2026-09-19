import { afterEach, describe, expect, it, vi } from "vitest";

const execute = vi.fn();

afterEach(() => {
  execute.mockClear();
});

vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({
  getDatabase: () => ({ execute }),
}));

const { checkAuthRateLimit, checkSupportRateLimit, checkAuthRateLimitSafe, getClientIp } = await import("./rate-limit");

describe("rate limiting", () => {
  it("allows the request while the returned count is within the limit", async () => {
    execute.mockResolvedValueOnce({ rows: [{ count: 3 }] });

    const result = await checkAuthRateLimit("1.2.3.4");

    expect(result.success).toBe(true);
  });

  it("blocks the request once the returned count exceeds the limit", async () => {
    execute.mockResolvedValueOnce({ rows: [{ count: 11 }] });

    const result = await checkAuthRateLimit("1.2.3.4");

    expect(result.success).toBe(false);
  });

  it("scopes different limiters to different keys so one doesn't starve another", async () => {
    execute.mockResolvedValueOnce({ rows: [{ count: 5 }] });
    await checkSupportRateLimit("user-1");

    const [query] = execute.mock.calls[0];
    expect(JSON.stringify(query.queryChunks)).toContain("ratelimit:support:user-1");
  });

  it("extracts the first IP from a forwarded chain", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" },
    });

    expect(getClientIp(request)).toBe("9.9.9.9");
  });
});

describe("checkAuthRateLimitSafe (fail-open)", () => {
  it("still blocks when the limiter says no on the fast path", async () => {
    execute.mockResolvedValueOnce({ rows: [{ count: 11 }] });

    const result = await checkAuthRateLimitSafe("1.2.3.4", 1000);

    expect(result.success).toBe(false);
  });

  it("fails open when the DB query stalls past the timeout", async () => {
    execute.mockImplementationOnce(() => new Promise(() => {}));

    const result = await checkAuthRateLimitSafe("1.2.3.4", 50);

    // Allowed through: a stalled limiter must never hang the request.
    expect(result.success).toBe(true);
  }, 5000);

  it("fails open when the DB query throws", async () => {
    execute.mockRejectedValueOnce(new Error("connection terminated"));

    const result = await checkAuthRateLimitSafe("1.2.3.4", 1000);

    expect(result.success).toBe(true);
  });

  it("does not log any PII when failing open", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    execute.mockImplementationOnce(() => new Promise(() => {}));

    await checkAuthRateLimitSafe("9.9.9.9", 50);

    expect(warn).toHaveBeenCalledOnce();
    const logged = String(warn.mock.calls[0][0]);
    expect(logged).not.toContain("9.9.9.9");
    warn.mockRestore();
  }, 5000);
});
