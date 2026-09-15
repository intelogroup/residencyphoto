import { afterEach, describe, expect, it, vi } from "vitest";

const execute = vi.fn();

afterEach(() => {
  execute.mockClear();
});

vi.mock("server-only", () => ({}));
vi.mock("@/db", () => ({
  getDatabase: () => ({ execute }),
}));

const { checkAuthRateLimit, checkSupportRateLimit, getClientIp } = await import("./rate-limit");

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
