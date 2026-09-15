"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const STEPS_DATA = [
  {
    title: "Upload your photo",
    body: "Drag and drop your headshot from your computer or phone. JPEG, PNG, and HEIC all work.",
  },
  {
    title: "Center it",
    body: "We automatically frame your head and shoulders so your face sits exactly where ERAS expects it.",
  },
  {
    title: "Fine-tune the size",
    body: "We scale and compress it to fit 2.5 x 3.5 inches at 150 DPI, under the 150 KB limit — automatically.",
  },
  {
    title: "Download",
    body: "Save your finished photo straight to your device. Nothing is ever stored on a server.",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS_DATA.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 md:py-28 hairline-t hairline-b">
      <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
        <span className="tag">How it works</span>
        <h2 className="font-sans text-4xl font-bold text-heading">
          Four steps, one minute
        </h2>
        <p className="font-sans text-sm text-muted">
          No photo editing experience needed — just upload and go.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-12 items-center">
        {/* Left Side: Step Selectors */}
        <div className="md:col-span-2 space-y-3">
          {STEPS_DATA.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={idx}
                onClick={() => { setActiveStep(idx); setIsHovered(true); }}
                onMouseEnter={() => { setActiveStep(idx); setIsHovered(true); }}
                onMouseLeave={() => setIsHovered(false)}
                className={`w-full text-left p-5 rounded-lg transition-colors duration-200 cursor-pointer ${
                  isActive ? "bg-primary/5 border border-primary/30" : "border border-transparent hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive ? "bg-primary text-white" : "bg-slate-100 text-muted"
                  }`}>
                    {idx + 1}
                  </span>
                  <h3 className="font-sans text-sm font-semibold text-heading">
                    {step.title}
                  </h3>
                </div>
                <p className="font-sans text-[13px] text-muted leading-relaxed pl-9">
                  {step.body}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Side: Preview panel */}
        <div className="md:col-span-3">
          <div className="card p-8 h-[360px] flex flex-col justify-center">
            {activeStep === 0 && (
              <div className="space-y-4 animate-fade-in-up text-center">
                <div className="inline-flex p-4 bg-primary/5 rounded-full text-primary mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-heading">Just drop your photo in</p>
                <p className="text-sm text-muted">We support JPEG, PNG, and HEIC files</p>
              </div>
            )}

            {activeStep === 1 && (
              <div className="flex items-center gap-6 animate-fade-in-up">
                <div className="relative rounded-xl bg-slate-50 w-28 aspect-[2.5/3.5] overflow-hidden shrink-0">
                  <div className="absolute inset-2 border-2 border-dashed border-primary/60 rounded-full" />
                  <Image
                    src="/professional_headshot.jpg"
                    alt="Centered crop guide"
                    width={112}
                    height={157}
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="font-sans text-sm font-semibold text-heading">Perfectly framed</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    We line up your eyes and shoulders so your face sits right where it should.
                  </p>
                  <span className="pill-success">Nicely centered</span>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Size</span>
                  <span className="text-sm font-semibold text-heading">2.5 x 3.5 in</span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-4">
                  <span className="text-sm text-muted">Resolution</span>
                  <span className="text-sm font-semibold text-heading">150 DPI</span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-4">
                  <span className="text-sm text-muted">File size</span>
                  <span className="text-sm font-semibold text-primary">124 KB — under the limit</span>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4 animate-fade-in-up text-center">
                <div className="inline-flex p-3 bg-primary/10 rounded-full text-primary mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-heading text-sm font-semibold">All set</h4>
                <p className="text-sm text-muted max-w-xs mx-auto">
                  Your photo matches every ERAS requirement, ready to download.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
