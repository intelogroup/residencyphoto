import type { HistoryRecord } from "./eras-storage";

const ERAS_OPEN_DATE = new Date("2026-09-23T09:00:00");
const DAY_IN_MS = 1000 * 60 * 60 * 24;

export interface DashboardOverview {
  daysRemaining: number;
  reviewDateLabel: string;
  hasPhotos: boolean;
  latestPhoto: HistoryRecord | null;
  photoCount: number;
}

export function buildDashboardOverview(history: HistoryRecord[], now: Date): DashboardOverview {
  const daysRemaining = Math.max(0, Math.ceil((ERAS_OPEN_DATE.getTime() - now.getTime()) / DAY_IN_MS));

  return {
    daysRemaining,
    reviewDateLabel: "September 23, 2026",
    hasPhotos: history.length > 0,
    latestPhoto: history[0] ?? null,
    photoCount: history.length,
  };
}
