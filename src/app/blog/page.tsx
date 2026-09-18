import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — ResidencyPhoto",
  description:
    "Guides on ERAS photo requirements, residency headshot specs, and application tips for medical residency applicants.",
  alternates: { canonical: "/blog" },
};

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-sans text-4xl font-bold text-heading">Blog</h1>
      <p className="font-sans text-lg text-muted mt-3">
        Practical guides on ERAS photo specs and residency application headshots.
      </p>
      <div className="mt-10 space-y-6">
        {posts.map((post) => (
          <article key={post.slug} className="card p-6">
            <p className="font-sans text-xs text-muted uppercase tracking-wide">{formatDate(post.date)}</p>
            <h2 className="font-sans text-xl font-bold text-heading mt-2">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                {post.title}
              </Link>
            </h2>
            <p className="font-sans text-body mt-2 leading-relaxed">{post.description}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="font-sans text-sm font-semibold text-primary-dark hover:underline mt-3 inline-block"
            >
              Read more
            </Link>
          </article>
        ))}
        {posts.length === 0 && (
          <p className="font-sans text-muted">No posts yet — check back soon.</p>
        )}
      </div>
    </main>
  );
}
