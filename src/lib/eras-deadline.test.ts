import { describe, expect, it } from "vitest";
import { formatCountdown, getErasDeadlineState } from "./eras-deadline";

describe("getErasDeadlineState", () => {
  it("counts down to applicant submission opening before September 2", () => {
    const state = getErasDeadlineState(new Date("2026-09-02T12:59:59.000Z"));

    expect(state.phase).toBe("pre-submission");
    expect(state.target.toISOString()).toBe("2026-09-02T13:00:00.000Z");
    expect(state.remainingMs).toBe(1_000);
  });

  it("counts down to program review after submission opens", () => {
    const state = getErasDeadlineState(new Date("2026-09-02T13:00:00.000Z"));

    expect(state.phase).toBe("submission-window");
    expect(state.target.toISOString()).toBe("2026-09-23T13:00:00.000Z");
  });

  it("enters the danger zone when programs can review applications", () => {
    const state = getErasDeadlineState(new Date("2026-09-23T13:00:00.000Z"));

    expect(state.phase).toBe("review-open");
    expect(state.remainingMs).toBe(0);
  });
});

describe("formatCountdown", () => {
  it("splits milliseconds into whole countdown units", () => {
    const total =
      2 * 24 * 60 * 60 * 1_000 +
      3 * 60 * 60 * 1_000 +
      4 * 60 * 1_000 +
      5 * 1_000;

    expect(formatCountdown(total)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  it("never returns negative values", () => {
    expect(formatCountdown(-1)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});
