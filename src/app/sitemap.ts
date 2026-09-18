import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_URL ?? "https://residencyphoto.com").replace(/\/$/, "");
  const staticPaths = ["/", "/blog", "/checkout", "/privacy", "/terms", "/login", "/signup"];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T12:00:00Z`),
  }));
  return [...staticEntries, ...postEntries];
}
