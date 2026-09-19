import { Check } from "lucide-react";

const CHECKLIST_SPECS = [
  { spec: "Width", target: "2.5 inches" },
  { spec: "Height", target: "3.5 inches" },
  { spec: "Resolution", target: "150 DPI" },
  { spec: "File size", target: "Under 150 KB" },
  { spec: "Format", target: "JPEG or PNG" },
  { spec: "Privacy", target: "Stays on your device" },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-y border-slate-200 bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="tag">What We Check</span>
          <h2 className="mt-4 text-balance font-sans text-3xl font-bold leading-tight text-heading md:text-4xl">
            Every ERAS Photo Requirement, Checked Automatically
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle">
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
              <h3 className="text-xl font-semibold tracking-tight text-heading">6 checks, one finished file</h3>
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                <Check aria-hidden="true" className="h-5 w-5" />
              </div>
            </div>

            <dl className="mt-1 grid sm:grid-cols-2">
              {CHECKLIST_SPECS.map((item, index) => (
                <div
                  key={item.spec}
                  className={`flex min-w-0 items-center gap-3 border-b border-slate-100 py-4 sm:px-4 ${
                    index % 2 === 0 ? "sm:border-r sm:pl-0" : "sm:pr-0"
                  } ${index >= CHECKLIST_SPECS.length - 2 ? "sm:border-b-0" : ""}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <dt className="min-w-0 flex-1 text-sm font-medium text-body">{item.spec}</dt>
                  <dd className="shrink-0 text-right text-sm font-semibold tabular-nums text-heading">{item.target}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
