# ResidencyPhoto

ResidencyPhoto prepares residency application headshots to match published AAMC ERAS photo specifications. Image processing runs in the browser; Neon provides authentication and account data, and Stripe provides checkout.

## Local development

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Before committing:

```bash
npm test
npm run lint
npm run build
```

## Vercel deployment

Create a Vercel project named `residencyphoto`. If the Git repository root is the parent directory, set the Vercel Root Directory to `eras-photo`.

Configure these Production environment variables:

```text
APP_URL=https://residencyphoto.com
DATABASE_URL
NEON_AUTH_BASE_URL
NEXT_PUBLIC_NEON_AUTH_URL
NEXT_PUBLIC_NEON_DATA_API_URL
NEON_AUTH_COOKIE_SECRET
STRIPE_SECRET_KEY
STRIPE_RESIDENT_PRICE_ID
STRIPE_PROGRAM_PRICE_ID
STRIPE_WEBHOOK_SECRET
```

Use test Neon/Stripe resources or appropriately isolated values for Preview deployments. Run database migrations deliberately against the target database before promoting a deployment.

The production Stripe webhook endpoint is:

```text
https://residencyphoto.com/api/webhooks/stripe
```

After the production deployment is verified, attach both `residencyphoto.com` and `www.residencyphoto.com` in Vercel and redirect `www` to the apex domain.
