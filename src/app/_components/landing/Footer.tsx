import Link from "next/link";

export function Footer() {
  return (
    <footer className="hairline-t bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">

        {/* Footer Top Grid */}
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Tagline */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">R</span>
              <span className="font-sans text-base font-bold text-heading">ResidencyPhoto</span>
            </div>
            <p className="font-sans text-sm text-muted leading-relaxed max-w-sm">
              A simple tool to resize and format your headshot for ERAS — no design skills needed.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs font-semibold text-heading uppercase tracking-wide">Navigate</h4>
            <div className="flex flex-col gap-2 font-sans text-sm text-muted">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <a href="/login" className="hover:text-primary transition-colors">Open editor</a>
            </div>
          </div>

          {/* Policy Links */}
          <div className="space-y-3">
            <h4 className="font-sans text-xs font-semibold text-heading uppercase tracking-wide">Legal</h4>
            <div className="flex flex-col gap-2 font-sans text-sm text-muted">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="mailto:support@residencyphoto.com" className="hover:text-primary transition-colors">Contact support</a>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Block */}
        <div className="pt-6 border-t border-border space-y-4">
          <p className="font-sans text-xs text-muted leading-relaxed">
            <strong className="text-heading">Disclaimer:</strong> ResidencyPhoto is an independent resizing tool. It is not affiliated with, endorsed by, or officially connected to the Association of American Medical Colleges (AAMC), the Electronic Residency Application Service (ERAS), or any residency matching program.
          </p>
          <p className="font-sans text-xs text-muted leading-relaxed">
            <strong className="text-heading">Your privacy:</strong> All resizing and compression happens locally in your browser. Your photo is never uploaded, stored, or sent to any server.
          </p>
        </div>

        {/* Footer Bottom Rule */}
        <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-sans text-xs text-muted">
            &copy; {new Date().getFullYear()} ResidencyPhoto. All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  );
}
