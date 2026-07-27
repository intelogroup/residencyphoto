# Dashboard Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the authenticated dashboard shell and home overview as a compact, modern task workspace without changing editor, history, settings, authentication, or billing behavior.

**Architecture:** Keep the existing tab/session model and panel components. Replace the decorative dashboard shell and overview composition with a clean top navigation, mobile bottom navigation, compact status rail, task-first action panel, latest-photo state, and concise workflow progress.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest.

## Global Constraints

- Scope is `/dashboard` shell and `OverviewPanel` only.
- Preserve query-string tab navigation and account menu behavior.
- Preserve existing editor, photo history, settings, auth, and billing functionality.
- Remove dashboard background photography, translucent pill navigation, large gradients, and decorative blur shapes.
- Label September 23, 2026 accurately as the date programs begin reviewing applications.
- Mobile uses compact top branding plus bottom tab navigation.

---

### Task 1: Dashboard deadline model

**Files:**
- Modify: `src/lib/dashboard-overview.ts`
- Modify: `src/lib/dashboard-overview.test.ts`

- [ ] Add a failing assertion for an explicit `reviewDateLabel`.
- [ ] Run the focused test and confirm the expected failure.
- [ ] Add the review-date label to the overview model.
- [ ] Run the focused test and confirm it passes.

### Task 2: Compact dashboard shell

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] Replace decorative background images and overlay layers with a neutral workspace.
- [ ] Replace floating pill navigation with a compact bordered top bar.
- [ ] Add icon-backed desktop tabs while preserving current state transitions.
- [ ] Add an accessible mobile bottom navigation with safe-area padding.
- [ ] Preserve account plan, menu, logout, and URL behavior.

### Task 3: Task-first overview

**Files:**
- Modify: `src/app/_components/dashboard/OverviewPanel.tsx`

- [ ] Replace the welcome header and gradient hero with a compact heading row and review-date status.
- [ ] Build the primary action workspace for empty and returning-photo states.
- [ ] Combine plan, photo count, device privacy, and ERAS checks into one status rail.
- [ ] Reduce the workflow to a concise three-step progress strip.
- [ ] Verify the empty and returning states remain actionable.

### Task 4: Verification

**Files:**
- Verify only.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Test desktop and 390px mobile layouts with authenticated or locally reproducible dashboard state.
