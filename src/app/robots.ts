import type { MetadataRoute } from "next";

const PRIVATE_PATHS = ["/dashboard", "/account", "/admin", "/api"];

// AI crawlers and scrapers are explicitly welcome on public content.
const AI_SCRAPERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "Diffbot",
  "FacebookBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "https://residencyphoto.com";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: AI_SCRAPERS, allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
