"use client";

import { AuthView } from "@neondatabase/auth-ui";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { captureException, trackEvent } from "@/lib/analytics-client";

/**
 * Recovery wrapper for the vendor AuthView on the non-sign-in/callback auth
 * views (sign-up, verify-email, forgot-password, …). Sign-in and callback
 * have their own purpose-built components; every other view gets a bounded
 * wait for the Neon session plus a friendly banner for Neon's ?error=
 * params, instead of a dead form.
 *
 * Past the timeout the form is effectively dead, so we swap it for a
 * visible recovery state instead of leaving the user staring at it.
 */
const CALLBACK_TIMEOUT_MS = 15_000;

const FRIENDLY_ERRORS: Record<string, string> = {
  access_denied: "Sign-in was cancelled before it finished. Please try again.",
  oauth_callback_failed: "We couldn't finish signing you in with Google. Please try again.",
  session_expired: "Your sign-in session expired. Please try again.",
};

/** Never render raw OAuth params back to the page — they can carry tokens. */
function friendlyErrorMessage(error: string | null): string | null {
  if (!error) return null;
  return (
    FRIENDLY_ERRORS[error] ??
    "Something went wrong during sign-in. Please try again."
  );
}

export function AuthPageClient({ path }: { path: string }) {
  return (
    <Suspense fallback={null}>
      <AuthViewWithRecovery path={path} />
    </Suspense>
  );
}

function AuthViewWithRecovery({ path }: { path: string }) {
  const searchParams = useSearchParams();
  const session = authClient.useSession();
  const [recoveryVisible, setRecoveryVisible] = useState(false);
  const errorReportedRef = useRef(false);
  const timeoutFiredRef = useRef(false);

  const errorParam = searchParams.get("error");
  const bannerMessage = friendlyErrorMessage(errorParam);

  // Surface Neon's ?error= params as a visible banner and report them with
  // sanitized context — once per param set.
  useEffect(() => {
    if (!errorParam || errorReportedRef.current) return;
    errorReportedRef.current = true;
    captureException(new Error(`auth_error_param: ${errorParam}`), {
      route: window.location.pathname,
      action: "auth_error_param",
    });
  }, [errorParam]);

  // Bounded callback timeout: if the session is still pending after 15s,
  // the callback is stuck — show recovery instead of a dead form.
  useEffect(() => {
    if (!session.isPending) return;
    const timer = window.setTimeout(() => {
      if (timeoutFiredRef.current) return;
      timeoutFiredRef.current = true;
      setRecoveryVisible(true);
      captureException(new Error("auth_callback_timeout"), {
        route: window.location.pathname,
        action: "auth_callback_timeout",
      });
      trackEvent("auth_recovery_shown", { action: "auth_recovery_shown" });
    }, CALLBACK_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [session.isPending]);

  const handleTryAgain = () => {
    trackEvent("auth_try_again_clicked", { action: "auth_try_again_clicked" });
    // Drop any stale OAuth ?code= / ?state= / ?error= params and start clean.
    window.location.assign(window.location.pathname);
  };

  // Once the session actually resolves to a user, AuthView's redirectTo takes
  // over — never show recovery on top of a live session.
  const showRecovery = recoveryVisible && !session.data?.user;

  if (showRecovery) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-primary"
        />
        <h1 className="text-lg font-semibold text-heading">Still signing you in…</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          This is taking longer than expected. Your sign-in may be stuck — try again and it
          usually goes through on the second attempt.
        </p>
        <button
          type="button"
          onClick={handleTryAgain}
          className="btn-primary mt-6 w-full px-4 py-3 text-sm"
        >
          Try again
        </button>
        <a
          href="/"
          className="mt-3 inline-block text-sm font-medium text-muted underline-offset-4 hover:text-heading hover:underline"
        >
          Back to home
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {bannerMessage && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
        >
          {bannerMessage}
        </p>
      )}
      <AuthView path={path} redirectTo="/dashboard" />
    </div>
  );
}
