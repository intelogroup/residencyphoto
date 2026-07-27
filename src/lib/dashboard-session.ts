import type { EraUser } from "./eras-storage";

export type DashboardTab = "overview" | "editor" | "history" | "settings";
export type SettingsPanelTarget = "billing" | null;

export interface DashboardSessionState {
  activeTab: DashboardTab;
  isReady: boolean;
  settingsTarget: SettingsPanelTarget;
  showOnboarding: boolean;
  user: EraUser | null;
}

const TAB_KEYS: DashboardTab[] = ["overview", "editor", "history", "settings"];
const INITIAL_DASHBOARD_STATE: DashboardSessionState = {
  activeTab: "overview",
  isReady: false,
  settingsTarget: null,
  showOnboarding: false,
  user: null,
};
let cachedClientSnapshot: DashboardSessionState | null = null;
let cachedClientSignature = "";

export function createDashboardInitialState(): DashboardSessionState {
  return INITIAL_DASHBOARD_STATE;
}

export function resolveDashboardClientState(search: string, user: EraUser | null, hasCompletedOnboarding: boolean): DashboardSessionState {
  const params = new URLSearchParams(search);
  const requestedTab = params.get("tab");
  const activeTab = requestedTab && TAB_KEYS.includes(requestedTab as DashboardTab) ? (requestedTab as DashboardTab) : "overview";
  const settingsTarget = activeTab === "settings" && params.get("panel") === "billing" ? "billing" : null;

  return {
    activeTab,
    isReady: true,
    settingsTarget,
    showOnboarding: !!user && !hasCompletedOnboarding,
    user,
  };
}

export function getDashboardClientSnapshot(): DashboardSessionState {
  const state = resolveDashboardClientState(window.location.search, null, !!localStorage.getItem("eras_onboarded"));
  const signature = JSON.stringify(state);

  if (cachedClientSnapshot && cachedClientSignature === signature) return cachedClientSnapshot;

  cachedClientSnapshot = state;
  cachedClientSignature = signature;
  return state;
}

export function getDashboardSearchSnapshot(): string {
  return window.location.search;
}

export function getDashboardServerSearchSnapshot(): string {
  return "";
}

export function getOnboardingSnapshot(): boolean {
  return !!localStorage.getItem("eras_onboarded");
}

export function getOnboardingServerSnapshot(): boolean {
  return true;
}

export function subscribeToDashboardSession(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener("popstate", callback);
  window.addEventListener("dashboard-session-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("popstate", callback);
    window.removeEventListener("dashboard-session-change", callback);
  };
}
