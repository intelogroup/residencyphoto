# ERASPhoto — SaaS Product Requirements

## Problem
Residency applicants need a headshot matching AAMC ERAS specs: 2.5 x 3.5 in at 150 DPI, JPEG/PNG, under 150 KB, color, plain background. Existing tools are complex or generic. This is a purpose-built tool for one job.

## Monetization
One-time payment per download. No subscriptions, no accounts required for basic use.
- Free: 1 resized download
- Resident ($4): Unlimited resizes, priority compression, download history, watermark removal
- Program ($19): Bulk processing, custom branding

## Tech Stack
- Next.js 16 + Tailwind v4 + TypeScript
- Vercel deployment (free tier start)
- Stripe Checkout (one-time payments)
- No database initially (mock auth, static data)
- Image processing: client-side Canvas (no server costs)

## Design Direction

### Concept: The Medical Form
The design takes cues from printed medical documents — official forms, prescription pads, hospital signage, and the AAMC application itself. Clinical, precise, trustworthy. The page should feel like something handed to you at a hospital front desk, not another SaaS landing page.

### Color Palette

| Token | Value | Role |
|-------|-------|------|
| Background | #FAFBFC | Near-white clinical page tint |
| Surface | #FFFFFF | Cards, modals |
| Text primary | #0F172A | Deep navy for headings |
| Text body | #334155 | Body copy |
| Text muted | #64748B | Secondary text |
| Accent teal | #0D9488 | Primary actions, links |
| Accent gold | #D97706 | Success, compliance badges |
| Border | #E2E8F0 | Hairline rules, dividers |
| Error | #DC2626 | Validation, errors |
| Ink | #1E293B | Darkest text, near-black |

### Typography

| Role | Face | Weight | Size range |
|------|------|--------|------------|
| Display headings | Playfair Display | 400 | 2.5rem–4rem |
| Subheadings | Inter | 600 | 1.25rem–1.75rem |
| Body | Inter | 400 | 0.875rem–1rem |
| Small/captions | JetBrains Mono or Inter | 400 | 0.75rem–0.8125rem |
| Data/metrics | JetBrains Mono | 500 | tabular-nums |

Playfair Display gives a stately, archival feel (think medical journals, diploma certificates). Inter keeps body text clean. Mono for specs/data reinforces precision — dimensions, file sizes, pixel counts are quantitative, and monospace signals measurements.

### Signature Element
The **Spec Card** — a physical-looking ruled index card that displays the photo's exact output dimensions, file size, and compliance status. It sits in the hero and on the tool page. It looks like a printed card pinned to a hospital bulletin board: off-white background, hairline blue border, monospace data, a rubber-stamp "APPROVED" or "REJECTED". This is the one memorable visual — everything else stays quiet.

### Layout Principles
- Left-aligned, asymmetric (hero text left, spec card right)
- Hairline borders instead of heavy shadows
- Generous whitespace, dense where data lives (dashboard tables, spec card)
- Forms and the tool page feel like a paper form — labeled fields, no placeholder text as labels
- Motion: restrained. A single orchestrated moment on page load (spec card slides into place, data counts up). No hover effects, no parallax.

### Section Details

#### Landing (`/`)
- **Nav**: white, hairline bottom border, ERASPhoto in serif logo, nav links (Features, How It Works, Pricing), Login CTA in teal pill
- **Hero**: "Your ERAS headshot. One upload, one download, done." in serif. Body: "2.5 x 3.5 inches at 150 DPI. JPEG or PNG under 150 KB." in Inter. Spec Card floats right: ruled card with dimensions, size, format, status. No before/after photos — the spec card is the visual thesis.
- **Stats**: 3 metrics in serif with mono numbers: "10K+ applicants" / "4.9 rating" / "100% compliance". Hairline dividers between them.
- **How It Works**: 4 steps with checkmark-stamp icons (not numbered bubbles). Each step is a card with hairline border. Steps: Upload source photo / Auto-crop to frame / Compress under 150 KB / Download your headshot.
- **Features**: Checklist with teal checkmarks. Right side: rating card (4.9/5.0, 500+ reviews, 5 stars) in ruled-card style with hairline border.
- **Pricing**: 3 tiers. Middle highlighted with teal gradient + ring. Left and right: white cards with hairline border. Plan names: Free / Resident / Program. Features listed with checkmarks.
- **Footer**: Hairline border top. 3 links: Privacy, Terms, Contact. Copyright left.
- **Motion**: Spec card slides in from right on load. Stats count up. Step cards fade in on scroll.

