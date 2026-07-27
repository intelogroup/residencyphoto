"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
      <div className="text-center space-y-4 max-w-sm">
        <span className="tag">Error</span>
        <h1 className="font-serif text-3xl text-heading leading-tight">Something went wrong</h1>
        <p className="text-muted text-sm leading-relaxed">
          Your photo hasn&apos;t been uploaded anywhere, so nothing was lost. Try again.
        </p>
        <button onClick={reset} className="btn-primary text-sm mt-2 cursor-pointer">
          Try again
        </button>
      </div>
    </div>
  );
}
