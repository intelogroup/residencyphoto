import Link from "next/link";

export const metadata = { title: "Terms of Service — ResidencyPhoto" };

const SECTIONS = [
  {
    heading: "1. Acceptance of terms",
    body: [
      "By accessing or using ResidencyPhoto (\"the Service\"), you agree to be bound by these Terms of Service. If you don't agree, don't use the Service.",
    ],
  },
  {
    heading: "2. What the Service does",
    body: [
      "ResidencyPhoto resizes, crops, and compresses a photo you provide to match the AAMC ERAS photo submission specification (2.5 × 3.5 in, 150 DPI, under 150 KB). All resizing and compression runs locally in your browser — see our Privacy Policy for details on where your photo goes.",
      "We are not affiliated with, endorsed by, or acting on behalf of the AAMC or the ERAS program. We build the tool to match published specs to the best of our knowledge, but you're responsible for confirming your final submission meets your program's requirements.",
    ],
  },
  {
    heading: "3. Accounts",
    body: [
      "Some features require an account. You're responsible for keeping your login credentials confidential and for all activity under your account.",
      "Authentication and account plan data are handled through our server-side service providers. Processed-photo history is stored locally in your browser and may be removed if you clear browser storage or change devices.",
    ],
  },
  {
    heading: "4. Payment and refunds",
    body: [
      "Paid plans are one-time purchases, not subscriptions. Prices are shown at checkout before you pay.",
      "If a paid feature doesn't work as described, contact us at support@residencyphoto.com within 14 days of purchase for a refund.",
    ],
  },
  {
    heading: "5. Acceptable use",
    body: [
      "Don't use the Service to process, store, or submit photos you don't have the right to use, or to attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service.",
    ],
  },
  {
    heading: "6. Your content",
    body: [
      "You retain all rights to the photos you process with ResidencyPhoto. We don't claim ownership over anything you process or export.",
    ],
  },
  {
    heading: "7. Disclaimer of warranties",
    body: [
      "The Service is provided \"as is,\" without warranties of any kind. We don't guarantee that a photo processed here will be accepted by ERAS, AAMC, or any residency program — final acceptance is entirely at their discretion.",
    ],
  },
  {
    heading: "8. Limitation of liability",
    body: [
      "To the fullest extent permitted by law, ResidencyPhoto and its operators aren't liable for indirect, incidental, or consequential damages arising from your use of the Service, including a rejected or delayed application.",
    ],
  },
  {
    heading: "9. Changes to these terms",
    body: [
      "We may update these terms as the Service evolves. Material changes will be reflected by an updated \"last updated\" date below. Continued use after a change means you accept the revised terms.",
    ],
  },
  {
    heading: "10. Contact",
    body: ["Questions about these terms? Email support@residencyphoto.com."],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg font-sans px-6 py-16">
      <div className="max-w-2xl mx-auto card bg-white p-8 md:p-10">
        <span className="tag">Terms of Service</span>
        <h1 className="font-serif text-3xl text-heading mt-3">Terms of Service</h1>
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
