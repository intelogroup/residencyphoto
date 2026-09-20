"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { reportAuthEvent } from "@/lib/auth-telemetry";

/**
 * Custom OAuth callback handler replacing the vendor AuthView for
 * /auth/callback.
 *
 * Neon's Managed Better Auth redirects here (or to the callbackURL) with a
 * one-time `neon_auth_session_verifier` query param after OAuth. The
 * auth client's getSession() picks it up from window.location, attaches it
 * to the /api/auth/get-session request, and the proxy exchanges it for the
 * app-domain session cookie. On success we go to /dashboard; on failure or
 * timeout we show an explicit error instead of spinning forever.
 */
const VERIFIER_PARAM = "neon_auth_session_verifier";
const TIMEOUT_MS = 15000;

export function OAuthCallbackHandler() {
  const [status, setStatus] = useState<"working" | "error">("working");
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const startedAt = Date.now();
    // Telemetry: event name + outcome + duration only. Never send the
    // verifier, codes, emails, or any callback param values.
    reportAuthEvent("oauth_callback_started", { status: "success" });

    const timer = setTimeout(() => {
      reportAuthEvent("oauth_callback_timeout", { status: "error", durationMs: Date.now() - startedAt });
      setStatus("error");
    }, TIMEOUT_MS);

    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (!params.has(VERIFIER_PARAM)) {
          // No verifier: nothing to exchange (stale link, direct visit, or
          // the backend didn't honor the callbackURL). Don't spin forever.
          clearTimeout(timer);
          reportAuthEvent("oauth_callback_timeout", { status: "error", durationMs: Date.now() - startedAt });
          setStatus("error");
          return;
        }
        const { data, error } = await authClient.getSession();
        clearTimeout(timer);
        if (error || !data?.session) {
          reportAuthEvent("oauth_callback_timeout", { status: "error", durationMs: Date.now() - startedAt });
          setStatus("error");
          return;
        }
        // Full navigation so middleware sees the fresh session cookie.
        window.location.href = "/dashboard";
      } catch {
        clearTimeout(timer);
        reportAuthEvent("oauth_callback_timeout", { status: "error", durationMs: Date.now() - startedAt });
        setStatus("error");
      }
    })();

    return () => clearTimeout(timer);
  }, []);

  if (status === "error") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-xl text-center">
        <h1 className="font-semibold text-lg text-heading">Sign-in didn&apos;t complete</h1>
        <p className="mt-2 text-sm text-muted">
          Google approved the sign-in, but we couldn&apos;t finish it on our end. Please try again.
        </p>
        <Link href="/auth/sign-in" className="btn-primary w-full mt-6 inline-block">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-xl text-center">
      <div
        aria-hidden="true"
        className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
      />
      <p className="mt-4 text-sm text-muted">Finishing Google sign-in…</p>
    </div>
  );
}
