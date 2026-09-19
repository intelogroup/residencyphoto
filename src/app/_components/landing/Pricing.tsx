const PLANS = [
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
    cta: "Get Program",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
        <h2 className="font-sans text-3xl font-bold tracking-tight text-heading text-balance">
          Simple, one-time pricing
        </h2>
        <p className="font-sans text-sm leading-6 text-muted">
          No subscriptions. Pay once, download whenever you need to.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col relative p-6 rounded-xl bg-white ${
              plan.highlight
                ? "border border-primary shadow-sm"
                : "border border-border shadow-sm"
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
              <h3 className="font-sans text-xl font-bold tracking-tight text-heading">{plan.name}</h3>
              <p className="font-sans text-sm leading-5 text-muted mt-1">{plan.blurb}</p>
            </div>

            <div className="flex items-baseline gap-1.5 py-4">
              <span className="font-sans text-4xl font-bold tracking-tight text-heading">{plan.price}</span>
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
              href={`/checkout?plan=${plan.name}`}
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
