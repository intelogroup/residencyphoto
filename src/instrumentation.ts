// Registers Sentry for the Node.js and edge runtimes.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Captures server request errors (route handlers, server components) that
// Next.js handles internally and that never reach the app error boundary.
export const onRequestError = Sentry.captureRequestError;
