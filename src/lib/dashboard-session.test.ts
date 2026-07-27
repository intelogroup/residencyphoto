import { describe, expect, it } from "vitest";
import { createDashboardInitialState, resolveDashboardClientState } from "./dashboard-session";

const user = { email: "olivia@example.com", name: "Olivia" };

describe("dashboard session state", () => {
  it("uses the same empty shell for the server and the first client render", () => {
    expect(createDashboardInitialState()).toEqual({
      activeTab: "overview",
      isReady: false,
      settingsTarget: null,
      showOnboarding: false,
      user: null,
    });
  });

  it("hydrates the stored user and URL-selected billing panel after mount", () => {
    expect(resolveDashboardClientState("?tab=settings&panel=billing", user, false)).toEqual({
      activeTab: "settings",
      isReady: true,
      settingsTarget: "billing",
      showOnboarding: true,
      user,
    });
  });
});
