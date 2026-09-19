import { describe, expect, it, vi } from "vitest";

import {
  mapSignInError,
  performEmailSignIn,
  SIGN_IN_TIMEOUT_MS,
  SignInError,
} from "./sign-in";

type EmailSignInData = {
  email: string;
  password: string;
  rememberMe?: boolean;
  fetchOptions?: { throw?: boolean; signal?: AbortSignal };
};

function mockClient(
  impl: (data: EmailSignInData, options?: { signal?: AbortSignal }) => Promise<unknown>,
) {
  return { signIn: { email: vi.fn(impl) } };
}

describe("mapSignInError", () => {
  it("maps a 401 to invalid-credentials", () => {
    const err = mapSignInError(
      Object.assign(new Error("Unauthorized"), {
        status: 401,
        error: { code: "INVALID_EMAIL_OR_PASSWORD" },
      }),
    );
    expect(err).toBeInstanceOf(SignInError);
    expect(err.kind).toBe("invalid-credentials");
    expect(err.message).toMatch(/invalid email or password/i);
  });

  it("maps a 429 to rate-limited", () => {
    const err = mapSignInError(Object.assign(new Error("Too many"), { status: 429 }));
    expect(err.kind).toBe("rate-limited");
    expect(err.message).toMatch(/too many/i);
  });

  it("maps an AbortError to timeout", () => {
    const err = mapSignInError(new DOMException("The operation was aborted.", "AbortError"));
    expect(err.kind).toBe("timeout");
    expect(err.message).toMatch(/timed out/i);
  });

  it("maps an AbortSignal.timeout() TimeoutError to timeout", () => {
    // This is the real shape: AbortSignal.timeout() rejects with name "TimeoutError".
    const err = mapSignInError(
      new DOMException("The operation was aborted due to timeout", "TimeoutError"),
    );
    expect(err.kind).toBe("timeout");
    expect(err.message).toMatch(/timed out/i);
  });

  it("maps a network TypeError to network", () => {
    const err = mapSignInError(new TypeError("Failed to fetch"));
    expect(err.kind).toBe("network");
    expect(err.message).toMatch(/couldn't reach the server/i);
  });

  it("maps anything else to unknown without leaking details", () => {
    const err = mapSignInError(new Error("weird backend explosion: user@example.com"));
    expect(err.kind).toBe("unknown");
    expect(err.message).not.toContain("user@example.com");
  });
});

describe("performEmailSignIn", () => {
  it("resolves on success and passes rememberMe + throw", async () => {
    const client = mockClient(async () => ({}));
    await performEmailSignIn(client, { email: "a@b.c", password: "x" });
    expect(client.signIn.email).toHaveBeenCalledOnce();
    const [data] = client.signIn.email.mock.calls[0];
    expect(data).toMatchObject({
      email: "a@b.c",
      password: "x",
      rememberMe: true,
      fetchOptions: { throw: true },
    });
    expect(data.fetchOptions!.signal).toBeInstanceOf(AbortSignal);
  });

  it("throws invalid-credentials on 401", async () => {
    const client = mockClient(async () => {
      throw Object.assign(new Error("Unauthorized"), { status: 401 });
    });
    await expect(
      performEmailSignIn(client, { email: "a@b.c", password: "wrong" }),
    ).rejects.toMatchObject({
      kind: "invalid-credentials",
    });
  });

  it("throws rate-limited on 429", async () => {
    const client = mockClient(async () => {
      throw Object.assign(new Error("Too many"), { status: 429 });
    });
    await expect(performEmailSignIn(client, { email: "a@b.c", password: "x" })).rejects.toMatchObject({
      kind: "rate-limited",
    });
  });

  it("aborts a hung request at the timeout so the UI can recover", async () => {
    // Never settles on its own; rejects when the passed signal aborts.
    const client = mockClient(
      (data) =>
        new Promise((_resolve, reject) => {
          const signal = data.fetchOptions!.signal!;
          signal.addEventListener("abort", () => reject(signal.reason));
        }),
    );
    const start = Date.now();
    await expect(
      performEmailSignIn(client, { email: "a@b.c", password: "x" }, { timeoutMs: 100 }),
    ).rejects.toMatchObject({ kind: "timeout" });
    // Must not wait anywhere near the default 15s.
    expect(Date.now() - start).toBeLessThan(SIGN_IN_TIMEOUT_MS);
  });
});
