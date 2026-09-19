"use client";

import { useEffect, useState } from "react";
import {
  formatCountdown,
  getErasDeadlineState,
} from "@/lib/eras-deadline";

export function ErasDeadlineCountdown() {
  // Initialize with the real date so the first paint (SSR + hydration)
  // already shows the correct phase. The old `null` initial state rendered
  // the pre-submission message until the effect ran, showing a stale
  // "ERAS submissions open September 2" after that date had passed.
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // Minutes are the finest unit shown; no need to re-render every second.
    const timer = window.setInterval(() => setNow(new Date()), 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const state = getErasDeadlineState(now);
  const countdown = formatCountdown(state.remainingMs);

  const message =
    state.phase === "pre-submission"
      ? "ERAS submissions open September 2"
      : state.phase === "submission-window"
        ? "Programs begin reviewing September 23"
        : "Programs are reviewing applications now";

  const showTimer = state.phase !== "review-open";

  return (
    <div className="flex justify-center px-4 pt-4">
      <div className="w-fit max-w-full rounded-2xl bg-primary-dark px-5 py-2 text-white shadow-sm">
        <p className="flex items-center justify-center gap-2 text-center font-sans text-sm">
          <span className="font-semibold">{message}</span>
          {showTimer && (
            <span className="tabular-nums text-white/80">
              · {countdown.days}d {countdown.hours}h {countdown.minutes}m
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
