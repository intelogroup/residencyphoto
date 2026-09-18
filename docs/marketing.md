# Marketing v0 — operator manual

ResidencyPhoto's marketing engine, built 2026-09-18. Four pieces:

1. **/blog** — SEO content section (`src/app/blog`, posts in `content/posts/*.mdx`)
2. **Newsletter** — footer subscribe form → `newsletter_subscribers` table → Resend confirmation
3. **Weekly content drafts** — GitHub Action writes a post + social snippets, opens a review PR
4. **Broadcast + Search Console digest** — newsletter sends, weekly SEO stub

## Secrets to add

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Required for | Where to get it |
|---|---|---|
| `HF_TOKEN` | Weekly content drafts | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — create a **read/inference-only** token (no write permissions) |
| `RESEND_API_KEY` | Newsletter confirmation emails + broadcasts | [resend.com/api-keys](https://resend.com/api-keys) |
| `DATABASE_URL` | Broadcast recipient list | Same pooled Neon connection string the app uses (Vercel → project → Environment Variables) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Search Console digest (later, optional) | Google Cloud service account key; see setup steps below |

Optional repo variable: `HF_MODEL` (Settings → Secrets and variables → Actions → Variables) to switch the draft model. Default: `meta-llama/Llama-3.3-70B-Instruct`.

## How each workflow works

### Weekly content draft (`.github/workflows/content-draft.yml`)

- Runs **Mondays 13:00 UTC** (or manually via *Run workflow*).
- `scripts/content-draft.mjs` reads `content/topics.md`, takes the **first unchecked** `- [ ]` topic, and calls the Hugging Face Inference API twice:
  - a full MDX post (frontmatter: `title`, `description`, `date`, `slug`; ~1200 words) → `content/posts/<slug>.mdx`
  - 3 Threads drafts + 1 Instagram caption + hashtags → `content/snippets/<slug>-<date>.md`
- Ticks the topic as `- [x]` in `content/topics.md`.
- Commits to branch `content/<slug>-<date>` and opens a PR with a review checklist.
- If `HF_TOKEN` is missing, the job fails with a message naming the missing secret — add it and re-run.

### Reviewing and merging draft PRs

The PR body has a checklist. Verify:

1. Title <60 chars, description <155 chars.
2. Facts are right — canonical ERAS specs are **2.5 x 3.5 in, 150 DPI, JPEG under 150 KB**.
3. No placeholder text or invented claims.
4. Frontmatter is complete (title, description, date, slug).

Merge to publish. The post appears on `/blog`, in `sitemap.xml`, and `/blog/rss.xml` automatically on the next deploy (Vercel rebuilds on merge to main). Add fresh topics to `content/topics.md` when the list runs low.

### Newsletter broadcast (`.github/workflows/broadcast.yml`)

- Manual: **Actions → Newsletter broadcast → Run workflow**, enter the post `slug`.
- `scripts/broadcast.mjs` reads the post frontmatter, builds the email (title, description excerpt, CTA to `residencyphoto.com/blog/<slug>`, one-click unsubscribe link), and sends via Resend **batch** to every subscriber with `unsubscribed_at IS NULL`.
- Logs print recipient **counts only** — no emails in logs.
- Run this **after** merging the post so the link is live.

### Search Console digest (`.github/workflows/search-console-digest.yml`)

- Weekly, Mondays 09:00 UTC. **v0 is an intentional stub**: it exits 0 with setup instructions until configured.
- To enable later: create a Google Cloud service account, enable the Search Console API, add its email as an Owner of the residencyphoto.com property in Search Console, and paste the JSON key into the `GOOGLE_SERVICE_ACCOUNT_JSON` secret. Then extend `scripts/search-console-digest.mjs` with the real queries.

## Posting to Threads / Instagram

Weekly snippets live in `content/snippets/<slug>-<date>.md`:

- **Threads:** copy each draft verbatim (they're under 500 chars); post the three across the week, not all at once.
- **Instagram:** copy the caption, append the hashtags line.
- Snippets are marketing copy — post them manually from the `@residencyphoto` accounts. There is no auto-poster in v0.

## Newsletter subscription flow

- Footer form posts to `/api/newsletter/subscribe` (email validated, lowercased, rate-limited by IP, upserted into `newsletter_subscribers` with `source: "footer"`). Resubscribing clears `unsubscribed_at`.
- Confirmation email goes through Resend from `RESEND_FROM_EMAIL` (defaults to Resend's onboarding sender until `residencyphoto.com` is verified in Resend).
- Unsubscribe links hit `/api/newsletter/unsubscribe?email=…` (one click, no login).

## Files added

- `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx` — index + post pages (metadata, canonical URLs, JSON-LD Article schema)
- `src/app/blog/rss.xml/route.ts` — RSS feed
- `src/lib/blog.ts`, `src/lib/markdown.ts` (+ tests) — frontmatter parsing, minimal Markdown renderer, post helpers
- `src/db/schema.ts` + `drizzle/0003_*` — `newsletter_subscribers` table
- `src/app/api/newsletter/subscribe/route.ts`, `src/app/api/newsletter/unsubscribe/route.ts`
- `src/app/_components/landing/NewsletterForm.tsx` — footer form
- `content/posts/eras-photo-requirements-2026.mdx` — launch post
- `content/topics.md` — 12-topic backlog
- `.github/workflows/{content-draft,broadcast,search-console-digest}.yml`, `scripts/{content-draft,broadcast,search-console-digest}.mjs`