#### Login (`/login`)
- Centered card with hairline border, clinical white bg
- Labeled fields (label above input, not placeholder as label)
- Teal CTA: "Sign In"
- "No account? Sign up" link below
- Background: subtle repeating pattern (like a medical form grid) or solid #FAFBFC

#### Dashboard (`/dashboard`)
- Sidebar: dark navy (#0F172A) with white text. Nav items: Dashboard, My Photos, Settings, Logout.
- Top bar: white, hairline bottom, user avatar + name right
- Welcome: serif heading, Inter sub
- Stats: 4 ruled cards in grid — Photos Resized, Compliant, Storage Used, Days Until ERAS. Mono numbers.
- CTA card: teal gradient, "Resize a New Photo" in serif, Inter sub
- Recent Photos: table with hairline borders. Columns: Name, Size, Date, Status (stamp: APPROVED in green caps or REJECTED in red caps)

#### My Photos (`/dashboard/photos`)
- Grid of ruled photo cards. Each: thumbnail in polaroid-style frame (white border, no shadow), name (mono), dimensions, stamp status, Download link.
- Header: serif title left, "New Photo" teal pill right.

#### Settings (`/dashboard/settings`)
- Profile card with hairline border: name, email, plan (stamp badge)
- Upgrade card: teal gradient, "Upgrade to Resident — $4" button

#### Tool (`/tool`)
- Feels like a paper form. Two-column: upload zone left, spec card right.
- Upload zone: dashed hairline border, "Click or drag your photo here" in Inter
- After upload: center-crop to 375x525 (2.5 x 3.5 at 150 DPI). Quality compression until under 150 KB.
- Spec card updates in real time: dimensions, size, format, APPROVED/REJECTED stamp.
- Download button: teal pill. Reset link: text, no button.
- Background: solid #FAFBFC.

## Auth Flow (Mock)
- localStorage key: `eras_user` = `{ email, name, token }`
- Dashboard layout: useEffect checks localStorage, redirects to /login if absent
- Logout: clear key, redirect to /login
- Replace with real auth (Better Auth + Turso / WorkOS / next-auth) when launching

## Future Work (Post-MVP)
- Real auth + user accounts
- Stripe Checkout integration
- Download history persisted in DB
- Bulk upload for programs
- Photo preview with side-by-side comparison
- Image quality checks (brightness, background detection)

## Design Decisions Record

| Decision | Rationale |
|----------|-----------|
| Serif display headings | Evokes medical documents, diplomas, archival authority. Differentiates from generic SaaS Inter-everything. |
| Teal accent instead of blue | Blue is the default SaaS color. Teal is clinical (scrubs, hospital branding) and distinctive. |
| Ruled spec card as signature | Tangible output preview. Shows exactly what the user gets — no abstraction. |
| Mono for all data | Dimensions, file sizes, specs are measurements. Monospace signals precision. |
| No before/after photos | The tool's output is a compliant spec, not a visual transformation. Before/after is misleading. |
| Hairline borders over shadows | Mimics printed forms and ruled paper. Keeps the page feeling clinical, not "tech." |
| 2 pricing tiers or 3 | 3 is standard SaaS but expected for a tool with free/pro/program tiers. Middle card gets teal highlight to break symmetry. |
| Resists numbered step icons | Steps (upload → crop → compress → download) are a real sequence. Checkmarks convey completion better than abstract numbers. |
