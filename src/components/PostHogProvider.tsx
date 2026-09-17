"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHPostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

let initialized = false;

/**
 * PostHog analytics provider.
 *
 * Events are sent through the same-origin /ingest reverse proxy (see
 * rewrites() in next.config.ts) so ad blockers don't strip analytics and
 * the existing Content-Security-Policy needs no extra connect-src entry.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
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

  return <PHPostHogProvider client={posthog}>{children}</PHPostHogProvider>;
}
