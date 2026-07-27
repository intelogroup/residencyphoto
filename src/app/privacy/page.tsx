import Link from "next/link";

export const metadata = { title: "Privacy Policy — ResidencyPhoto" };

const SECTIONS = [
  {
    heading: "1. Your photo never leaves your browser",
    body: [
      "Resizing, cropping, background checks, machine-learning checks, and compression run locally in your browser. The photo itself is not included in requests to ResidencyPhoto or its service providers.",
      "The editor loads its machine-learning models and runtimes from ResidencyPhoto's own origin. Remote model fallback is disabled.",
    ],
  },
  {
    heading: "2. What we store",
    body: [
      "We use Neon to provide account authentication and store account-related information such as your user identifier, email, plan, download count, and Stripe customer identifier when applicable.",
      "Processed-photo history is off by default. If you explicitly enable it, locally generated copies are stored in this browser's local storage. Turning history off deletes those copies. Clearing browser data, using another browser, or switching devices may also remove them.",
    ],
  },
  {
    heading: "3. Payment information",
    body: [
      "Payments are handled by Stripe. We don't see or store your full card number. We retain the Stripe customer reference and plan status needed to provide purchased features.",
    ],
  },
  {
    heading: "4. Cookies and analytics",
    body: [
      "Authentication uses cookies needed to keep you signed in securely. We don't use advertising, session-replay, chat, or third-party analytics scripts in the photo editor.",
      "We collect only allowlisted model-load event names, success or failure status, and bounded loading duration. Telemetry excludes filenames, error text, image data, canvas output, classifications, photo-derived measurements, and browser user-agent information.",
    ],
  },
  {
    heading: "5. Sharing your data",
    body: [
      "We don't sell your data. We use service providers including Neon for authentication and database hosting, Stripe for payments, and Vercel for application hosting and operational logs. We may also disclose information if required by law.",
    ],
  },
  {
    heading: "6. Your choices",
    body: [
      "You can enable, disable, or clear locally stored photo history from Settings. To request deletion of server-side account and billing-related records, email support@residencyphoto.com. Some transaction records may be retained where required for legal, tax, fraud-prevention, or accounting purposes.",
    ],
  },
  {
    heading: "7. How to verify local processing",
    body: [
      "Open your browser's developer tools, select Network, clear the request list, and then choose and process a test photo. Model files should load only from residencyphoto.com, and application requests should not contain image files, blob contents, data URLs, filenames, or canvas output.",
      "ResidencyPhoto publishes these implementation details so users and security reviewers can independently inspect the browser's network activity rather than relying only on a privacy claim.",
    ],
  },
  {
    heading: "8. Children's privacy",
    body: [
      "ResidencyPhoto is intended for medical residency applicants and program staff, not children. We don't knowingly collect data from anyone under 13.",
    ],
  },
  {
    heading: "9. Changes to this policy",
    body: [
      "We may update this policy as the Service evolves. Material changes will be reflected by an updated \"last updated\" date below.",
    ],
  },
  {
    heading: "10. Contact",
    body: ["Questions about this policy? Email support@residencyphoto.com."],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg font-sans px-6 py-16">
      <div className="max-w-2xl mx-auto card bg-white p-8 md:p-10">
        <span className="tag">Privacy Policy</span>
        <h1 className="font-serif text-3xl text-heading mt-3">Privacy Policy</h1>
        <p className="text-xs text-muted mt-2">Last updated July 16, 2026</p>

        <div className="mt-8 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="font-serif text-lg text-heading border-b border-slate-100 pb-2 mb-3">
                {s.heading}
              </h2>
              <div className="space-y-3">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm text-body leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Link href="/" className="text-primary text-sm font-semibold hover:underline inline-block pt-8">
          Back to home
        </Link>
      </div>
    </div>
  );
}
