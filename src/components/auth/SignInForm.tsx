"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { useToast } from "@/components/Toast";
import { performEmailSignIn, SignInError, validateSignInFields, type SignInFieldErrors } from "@/lib/auth/sign-in";

/**
 * Custom sign-in form replacing the vendor AuthView for /auth/sign-in.
 *
 * Owns the full submit lifecycle:
 * - single controlled source of truth for email/password (no RHF/DOM drift),
 * - 15s client timeout so the button always recovers,
 * - failures render a persistent, non-dismissing error banner (plus a
 *   supplemental toast), never a toast alone,
 * - the typed password is kept on failure so the user can retry or edit it.
 */
export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({});
  const { showToast } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    // Inline validation first: the form is `noValidate` because the browser's
    // native validation bubble often never renders in in-app webviews, which
    // made the submit button look dead on empty/malformed emails.
    const validation = validateSignInFields({ email, password });
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setError(null);
    setIsLoading(true);
    try {
      await performEmailSignIn(authClient, { email: email.trim(), password });
      // Full navigation: guarantees the fresh session cookie is picked up by
      // middleware before hitting the protected /dashboard routes.
      window.location.href = "/dashboard";
    } catch (err) {
      const message =
        err instanceof SignInError
          ? err.message
          : "Something went wrong signing you in. Please try again.";
      setError(message);
      showToast(message, "error");
      // NOTE: password is intentionally NOT cleared — clearing punishes the
      // user for a typo and caused the stale "Password is required" state.
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      // Relative callbackURL: Neon's Managed Better Auth appends a one-time
      // `neon_auth_session_verifier` to the callbackURL after OAuth, and the
      // client exchanges it for the session via /api/auth. An absolute URL
      // here is not honored by the managed backend (users land on
      // /auth/callback with no verifier and no session), while the relative
      // form matches Neon's documented pattern.
      // errorCallbackURL/newUserCallbackURL: match the vendor AuthView's
      // full parameter set. Without an explicit error callback, a failed
      // account lookup for an existing user silently drops back to the
      // sign-in page with no session.
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/auth/sign-in",
        newUserCallbackURL: "/dashboard",
      });
    } catch {
      const message = "Couldn't start Google sign-in. Please try again.";
      setError(message);
      showToast(message, "error");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-xl">
      <h1 className="font-semibold text-lg md:text-xl text-heading">Sign In</h1>
      <p className="mt-1.5 text-sm text-muted">Enter your email below to login to your account</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-error"
          >
            <span aria-hidden="true" className="mt-0.5 font-bold">
              !
            </span>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="signin-email" className="form-label">
            Email
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
              if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            className="form-input mt-1.5"
            placeholder="you@example.com"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "signin-email-error" : undefined}
          />
          {fieldErrors.email && (
            <p id="signin-email-error" role="alert" className="mt-1 text-xs text-error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="signin-password" className="form-label">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-primary hover:text-primary-dark"
            >
              Forgot your password?
            </Link>
          </div>
          <input
            id="signin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
              if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
            }}
            className="form-input mt-1.5"
            placeholder="••••••••"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "signin-password-error" : undefined}
          />
          {fieldErrors.password && (
            <p id="signin-password-error" role="alert" className="mt-1 text-xs text-error">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        Or continue with
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <button type="button" className="btn-ghost w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
        <svg aria-hidden="true" className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign in with Google
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="font-semibold text-primary hover:text-primary-dark">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
