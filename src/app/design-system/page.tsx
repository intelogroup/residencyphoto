import Link from "next/link";

const COLORS = [
  ["Canvas", "#F8FAFC", "var(--color-bg)"],
  ["Surface", "#FFFFFF", "var(--color-surface)"],
  ["Subtle Surface", "#F1F5F9", "var(--color-surface-subtle)"],
  ["Primary", "#0D9488", "var(--color-primary)"],
  ["Primary Dark", "#0F766E", "var(--color-primary-dark)"],
  ["Heading", "#0F172A", "var(--color-heading)"],
  ["Body", "#475569", "var(--color-body)"],
  ["Muted", "#94A3B8", "var(--color-muted)"],
  ["Border", "#E2E8F0", "var(--color-border)"],
  ["Error", "#DC2626", "var(--color-error)"],
] as const;

export default function DesignSystemPage() {
  return (
    <main id="main-content" className="min-h-screen bg-bg text-body">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <Link href="/" className="font-sans text-sm font-bold text-heading" translate="no">
            ResidencyPhoto
          </Link>
          <Link href="/" className="btn-ghost btn-sm">
            Back to App
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
        <section className="max-w-2xl">
          <span className="section-kicker">Design System</span>
          <h1 className="mt-4 text-4xl font-bold text-heading text-balance">ResidencyPhoto Interface System</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-body">
            A focused clinical interface for confident, high-stakes photo preparation.
          </p>
        </section>

        <section className="mt-14 border-t border-border pt-10" aria-labelledby="colors-heading">
          <h2 id="colors-heading" className="text-xl font-bold text-heading">Color</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {COLORS.map(([name, hex, token]) => (
              <div key={name} className="card overflow-hidden">
                <div className="h-16 border-b border-border" style={{ backgroundColor: hex }} />
                <div className="p-3">
                  <p className="text-sm font-semibold text-heading">{name}</p>
                  <p className="mt-1 font-mono text-xs text-muted">{hex}</p>
                  <p className="mt-1 truncate font-mono text-xs text-muted" title={token}>{token}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-10 border-t border-border pt-10 lg:grid-cols-2" aria-labelledby="type-heading">
          <div>
            <h2 id="type-heading" className="text-xl font-bold text-heading">Typography</h2>
            <div className="mt-5 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Display</p>
                <p className="mt-2 text-4xl font-bold leading-tight text-heading text-balance">Exact Results. Less Friction.</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Section Heading</p>
                <p className="mt-2 text-2xl font-bold text-heading">Clear, Compact, Practical</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Body</p>
                <p className="mt-2 max-w-lg leading-relaxed text-body">Use straightforward language with enough detail to help applicants act confidently.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-heading">Foundations</h2>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              <div className="flex items-center justify-between gap-6 py-3 text-sm">
                <dt className="text-body">Spacing Scale</dt>
                <dd className="font-mono font-medium text-heading">4px base</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-3 text-sm">
                <dt className="text-body">Content Width</dt>
                <dd className="font-mono font-medium text-heading">1152px max</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-3 text-sm">
                <dt className="text-body">Control Radius</dt>
                <dd className="font-mono font-medium text-heading">8px</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-3 text-sm">
                <dt className="text-body">Default Border</dt>
                <dd className="font-mono font-medium text-heading">1px solid</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="mt-14 border-t border-border pt-10" aria-labelledby="components-heading">
          <h2 id="components-heading" className="text-xl font-bold text-heading">Components</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-heading">Actions</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="btn-primary">Save Changes</button>
                <button type="button" className="btn-ghost">Cancel</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" className="btn-primary btn-sm">Small Action</button>
                <button type="button" className="btn-ghost btn-sm">Secondary</button>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-heading">Status</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="pill-success">Ready</span>
                <span className="pill-error">Needs Attention</span>
                <span className="tag">Private by Default</span>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-heading">Form Field</h3>
              <label htmlFor="system-email" className="form-label mt-4">Email Address</label>
              <input id="system-email" name="email" type="email" autoComplete="email" spellCheck={false} className="form-input mt-1.5" placeholder="you@example.com…" />
            </div>
          </div>
        </section>

        <section className="mt-14 border-t border-border pt-10" aria-labelledby="surfaces-heading">
          <h2 id="surfaces-heading" className="text-xl font-bold text-heading">Surfaces</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="card p-6">
              <span className="section-kicker">Default Card</span>
              <h3 className="mt-4 text-lg font-bold text-heading">Focused Content</h3>
              <p className="mt-2 leading-relaxed text-body">Use a white card when a bounded task, review, or distinct option benefits from a clear edge.</p>
            </div>
            <div className="surface-subtle border border-border p-6" style={{ borderRadius: "var(--radius-md)" }}>
              <span className="section-kicker">Subtle Surface</span>
              <h3 className="mt-4 text-lg font-bold text-heading">Supporting Context</h3>
              <p className="mt-2 leading-relaxed text-body">Use the quiet slate surface for grouped information that should support, not compete with, the main action.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
