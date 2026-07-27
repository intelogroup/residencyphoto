import { Check, FileCheck2, ShieldCheck, SlidersHorizontal } from "lucide-react";

const CHECKLIST_SPECS = [
  { spec: "Width", target: "2.5 inches" },
  { spec: "Height", target: "3.5 inches" },
  { spec: "Resolution", target: "150 DPI" },
  { spec: "File size", target: "Under 150 KB" },
  { spec: "Format", target: "JPEG or PNG" },
  { spec: "Privacy", target: "Stays on your device" },
];

const WHY_IT_WORKS = [
  {
    title: "No Photoshop Needed",
    text: "Adjust zoom and position until your photo says Ready.",
    icon: SlidersHorizontal,
  },
  {
    title: "Nothing Uploaded",
    text: "Cropping and compression happen in your browser. Your photo never touches a server.",
    icon: ShieldCheck,
  },
  {
    title: "Built to the Real Spec",
    text: "Dimensions, resolution, and file size are checked against ERAS photo requirements.",
    icon: FileCheck2,
  },
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
          <p className="mt-4 text-pretty font-sans text-sm leading-6 text-body md:text-base">
            You don&apos;t need to understand DPI, dimensions, or compression. Upload your photo and we handle the technical details.
          </p>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark">ERAS-ready output</p>
                <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-heading">6 checks, one finished file</h3>
              </div>
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

          <aside className="border-t border-slate-200 bg-slate-50 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
            <span className="tag">Why People Trust It</span>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-heading">Built to Just Work</h3>

            <div className="mt-6 divide-y divide-slate-200">
              {WHY_IT_WORKS.map((item) => (
                <div key={item.title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm ring-1 ring-slate-200">
                    <item.icon aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-heading">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-body">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
