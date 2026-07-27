const PLANS = [
  {
    name: "Free",
    price: "$0",
    blurb: "Prepare and preview your ERAS photo.",
    features: ["Full photo editor", "Automatic ERAS checks", "Ready-file preview", "Download requires upgrade"],
    highlight: false,
    cta: "Try the Editor",
  },
  {
    name: "Resident",
    price: "$4",
    blurb: "For applicants submitting to ERAS.",
    features: [
      "Unlimited downloads",
      "No watermark",
      "Best quality compression",
      "Save your past photos",
    ],
    highlight: true,
    cta: "Get started",
  },
  {
    name: "Program",
    price: "$19",
    blurb: "For programs processing many candidates.",
    features: ["Bulk processing", "Team access", "Priority support"],
    highlight: false,
    cta: "Contact sales",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
        <span className="tag">Pricing</span>
        <h2 className="font-sans text-4xl font-bold text-heading">
          Simple, one-time pricing
        </h2>
        <p className="font-sans text-sm text-muted">
          No subscriptions. Pay once, download whenever you need to.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col relative p-6 rounded-lg bg-surface ${
              plan.highlight
                ? "border-2 border-primary shadow-lg"
                : "border border-border"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-semibold select-none">
                  Most popular
                </span>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-sans text-xl font-bold text-heading">{plan.name}</h3>
              <p className="font-sans text-sm text-muted mt-1">{plan.blurb}</p>
            </div>

            <div className="flex items-baseline gap-1 py-4">
              <span className="font-sans text-4xl font-bold text-heading">{plan.price}</span>
              <span className="font-sans text-sm text-muted">one-time</span>
            </div>

            <ul className="space-y-2.5 flex-grow border-t border-border pt-5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 font-sans text-sm text-body">
                  <span aria-hidden="true" className="text-primary font-semibold shrink-0">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href={plan.name === "Free" ? "/auth/sign-in" : `/checkout?plan=${plan.name}`}
              className={`w-full text-center block mt-6 ${
                plan.highlight ? "btn-primary" : "btn-ghost"
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
