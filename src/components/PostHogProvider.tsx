"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHPostHogProvider } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth/client";

let initialized = false;

/** Only attribute a sign_up to the current session when the account is this fresh. */
const SIGNUP_RECENCY_MS = 10 * 60 * 1000;
const signupTrackedKey = (userId: string) => `ph_signup_tracked_${userId}`;

/**
 * PostHog analytics provider.
 *
 * Events are sent through the same-origin /ingest reverse proxy (see
 * rewrites() in next.config.ts) so ad blockers don't strip analytics and
 * the existing Content-Security-Policy needs no extra connect-src entry.
 *
 * Also owns identity: once the Neon Auth session resolves, the user is
 * identified by their auth id so client-side events (ad-click pageviews)
 * merge with server-side events (purchase webhook). A `sign_up` event is
 * captured once for freshly created accounts.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || initialized) return;
    initialized = true;

    posthog.init(key, {
      api_host: "/ingest",
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }, []);

  useEffect(() => {
    if (!initialized || session.isPending) return;

    const user = session.data?.user as
      | { id: string; email: string; createdAt?: Date | string | null }
      | undefined;

    if (!user) {
      // Only reset when transitioning from an identified user to logged-out,
      // so anonymous browsing keeps a stable distinct_id.
      if (identifiedUserId.current) {
        posthog.reset();
        identifiedUserId.current = null;
      }
      return;
    }

    if (identifiedUserId.current === user.id) return;
    identifiedUserId.current = user.id;
    posthog.identify(user.id, { email: user.email });

    const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : NaN;
    if (
      Number.isFinite(createdAt) &&
      Date.now() - createdAt < SIGNUP_RECENCY_MS &&
      typeof localStorage !== "undefined" &&
      !localStorage.getItem(signupTrackedKey(user.id))
    ) {
      localStorage.setItem(signupTrackedKey(user.id), "1");
      posthog.capture("sign_up", { method: "email" });
    }
  }, [session.isPending, session.data?.user]);

  return <PHPostHogProvider client={posthog}>{children}</PHPostHogProvider>;
}
