#!/usr/bin/env node
/**
 * Search Console digest (v0 stub).
 *
 * Reads Google Search Console data ONLY when GOOGLE_SERVICE_ACCOUNT_JSON is
 * provided. Until then it prints setup instructions and exits 0 — the weekly
 * run never fails, it just documents what's missing.
 */
const SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!SERVICE_ACCOUNT) {
  console.log(`search-console-digest: skipped — no Search Console credentials yet.
To enable the weekly digest:
1. Create a service account in Google Cloud Console and enable the
   Google Search Console API for the residencyphoto.com project.
2. In Search Console (search.google.com/search-console), add the service
   account email as an Owner of the residencyphoto.com property.
3. Download the service account JSON key and add it as the repo secret
   GOOGLE_SERVICE_ACCOUNT_JSON (Settings > Secrets and variables > Actions).
Once set, this script will pull queries, clicks, and positions for /blog and
report them here.`);
  process.exit(0);
}

console.log(
  "search-console-digest: credentials present, but the Search Console query implementation is a v0 stub. " +
    "Add the reporting queries here in a follow-up.",
);
process.exit(0);
