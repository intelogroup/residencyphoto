import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      __kind: "json" as const,
      body,
      status: init?.status ?? 200,
    }),
    next: () => ({ __kind: "next" as const }),
  },
}));

const checkAuthRateLimitSafe = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "9.9.9.9",
  checkAuthRateLimitSafe,
}));

vi.mock("@/lib/auth/server", () => ({
  auth: { middleware: () => () => ({ __kind: "protected" as const }) },
}));

const { default: middleware } = await import("./proxy");

function req(pathname: string) {
  return { nextUrl: { pathname } } as never;
}

describe("auth middleware rate limiting", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 when the limiter blocks a credential endpoint", async () => {
    checkAuthRateLimitSafe.mockResolvedValue({ success: false });

    const res = (await middleware(req("/api/auth/sign-in/email"))) as unknown as {
      __kind: string;
      status: number;
    };

    expect(checkAuthRateLimitSafe).toHaveBeenCalledOnce();
    expect(res.__kind).toBe("json");
    expect(res.status).toBe(429);
  });

  it("fails open (lets the request through) when the limiter check fails", async () => {
    // Fail-open: success true even though the DB query stalled/threw.
    checkAuthRateLimitSafe.mockResolvedValue({ success: true });

    const res = (await middleware(req("/api/auth/sign-in/email"))) as unknown as { __kind: string };

    expect(res.__kind).toBe("next");
  });

  it("does not rate-limit non-credential auth endpoints", async () => {
    const res = (await middleware(req("/api/auth/get-session"))) as unknown as { __kind: string };

    expect(checkAuthRateLimitSafe).not.toHaveBeenCalled();
    expect(res.__kind).toBe("next");
  });

  it("rate-limits the other credential endpoints", async () => {
    checkAuthRateLimitSafe.mockResolvedValue({ success: true });

    for (const path of [
      "/api/auth/sign-up/email",
      "/api/auth/request-password-reset",
      "/api/auth/reset-password",
    ]) {
      await middleware(req(path));
    }

    expect(checkAuthRateLimitSafe).toHaveBeenCalledTimes(3);
  });
});
