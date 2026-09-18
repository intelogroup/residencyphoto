#!/usr/bin/env node
/**
 * Newsletter broadcast.
 *
 * Triggered manually with a blog post slug. Builds the email from the post's
 * frontmatter and sends it via Resend batch to all subscribers with
 * unsubscribed_at IS NULL.
 *
 * Required env: RESEND_API_KEY, DATABASE_URL, POST_SLUG.
 * Never logs recipient emails — only counts.
 */
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const POST_SLUG = process.env.POST_SLUG;
const BASE_URL = (process.env.APP_URL || "https://residencyphoto.com").replace(/\/$/, "");
const FROM = process.env.RESEND_FROM_EMAIL || "ResidencyPhoto <onboarding@resend.dev>";

function fail(message) {
  console.error(`broadcast: ${message}`);
  process.exit(1);
}

if (!RESEND_API_KEY) fail("Missing RESEND_API_KEY secret.");
if (!DATABASE_URL) fail("Missing DATABASE_URL secret.");
if (!POST_SLUG) fail("POST_SLUG input is required.");

const postPath = [".mdx", ".md"]
  .map((ext) => path.join(process.cwd(), "content", "posts", `${POST_SLUG}${ext}`))
  .find((p) => fs.existsSync(p));
if (!postPath) fail(`Post not found: content/posts/${POST_SLUG}.mdx`);

const source = fs.readFileSync(postPath, "utf8");
const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!frontmatter) fail("Post is missing its frontmatter block.");
const fields = {};
for (const line of frontmatter[1].split(/\r?\n/)) {
  const idx = line.indexOf(":");
  if (idx === -1) continue;
  fields[line.slice(0, idx).trim()] = line
    .slice(idx + 1)
    .trim()
    .replace(/^["']|["']$/g, "");
}
if (!fields.title || !fields.description) fail("Post frontmatter needs title and description.");

const postUrl = `${BASE_URL}/blog/${POST_SLUG}`;
const subject = `New on the blog: ${fields.title}`;
const htmlBody = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;line-height:1.6;color:#0F172A">
  <h1 style="font-size:24px">${fields.title}</h1>
  <p style="color:#475569">${fields.description}</p>
  <p><a href="${postUrl}" style="display:inline-block;background:#0D9488;color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:8px">Read the post</a></p>
  <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0"/>
  <p style="font-size:12px;color:#94A3B8">You're receiving this because you subscribed to the ResidencyPhoto newsletter.
  <a href="${BASE_URL}/api/newsletter/unsubscribe?email={{EMAIL}}">Unsubscribe</a></p>
</div>`.trim();

const sql = neon(DATABASE_URL);
const rows = await sql`SELECT email FROM newsletter_subscribers WHERE unsubscribed_at IS NULL`;
const emails = rows.map((r) => r.email);
console.log(`broadcast: ${emails.length} active subscriber(s)`);

const BATCH = 100;
let batches = 0;
for (let i = 0; i < emails.length; i += BATCH) {
  const chunk = emails.slice(i, i + BATCH).map((email) => ({
    from: FROM,
    to: email,
    subject,
    html: htmlBody.replace("{{EMAIL}}", encodeURIComponent(email)),
  }));
  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chunk),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    fail(`Resend batch ${batches + 1} failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  batches += 1;
}

console.log(`broadcast: sent ${batches} batch(es) covering ${emails.length} recipient(s). No PII logged.`);
