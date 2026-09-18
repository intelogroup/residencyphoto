import "server-only";

import fs from "node:fs";
import { markdownToHtml, parseFrontmatter, type PostFrontmatter } from "./markdown";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface Post extends PostFrontmatter {
  html: string;
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.mdx?$/, ""))
    .sort();
}

export function getPost(slug: string): Post | null {
  const file = [".mdx", ".md"].map((ext) => path.join(POSTS_DIR, `${slug}${ext}`)).find((p) => fs.existsSync(p));
  if (!file) return null;
  const { frontmatter, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  return { ...frontmatter, slug: frontmatter.slug || slug, html: markdownToHtml(body) };
}

export function getAllPosts(): Post[] {
  return getPostSlugs()
    .map(getPost)
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function siteUrl(): string {
  return (process.env.APP_URL ?? "https://residencyphoto.com").replace(/\/$/, "");
}
