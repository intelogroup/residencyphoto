# ERAS Countdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible staged landing-page countdown for the September 2, 2026 applicant submission opening and September 23, 2026 program review opening.

**Architecture:** Keep deadline calculation in a small pure TypeScript module so phase boundaries can be unit tested. Render a client-side banner below the sticky navigation, update it once per second, and use server-rendered placeholder values until hydration to avoid mismatches.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest.

## Global Constraints

- Use September 2, 2026 at 9:00 a.m. ET for applicant submission opening.
- Use September 23, 2026 at 9:00 a.m. ET for program review opening.
- Before September 2, show “Certify & Submit opens in”.
- From September 2 through September 23, show “Programs begin reviewing in”.
- After September 23, show that programs are reviewing applications now.
- Explain that most application text cannot be changed after certification without claiming the entire application is locked forever.
- Link deadline attribution to the official AAMC residency timeline.

---

### Task 1: Deadline state model

**Files:**
- Create: `src/lib/eras-deadline.ts`
- Test: `src/lib/eras-deadline.test.ts`

**Interfaces:**
- Produces: `getErasDeadlineState(now: Date): ErasDeadlineState`
- Produces: `formatCountdown(milliseconds: number): CountdownParts`

- [ ] Write tests covering the pre-opening, submission-window, and review phases plus countdown formatting.
- [ ] Run `npm test -- src/lib/eras-deadline.test.ts` and verify the tests fail because the module is missing.
- [ ] Implement fixed UTC instants for the two 9:00 a.m. ET boundaries and pure phase/countdown helpers.
- [ ] Run `npm test -- src/lib/eras-deadline.test.ts` and verify all tests pass.

### Task 2: Landing-page deadline banner

**Files:**
- Create: `src/app/_components/landing/ErasDeadlineCountdown.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getErasDeadlineState(now)` and `formatCountdown(milliseconds)`.
- Produces: an accessible `section` placed between `Nav` and `Hero`.

- [ ] Build a responsive banner with four time units, phase-specific color and copy, exact Eastern date, concise certification guidance, and an AAMC source link.
- [ ] Update the current time every second and mark the changing countdown as a polite live region.
- [ ] Render the component below navigation in `src/app/page.tsx`.
- [ ] Run `npm run lint` and fix any countdown-specific violations.

### Task 3: Verification

**Files:**
- Verify only; no new production files.

**Interfaces:**
- Consumes: the completed banner and deadline state tests.
- Produces: browser and automated-test evidence.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start the app and confirm desktop and 375px mobile layouts in a browser.
- [ ] Confirm no console errors, the timer ticks, the AAMC link is present, and the current July 2026 phase counts down to September 2.
