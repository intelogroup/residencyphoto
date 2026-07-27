import { describe, expect, it } from "vitest";
import { buildDashboardOverview } from "./dashboard-overview";
import type { HistoryRecord } from "./eras-storage";

const latestPhoto: HistoryRecord = {
  id: "latest-photo",
  name: "eras-headshot.jpg",
  sizeKB: 143,
  date: "Jul 15, 2026",
  thumbnail: "data:image/jpeg;base64,latest",
};

describe("buildDashboardOverview", () => {
  it("guides a new user to their first upload", () => {
    const overview = buildDashboardOverview([], new Date("2026-07-15T12:00:00"));

    expect(overview.hasPhotos).toBe(false);
    expect(overview.photoCount).toBe(0);
    expect(overview.latestPhoto).toBeNull();
    expect(overview.daysRemaining).toBe(70);
    expect(overview.reviewDateLabel).toBe("September 23, 2026");
  });

  it("surfaces the most recent photo for a returning user", () => {
    const overview = buildDashboardOverview([latestPhoto], new Date("2026-09-24T12:00:00"));

    expect(overview.hasPhotos).toBe(true);
    expect(overview.photoCount).toBe(1);
    expect(overview.latestPhoto).toBe(latestPhoto);
    expect(overview.daysRemaining).toBe(0);
    expect(overview.reviewDateLabel).toBe("September 23, 2026");
  });
});
