import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
      <div className="text-center space-y-4 max-w-sm">
        <span className="tag">404</span>
        <h1 className="font-serif text-3xl text-heading leading-tight">Page not found</h1>
        <p className="text-muted text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link href="/" className="btn-primary inline-block text-sm mt-2">
          Back to home
        </Link>
      </div>
    </div>
  );
}
