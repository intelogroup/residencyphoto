<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Neon Auth Configuration

This project uses Neon Auth for authentication. The auth configuration is **lazy-loaded** to avoid build-time environment variable evaluation.

### Key Implementation Details

- `src/lib/auth/server.ts`: Auth instance is wrapped in a Proxy that lazy-loads on first access
- `src/app/api/auth/[...path]/route.ts`: Handler methods are wrapped in functions to defer execution
- This pattern allows `npm run build` to succeed without requiring environment variables at build time

### Required Environment Variables

```bash
NEON_AUTH_BASE_URL                 # Server-side auth URL
NEXT_PUBLIC_NEON_AUTH_URL          # Client-side auth URL (must match NEON_AUTH_BASE_URL)
NEXT_PUBLIC_NEON_DATA_API_URL      # Neon Data API endpoint
NEON_AUTH_COOKIE_SECRET            # At least 32 characters (openssl rand -base64 32)
DATABASE_URL                       # Pooled connection with authenticator role
ADMIN_EMAILS                       # Comma-separated list of admin emails
```

### Database Migrations

Always run migrations against the target database before deployment:

```bash
# Local development
npm run db:migrate

# Production (using Vercel env vars)
DATABASE_URL="postgresql://neondb_owner:..." npm run db:migrate
```

The app requires these tables (created by migrations):
- `applicant_profiles` - User profiles and plan information
- `photo_records` - Photo processing history
- `rate_limits` - Rate limiting for auth and API endpoints

### Troubleshooting Auth Issues

1. **500 errors on signup/login**: Check if migrations have been run
   ```bash
   vercel logs --environment production --query "api/auth"
   ```

2. **"NEON_AUTH_BASE_URL is required" at build time**: Auth config is being evaluated too early. Verify lazy-loading pattern in `src/lib/auth/server.ts`

3. **Auth redirects failing**: Verify `APP_URL` matches the deployment URL (no trailing slash)
