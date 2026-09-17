import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Required so the PostHog /ingest reverse proxy below isn't redirected.
  skipTrailingSlashRedirect: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      // PostHog reverse proxy: keeps analytics first-party so ad blockers
      // don't strip events. https://posthog.com/docs/advanced/proxy
      {
        source: "/ingest/static/:path*",
        destination: "https://us.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.posthog.com/:path*",
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "intelogroup",
  project: "residencyphoto",
  // Sourcemap upload runs only when SENTRY_AUTH_TOKEN is set (Vercel env);
  // without it the build still succeeds.
  silent: !process.env.CI,
});
