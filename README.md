# ResidencyPhoto

ResidencyPhoto prepares residency application headshots to match published AAMC ERAS photo specifications. Image processing runs in the browser; Neon provides authentication and account data, and Stripe provides checkout.

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Neon Auth URLs and database credentials
npm run db:migrate
npm run dev
```

Required `.env.local` configuration:

```bash
# Get these from your Neon Console (Auth tab)
NEON_AUTH_BASE_URL=https://your-project.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth
NEXT_PUBLIC_NEON_AUTH_URL=https://your-project.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth
NEXT_PUBLIC_NEON_DATA_API_URL=https://your-project.apirest.c-9.us-east-1.aws.neon.tech/neondb/rest/v1

# Generate with: openssl rand -base64 32
NEON_AUTH_COOKIE_SECRET=your_32_character_secret

# Pooled connection string from Neon Console
DATABASE_URL=postgresql://authenticator:password@your-project-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full

# For local dev
APP_URL=http://localhost:3000
```

Before committing:

```bash
npm test
npm run lint
npm run build
```

## Vercel deployment

### Initial Setup

1. Link the project to Vercel:
```bash
vercel link
```

2. Configure Production environment variables in Vercel:

```bash
# Set each variable
vercel env add APP_URL production
# Value: https://residencyphoto.com

vercel env add DATABASE_URL production
# Value: postgresql://neondb_owner:password@your-project-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=verify-full

vercel env add NEON_AUTH_BASE_URL production
# Value: https://your-project.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth

vercel env add NEXT_PUBLIC_NEON_AUTH_URL production
# Value: https://your-project.neonauth.c-9.us-east-1.aws.neon.tech/neondb/auth

vercel env add NEXT_PUBLIC_NEON_DATA_API_URL production
# Value: https://your-project.apirest.c-9.us-east-1.aws.neon.tech/neondb/rest/v1

vercel env add NEON_AUTH_COOKIE_SECRET production
# Value: (generate with: openssl rand -base64 32)

# Add Stripe credentials
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_RESIDENT_PRICE_ID production
vercel env add STRIPE_PROGRAM_PRICE_ID production
vercel env add STRIPE_WEBHOOK_SECRET production

# Add admin email
vercel env add ADMIN_EMAILS production
# Value: your@email.com
```

3. **IMPORTANT: Run database migrations** against production before first deployment:

```bash
# Using the production DATABASE_URL from Vercel
DATABASE_URL="postgresql://neondb_owner:password@..." npm run db:migrate
```

4. Deploy:
```bash
git push origin main
# Vercel auto-deploys from main branch
```

### Post-Deployment

- Verify signup flow works at `https://residencyphoto.com/signup`
- Configure Stripe webhook endpoint: `https://residencyphoto.com/api/webhooks/stripe`
- Attach custom domains `residencyphoto.com` and `www.residencyphoto.com` in Vercel
- Set `www` to redirect to apex domain

### Troubleshooting

If signup returns 500 errors, check Vercel logs:
```bash
vercel logs --environment production --query "api/auth"
```

Common issues:
- Missing database migrations: Run `npm run db:migrate` against production
- Incorrect Neon Auth URLs: Verify in Neon Console > Auth tab
- Missing environment variables: Check with `vercel env ls production`
