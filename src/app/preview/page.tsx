import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "ResidencyPhoto — Design Preview",
  description: "Design token preview for ResidencyPhoto",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="font-sans text-xs font-semibold text-muted uppercase tracking-widest mb-4 hairline-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Swatch({ name, hex, textClass }: { name: string; hex: string; textClass?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-10 h-10 shrink-0" style={{ background: hex }} />
      <div>
        <div className="font-mono text-xs text-body">{hex}</div>
        <div className={`text-xs ${textClass || "text-muted"}`}>{name}</div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Title */}
      <div className="mb-10">
        <span className="tag">Design Preview</span>
        <h1 className="font-serif text-4xl text-heading mt-2 leading-tight">
          ResidencyPhoto
        </h1>
        <p className="font-sans text-sm text-muted mt-2 max-w-lg">
          Clinical, precise, trustworthy. Design direction based on medical forms, hospital signage, and the AAMC application itself.
        </p>
      </div>

      {/* Palette */}
      <Section title="Color Palette">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Swatch name="Background" hex="#FAFBFC" />
          <Swatch name="Surface" hex="#FFFFFF" />
          <Swatch name="Heading" hex="#0F172A" textClass="text-heading font-medium" />
          <Swatch name="Body" hex="#334155" textClass="text-body" />
          <Swatch name="Muted" hex="#64748B" textClass="text-muted" />
          <Swatch name="Accent Teal" hex="#0D9488" />
          <Swatch name="Accent Gold" hex="#D97706" />
          <Swatch name="Border" hex="#E2E8F0" />
          <Swatch name="Error" hex="#DC2626" />
          <Swatch name="Ink" hex="#1E293B" />
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-6">
          <div>
            <div className="font-mono text-xs text-muted mb-1">Playfair Display — 400 — 3rem</div>
            <div className="font-serif text-5xl text-heading leading-tight">
              Your ERAS headshot. One upload, one download, done.
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-muted mb-1">Playfair Display — 400 — 2rem</div>
            <div className="font-serif text-3xl text-heading leading-snug">
              Resize your photo to official AAMC specifications
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-muted mb-1">Inter — 600 — 1.25rem</div>
            <div className="font-sans text-xl font-semibold text-heading">
              Choose the plan that&apos;s right for you
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-muted mb-1">Inter — 400 — 1rem</div>
            <div className="font-sans text-base text-body">
              2.5 x 3.5 inches at 150 DPI. JPEG or PNG under 150 KB. Color, plain light background, head and shoulders centered.
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-muted mb-1">Inter — 400 — 0.875rem</div>
            <div className="font-sans text-sm text-body">
              Crop, resize, and compress your photo to meet ERAS application requirements.
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-muted mb-1">Inter — 400 — 0.75rem</div>
            <div className="font-sans text-xs text-muted">
              Based on 500+ reviews from residency applicants
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-muted mb-1">JetBrains Mono — 500 — 0.875rem (tabular-nums)</div>
            <div className="font-mono text-sm font-medium text-heading tracking-tight">
              375 x 525 px &middot; 124 KB &middot; 150 DPI
            </div>
          </div>
          <div>
            <div className="font-mono text-xs text-muted mb-1">JetBrains Mono — 500 — 2.5rem (tabular-nums)</div>
            <div className="font-mono text-4xl font-medium text-heading tracking-tight">
              10K+
            </div>
          </div>
        </div>
      </Section>

      {/* Components */}
      <Section title="Components">
        <div className="space-y-10">

          {/* Buttons */}
          <div>
            <div className="font-mono text-xs text-muted mb-3">Buttons</div>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn-primary">Upload Photo</button>
              <button className="btn-ghost">Cancel</button>
              <button className="btn-primary">Sign In</button>
              <button className="btn-ghost">Contact Us</button>
            </div>
          </div>

          {/* Spec card */}
          <div>
            <div className="font-mono text-xs text-muted mb-3">Spec Card (signature element)</div>
            <div className="spec-card p-5 max-w-xs">
              <div className="font-serif text-base text-heading mb-3">Output</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted text-xs">Dimensions</span>
                  <span className="font-mono text-heading">375 x 525 px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-xs">Physical size</span>
                  <span className="font-mono text-heading">2.5 x 3.5 in</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-xs">Resolution</span>
                  <span className="font-mono text-heading">150 DPI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-xs">File size</span>
                  <span className="font-mono text-heading">124 KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-xs">Format</span>
                  <span className="font-mono text-heading">JPEG</span>
                </div>
              </div>
              <div className="mt-4 pt-3 hairline-t flex justify-between items-center">
                <span className="text-xs text-muted">Status</span>
                <span className="stamp-approve">Approved</span>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div>
            <div className="font-mono text-xs text-muted mb-3">Form Inputs</div>
            <div className="max-w-sm space-y-4">
              <div>
                <label className="block font-sans text-sm font-medium text-heading mb-1">Email</label>
                <input type="email" placeholder="you@example.com" className="form-input" />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-heading mb-1">Password</label>
                <input type="password" placeholder="Enter your password" className="form-input" />
              </div>
            </div>
          </div>

          {/* Stamps */}
          <div>
            <div className="font-mono text-xs text-muted mb-3">Status Stamps</div>
            <div className="flex gap-3 items-center">
              <span className="stamp-approve">Approved</span>
              <span className="stamp-reject">Too Large</span>
              <span className="tag">Draft</span>
            </div>
          </div>

          {/* Stats card */}
          <div>
            <div className="font-mono text-xs text-muted mb-3">Stats Cards (ruled)</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 hairline">
                <div className="font-mono text-3xl font-medium text-heading">10K+</div>
                <div className="font-sans text-xs text-muted mt-1">Applicants Served</div>
              </div>
              <div className="p-4 hairline">
                <div className="font-mono text-3xl font-medium text-heading">4.9</div>
                <div className="font-sans text-xs text-muted mt-1">Average Rating</div>
              </div>
              <div className="p-4 hairline">
                <div className="font-mono text-3xl font-medium text-heading">100%</div>
                <div className="font-sans text-xs text-muted mt-1">Spec Compliance</div>
              </div>
            </div>
          </div>

          {/* Checkmark list */}
          <div>
            <div className="font-mono text-xs text-muted mb-3">Checkmark List</div>
            <ul className="space-y-2 max-w-sm">
              {[
                "Exact AAMC dimensions (2.5 x 3.5 in at 150 DPI)",
                "Automatic center-crop framing",
                "Smart compression under 150 KB",
                "JPEG and PNG support",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 font-sans text-sm text-body">
                  <span className="text-primary shrink-0 mt-0.5">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Rating card */}
          <div>
            <div className="font-mono text-xs text-muted mb-3">Rating Card (ruled)</div>
            <div className="p-5 hairline max-w-xs text-center">
              <div className="font-mono text-3xl font-medium text-heading">4.9 / 5.0</div>
              <div className="text-gold text-sm tracking-widest mt-1">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <div className="font-sans text-xs text-muted mt-1">Based on 500+ reviews</div>
            </div>
          </div>

        </div>
      </Section>

    </div>
  );
}
