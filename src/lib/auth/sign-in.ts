// Client-side email sign-in with a hard timeout and stable error mapping.
//
// Background: the vendor AuthView left users with a stuck submit button when
// the sign-in request never settled (e.g. a stalled middleware rate-limit DB
// query), and surfaced failures only through an auto-dismissing toast. This
// module owns the submit lifecycle: every attempt either succeeds or fails
// within SIGN_IN_TIMEOUT_MS, and failures map to a persistent, user-facing
// message (rendered by the form's error banner, never a toast alone).

export const SIGN_IN_TIMEOUT_MS = 15_000;

export type SignInErrorKind =
  | "invalid-credentials"
  | "rate-limited"
  | "timeout"
  | "network"
  | "unknown";

export class SignInError extends Error {
  readonly kind: SignInErrorKind;

  constructor(kind: SignInErrorKind, message: string) {
    super(message);
    this.name = "SignInError";
    this.kind = kind;
  }
}

const MESSAGES: Record<SignInErrorKind, string> = {
  "invalid-credentials": "Invalid email or password. Please try again.",
  "rate-limited": "Too many sign-in attempts. Please wait a few minutes and try again.",
  timeout: "The request timed out. Please check your connection and try again.",
  network: "Couldn't reach the server. Please check your connection and try again.",
  unknown: "Something went wrong signing you in. Please try again.",
};

/**
 * Map whatever the auth client threw into a stable SignInError.
 * Never includes PII — messages are fixed strings.
 */
export function mapSignInError(error: unknown): SignInError {
  if (error instanceof SignInError) return error;

  if (typeof error === "object" && error !== null) {
    const e = error as {
      status?: unknown;
      name?: unknown;
      message?: unknown;
      code?: unknown;
      error?: { code?: unknown };
    };
    const name = typeof e.name === "string" ? e.name : "";
    const message = typeof e.message === "string" ? e.message : "";
    const status = typeof e.status === "number" ? e.status : undefined;
    const code =
      typeof e.code === "string"
        ? e.code
        : typeof e.error?.code === "string"
          ? e.error.code
          : "";

    // AbortSignal.timeout() → DOMException "TimeoutError" (or "AbortError" for
    // a manual abort, or a wrapped equivalent from the fetch stack)
    if (name === "AbortError" || name === "TimeoutError" || /abort/i.test(message)) {
      return new SignInError("timeout", MESSAGES.timeout);
    }
    if (status === 401 || code === "INVALID_EMAIL_OR_PASSWORD") {
      return new SignInError("invalid-credentials", MESSAGES["invalid-credentials"]);
    }
    if (status === 429) {
      return new SignInError("rate-limited", MESSAGES["rate-limited"]);
    }
    // better-fetch surfaces network failures as TypeError ("Failed to fetch")
    if (error instanceof TypeError) {
      return new SignInError("network", MESSAGES.network);
    }
  }

  return new SignInError("unknown", MESSAGES.unknown);
}

/**
 * Build the callbackURL for a social (OAuth) sign-in.
 *
 * Must be absolute. Neon Auth runs on its own origin
 * (*.neonauth.<region>.aws.neon.tech), and better-auth's OAuth callback ends in
 * `redirect(callbackURL)` with the raw string — so a relative "/dashboard" is
 * resolved by the browser against the *auth* origin and lands on a page that
 * doesn't exist there, leaving the user stranded after picking their account.
 *
 * Routed through the vendor's own callback view rather than straight to the
 * destination, matching how AuthView builds every other social/magic-link
 * callback (`${baseURL}${basePath}/callback?redirectTo=…`), so the session is
 * persisted the same way before any protected route's middleware check.
 */
export function buildSocialCallbackURL(origin: string, redirectTo: string): string {
  return `${origin.replace(/\/$/, "")}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`;
}

interface EmailSignInClient {
  signIn: {
    email: (
      data: {
        email: string;
        password: string;
        rememberMe?: boolean;
        fetchOptions?: { throw?: boolean; signal?: AbortSignal };
      },
      options?: { signal?: AbortSignal },
    ) => Promise<unknown>;
  };
}

/**
 * Attempt email sign-in, rejecting with a SignInError if the request does not
 * settle within `timeoutMs`. The abort guarantees the caller's loading state
 * always recovers — the submit button can never stick in "loading" forever.
 *
 * Notes on the call shape (matches the vendor AuthView's proven pattern):
 * - `fetchOptions.throw: true` — the Neon client defaults to `throw: false`
 *   (returns `{ data, error }`); without `throw: true` HTTP errors would never
 *   reach the catch below.
 * - `fetchOptions.signal` — better-auth merges per-call fetch options into the
 *   underlying better-fetch call, which forwards `signal` to native fetch.
 */
export async function performEmailSignIn(
  client: EmailSignInClient,
  args: { email: string; password: string },
  opts?: { timeoutMs?: number },
): Promise<void> {
  const timeoutMs = opts?.timeoutMs ?? SIGN_IN_TIMEOUT_MS;
  try {
    await client.signIn.email({
      email: args.email,
      password: args.password,
      rememberMe: true,
      fetchOptions: {
        throw: true,
        signal: AbortSignal.timeout(timeoutMs),
      },
    });
  } catch (error) {
    throw mapSignInError(error);
  }
}
