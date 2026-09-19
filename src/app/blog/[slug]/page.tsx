import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { getAllPosts, getPost, getPostSlugs, siteUrl } from "@/lib/blog";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getPostSlugs().map((slug) => ({ slug }));
}

function postOgImage(slug: string): string {
  const candidate = `/og-image-${slug}.jpg`;
  if (fs.existsSync(path.join(process.cwd(), "public", candidate.slice(1)))) return candidate;
  return "/og-image.jpg";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  const ogImage = postOgImage(post.slug);
  return {
    title: `${post.title} — ResidencyPhoto`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: "ResidencyPhoto",
      type: "article",
      publishedTime: new Date(`${post.date}T12:00:00Z`).toISOString(),
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const base = siteUrl();
  const canonical = `${base}/blog/${post.slug}`;
  const ogImage = `${base}${postOgImage(post.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: ogImage,
    datePublished: post.date,
    author: { "@type": "Organization", name: "ResidencyPhoto", url: base },
    publisher: { "@type": "Organization", name: "ResidencyPhoto" },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  };

  return (
    <main id="main-content" className="max-w-3xl mx-auto px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" className="font-sans text-sm font-semibold text-primary-dark hover:underline">
        ← All posts
      </Link>
      <h1 className="font-sans text-4xl font-bold text-heading mt-4 leading-tight">{post.title}</h1>
      <p className="font-sans text-sm text-muted mt-3">
        {formatDate(post.date)} · ResidencyPhoto
      </p>
      <article className="article-body mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="card p-6 mt-12">
        <h2 className="font-sans text-lg font-bold text-heading">Make your photo ERAS-compliant in one upload</h2>
        <p className="font-sans text-body mt-2">
          ResidencyPhoto resizes any headshot to the exact 2.5 x 3.5 in, 150 DPI, under-150 KB
          specification — in your browser, so your photo never leaves your device.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 font-sans text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-colors rounded-lg px-5 py-2.5"
        >
          Open the editor
        </Link>
      </div>
      <div className="mt-10 hairline-t pt-6">
        <h2 className="font-sans text-sm font-semibold text-heading uppercase tracking-wide">More posts</h2>
        <ul className="mt-3 space-y-2">
          {getAllPosts()
            .filter((p) => p.slug !== post.slug)
            .slice(0, 5)
            .map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="font-sans text-sm text-primary-dark hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
