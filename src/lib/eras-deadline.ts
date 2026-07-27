export const ERAS_SUBMISSION_OPENS = new Date("2026-09-02T13:00:00.000Z");
export const ERAS_PROGRAM_REVIEW_OPENS = new Date("2026-09-23T13:00:00.000Z");

export type ErasDeadlinePhase =
  | "pre-submission"
  | "submission-window"
  | "review-open";

export type ErasDeadlineState = {
  phase: ErasDeadlinePhase;
  target: Date;
  remainingMs: number;
};

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function getErasDeadlineState(now: Date): ErasDeadlineState {
  if (now < ERAS_SUBMISSION_OPENS) {
    return {
      phase: "pre-submission",
      target: ERAS_SUBMISSION_OPENS,
      remainingMs: ERAS_SUBMISSION_OPENS.getTime() - now.getTime(),
    };
  }

  if (now < ERAS_PROGRAM_REVIEW_OPENS) {
    return {
      phase: "submission-window",
      target: ERAS_PROGRAM_REVIEW_OPENS,
      remainingMs: ERAS_PROGRAM_REVIEW_OPENS.getTime() - now.getTime(),
    };
  }

  return {
    phase: "review-open",
    target: ERAS_PROGRAM_REVIEW_OPENS,
    remainingMs: 0,
  };
}

export function formatCountdown(milliseconds: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1_000));

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}
