"use client";

import { useEffect, useState } from "react";
import { useOnScreen } from "./useOnScreen";

function useCountUp(target: number, active: boolean, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

const STATS_DATA = [
  { label: "Things we check", target: 6, suffix: "", sub: "Size, resolution, file weight — every ERAS rule", isRating: false },
  { label: "Match rate", target: 100, suffix: "%", sub: "Your photo comes out exactly to spec", isRating: false },
  { label: "Minutes it takes", target: 1, suffix: "", sub: "Upload, adjust, download", isRating: false },
];

export function Stats() {
  const { ref, isVisible } = useOnScreen<HTMLDivElement>(0.2);
  
  const val1 = useCountUp(STATS_DATA[0].target, isVisible);
  const val2 = useCountUp(STATS_DATA[1].target, isVisible);
  const val3 = useCountUp(STATS_DATA[2].target, isVisible);

  const values = [val1, val2, val3];

  return (
    <section ref={ref} className="hairline-b bg-surface">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {STATS_DATA.map((stat, i) => {
          let displayVal = "";
          if (stat.isRating) {
            displayVal = `${(values[i] / 10).toFixed(1)}${stat.suffix}`;
          } else {
            displayVal = `${values[i]}${stat.suffix}`;
          }

          return (
            <div
              key={stat.label}
              className="p-8 md:py-10 md:px-12 flex flex-col justify-between group hover:bg-[#FAFBFC] transition-colors duration-200"
            >
              <div className="space-y-1">
                <div className="font-sans text-4xl md:text-5xl font-bold text-heading tracking-tight tabular-nums">
                  {isVisible ? displayVal : `0${stat.suffix}`}
                </div>
                <div className="font-sans text-sm font-semibold text-heading">
                  {stat.label}
                </div>
                <p className="font-sans text-xs text-muted">
                  {stat.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
