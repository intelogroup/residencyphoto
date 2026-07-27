import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "https://residencyphoto.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/account", "/admin", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
