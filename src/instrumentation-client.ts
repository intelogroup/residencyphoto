// Client-side Sentry initialization.
// Next.js loads this file in the browser (replaces the webpack-era
// sentry.client.config.ts, which Turbopack builds ignore).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Trace 100% of transactions in production; lower this in high-traffic apps.
  tracesSampleRate: 1.0,

  // Session replay is handled by PostHog; keep Sentry lean.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
