"use client";

import { useEffect, useState } from "react";
import {
  formatCountdown,
  getErasDeadlineState,
  type CountdownParts,
} from "@/lib/eras-deadline";

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
    // Minutes are the finest unit shown; no need to re-render every second.
    const timer = window.setInterval(updateNow, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const state = getErasDeadlineState(now ?? new Date(0));
  const countdown = now ? formatCountdown(state.remainingMs) : emptyCountdown;

  const message =
    state.phase === "pre-submission"
      ? "ERAS submissions open September 2"
      : state.phase === "submission-window"
        ? "Programs begin reviewing September 23"
        : "Programs are reviewing applications now";

  const showTimer = state.phase !== "review-open" && now !== null;

  return (
    <div className="bg-primary-dark text-white">
      <p className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-2 text-center font-sans text-sm">
        <span className="font-semibold">{message}</span>
        {showTimer && (
          <span className="tabular-nums text-white/80">
            · {countdown.days}d {countdown.hours}h {countdown.minutes}m
          </span>
        )}
      </p>
    </div>
  );
}
