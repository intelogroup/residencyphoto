"use client";

import { useEffect, useState } from "react";
import {
  formatCountdown,
  getErasDeadlineState,
  type CountdownParts,
  type ErasDeadlinePhase,
} from "@/lib/eras-deadline";

const phaseContent: Record<
  ErasDeadlinePhase,
  {
    heading: string;
    date: string;
    description: string;
    tone: string;
  }
> = {
  "pre-submission": {
    heading: "Certify & Submit opens in",
    date: "September 2, 2026 at 9:00 AM ET",
    description:
      "You can certify, submit, and pay application fees when the window opens. Review carefully first: most application sections cannot be changed after certification.",
    tone: "border-primary/25 bg-primary/5 text-primary-dark",
  },
  "submission-window": {
    heading: "Programs begin reviewing in",
    date: "September 23, 2026 at 9:00 AM ET",
    description:
      "Applications submitted during this window are available when programs begin reviewing. Finish early enough to leave room for a final accuracy check.",
    tone: "border-amber-300 bg-amber-50 text-amber-900",
  },
  "review-open": {
    heading: "Programs are reviewing applications now",
    date: "Review opened September 23, 2026 at 9:00 AM ET",
    description:
      "Applications can still be submitted, but programs may already be screening candidates. Submit as soon as your application is complete and accurate.",
    tone: "border-red-300 bg-red-50 text-red-900",
  },
};

const emptyCountdown: CountdownParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

export function ErasDeadlineCountdown() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateNow = () => setNow(new Date());
    updateNow();
    const timer = window.setInterval(updateNow, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  const state = getErasDeadlineState(now ?? new Date(0));
  const content = phaseContent[state.phase];
  const countdown = now ? formatCountdown(state.remainingMs) : emptyCountdown;
  const showTimer = state.phase !== "review-open";

  return (
    <section
      aria-labelledby="eras-deadline-heading"
      className="relative z-20 mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6"
    >
      <div className={`rounded-2xl border px-4 py-4 shadow-sm sm:px-6 ${content.tone}`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 id="eras-deadline-heading" className="text-lg font-bold text-heading sm:text-xl">
              {content.heading}
            </h2>
            <p className="mt-1 text-sm font-semibold">{content.date}</p>
            <p className="mt-2 text-sm leading-6 text-body">{content.description}</p>
          </div>

          {showTimer && (
            <div
              aria-live="polite"
              aria-atomic="true"
              aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, and ${countdown.seconds} seconds remaining`}
              className="grid grid-cols-4 gap-2 sm:gap-3"
            >
              <TimeUnit value={countdown.days} label="Days" ready={now !== null} />
              <TimeUnit value={countdown.hours} label="Hours" ready={now !== null} />
              <TimeUnit value={countdown.minutes} label="Minutes" ready={now !== null} />
              <TimeUnit value={countdown.seconds} label="Seconds" ready={now !== null} />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

function TimeUnit({
  value,
  label,
  ready,
}: {
  value: number;
  label: string;
  ready: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-current/15 bg-white/75 px-2 py-3 text-center shadow-sm sm:min-w-20 sm:px-4">
      <span className="block text-xl font-bold tabular-nums text-heading sm:text-2xl">
        {ready ? String(value).padStart(2, "0") : "—"}
      </span>
      <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide sm:text-xs">
        {label}
      </span>
    </div>
  );
}
