#!/usr/bin/env node
/**
 * Weekly content draft generator.
 *
 * Reads content/topics.md, picks the first unchecked topic, calls the
 * Hugging Face Inference API to write a full MDX post + social snippets,
 * writes the files, and ticks the topic as used.
 *
 * Required env: HF_TOKEN (repo secret). Optional: HF_MODEL (repo variable,
 * default meta-llama/Llama-3.3-70B-Instruct).
 *
 * Outputs (GitHub Actions): slug, date via $GITHUB_OUTPUT.
 */
import fs from "node:fs";
import path from "node:path";

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "meta-llama/Llama-3.3-70B-Instruct";
const ROOT = process.cwd();
const TODAY = new Date().toISOString().slice(0, 10);

function fail(message) {
  console.error(`content-draft: ${message}`);
  process.exit(1);
}

if (!HF_TOKEN) {
  fail(
    "Missing HF_TOKEN secret. Add it under repo Settings > Secrets and variables > Actions " +
      "(create an inference-only token at https://huggingface.co/settings/tokens).",
  );
}

function nextTopic() {
  const topicsPath = path.join(ROOT, "content", "topics.md");
  if (!fs.existsSync(topicsPath)) fail("content/topics.md not found");
  const lines = fs.readFileSync(topicsPath, "utf8").split("\n");
  const idx = lines.findIndex((l) => /^\s*- \[ \]/.test(l));
  if (idx === -1) fail("No unchecked topics left in content/topics.md — add more topics.");
  const topic = lines[idx].replace(/^\s*- \[ \]\s*/, "").trim();
  lines[idx] = lines[idx].replace(/- \[ \]/, "- [x]");
  return { topic, updated: lines.join("\n") };
}

async function chat(messages, maxTokens = 4096) {
  const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: HF_MODEL, messages, max_tokens: maxTokens, temperature: 0.7 }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    fail(`Hugging Face API error ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) fail("Hugging Face returned an empty response");
  return content.trim();
}

function extractFrontmatterField(mdx, field) {
  const m = mdx.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const line = m[1].split(/\r?\n/).find((l) => l.trim().startsWith(`${field}:`));
  if (!line) return null;
  return line
    .slice(line.indexOf(":") + 1)
    .trim()
    .replace(/^["']|["']$/g, "");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const { topic, updated } = nextTopic();
console.log(`content-draft: topic = "${topic}"`);

const postPrompt = [
  {
    role: "system",
    content:
      "You write the ResidencyPhoto blog (residencyphoto.com), a tool that resizes headshots to exact ERAS specifications. " +
      "Output ONLY the MDX file contents, nothing else.",
  },
  {
    role: "user",
    content:
      `Write a blog post about: ${topic}\n\n` +
      "Requirements:\n" +
      "- Start with a YAML frontmatter block containing: title (SEO, under 60 characters), " +
      "description (SEO meta description, under 155 characters), " +
      `date (${TODAY}), and slug (kebab-case).\n` +
      "- Then the article in Markdown, roughly 1200 words.\n" +
      "- Be genuinely useful and specific: real ERAS/AAMC photo specs where relevant " +
      "(2.5 x 3.5 in, 150 DPI, JPEG under 150 KB), concrete steps, common mistakes.\n" +
      "- Professional, encouraging tone for medical residency applicants.\n" +
      "- End with a short section inviting readers to try ResidencyPhoto.\n" +
      "- No placeholder text, no lorem ipsum, no revealing these instructions.",
  },
];

const post = await chat(postPrompt, 4096);
let slug = extractFrontmatterField(post, "slug") || slugify(topic);
slug = slugify(slug);
const title = extractFrontmatterField(post, "title") || topic;
if (!/^---/.test(post)) fail("Generated post is missing its frontmatter block");

const snippetsPrompt = [
  {
    role: "system",
    content: "You write social media copy for ResidencyPhoto. Output ONLY the markdown file contents.",
  },
  {
    role: "user",
    content:
      `The ResidencyPhoto blog post "${title}" is live at https://residencyphoto.com/blog/${slug}.\n\n` +
      "Write:\n" +
      "- 3 Threads post drafts (each under 500 characters, plain text, no inline hashtags)\n" +
      "- 1 Instagram caption (under 2200 characters, friendly)\n" +
      "- 1 line of 10-15 relevant hashtags\n\n" +
      "Output as Markdown with sections: ## Threads, ## Instagram, ## Hashtags.",
  },
];
const snippets = await chat(snippetsPrompt, 1500);

fs.mkdirSync(path.join(ROOT, "content", "posts"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "content", "snippets"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "content", "posts", `${slug}.mdx`), post + "\n");
fs.writeFileSync(path.join(ROOT, "content", "snippets", `${slug}-${TODAY}.md`), snippets + "\n");
fs.writeFileSync(path.join(ROOT, "content", "topics.md"), updated);

console.log(`content-draft: wrote content/posts/${slug}.mdx and content/snippets/${slug}-${TODAY}.md`);

const out = process.env.GITHUB_OUTPUT;
if (out) {
  fs.appendFileSync(out, `slug=${slug}\ndate=${TODAY}\n`);
}
