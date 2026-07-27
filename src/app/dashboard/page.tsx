"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpCircle, CreditCard, Home, Images, LogOut, MessageSquareText, Settings, SlidersHorizontal, UserRound } from "lucide-react";
import { OverviewPanel } from "../_components/dashboard/OverviewPanel";
import { EditorPanel } from "../_components/dashboard/EditorPanel";
import { HistoryPanel } from "../_components/dashboard/HistoryPanel";
import { SettingsPanel } from "../_components/dashboard/SettingsPanel";
import { type HistoryRecord } from "@/lib/eras-storage";
import { createDashboardInitialState, getDashboardSearchSnapshot, getDashboardServerSearchSnapshot, getOnboardingServerSnapshot, getOnboardingSnapshot, resolveDashboardClientState, subscribeToDashboardSession, type DashboardTab, type SettingsPanelTarget } from "@/lib/dashboard-session";
import { Modal } from "@/components/Modal";
import { authClient } from "@/lib/auth/client";
import { mapNeonSessionToEraUser } from "@/lib/auth-session";
import { SupportModal } from "../_components/dashboard/SupportModal";

const ONBOARDED_KEY = "eras_onboarded";

export default function DashboardPage() {
  const router = useRouter();
  const session = authClient.useSession();
  const search = useSyncExternalStore(subscribeToDashboardSession, getDashboardSearchSnapshot, getDashboardServerSearchSnapshot);
  const hasCompletedOnboarding = useSyncExternalStore(subscribeToDashboardSession, getOnboardingSnapshot, getOnboardingServerSnapshot);
  const [billingPlan, setBillingPlan] = useState<"Free" | "Resident" | "Program">("Free");
  const neonUser = mapNeonSessionToEraUser(session.data);
  const neonUserId = neonUser?.authId;
  const authenticatedUser = neonUser ? { ...neonUser, plan: billingPlan } : null;
  const dashboardSession = session.isPending
    ? createDashboardInitialState()
    : resolveDashboardClientState(search, authenticatedUser, hasCompletedOnboarding);
  const { activeTab, settingsTarget, showOnboarding, user } = dashboardSession;
  const [settingsPanelInstance, setSettingsPanelInstance] = useState(0);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const [photoToEdit, setPhotoToEdit] = useState<HistoryRecord | null>(null);

  const openPhotoInEditor = (item: HistoryRecord) => {
    setPhotoToEdit(item);
    changeTab("editor");
  };

  const changeTab = (tab: DashboardTab, panel: SettingsPanelTarget = null) => {
    if (panel) setSettingsPanelInstance((instance) => instance + 1);
    const query = tab === "overview" ? "" : `?tab=${tab}${panel ? `&panel=${panel}` : ""}`;
    window.history.replaceState(null, "", `/dashboard${query}`);
    window.dispatchEvent(new Event("dashboard-session-change"));
  };

  useEffect(() => {
    if (dashboardSession.isReady && !user) router.replace("/auth/sign-in");
  }, [dashboardSession.isReady, router, user]);

  useEffect(() => {
    if (!neonUserId) return;
    let active = true;
    void fetch("/api/profile")
      .then(async (response) => {
        const data = (await response.json()) as { plan?: "Free" | "Resident" | "Program" };
        if (response.ok && data.plan && active) setBillingPlan(data.plan);
      })
      .catch((error) => console.error("Unable to load billing plan", error));
    return () => {
      active = false;
    };
  }, [neonUserId]);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const closeMenu = (event: MouseEvent) => {
      if (!avatarMenuRef.current?.contains(event.target as Node)) setAvatarMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAvatarMenuOpen(false);
    };
    window.addEventListener("mousedown", closeMenu);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [avatarMenuOpen]);

  const openAccountSection = (tab: DashboardTab, panel: SettingsPanelTarget = null) => {
    changeTab(tab, panel);
    setAvatarMenuOpen(false);
  };

  const openSupport = () => {
    setAvatarMenuOpen(false);
    setSupportOpen(true);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setAvatarMenuOpen(false);
    router.replace("/auth/sign-in");
    router.refresh();
  };

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    window.dispatchEvent(new Event("dashboard-session-change"));
  };

  if (!dashboardSession.isReady || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="text-sm text-muted">Signing you in…</div>
        </div>
      </div>
    );
  }

  const TABS: { key: DashboardTab; label: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }> }[] = [
    { key: "overview", label: "Home", icon: Home },
    { key: "editor", label: "Editor", icon: SlidersHorizontal },
    { key: "history", label: "Photos", icon: Images },
  ];
  const isFreePlan = (user.plan ?? "Free") === "Free";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8f7] pb-20 font-sans md:pb-0">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-cover bg-center opacity-24 pointer-events-none"
        style={{ backgroundImage: "url('/nature-bg.jpg')" }}
      />
      <div aria-hidden="true" className="fixed inset-0 bg-[#f6f8f7]/62 pointer-events-none" />
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity">
            <svg aria-hidden="true" className="w-6 h-6 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
              <rect width="18" height="18" x="3" y="3" rx="5" />
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <path d="M7 7h.01M17 7h.01" strokeWidth={3} strokeLinecap="round" />
            </svg>
            <span translate="no" className="font-sans text-sm font-bold text-heading tracking-tight">ResidencyPhoto</span>
          </Link>

          {/* Tabs */}
          <nav aria-label="Dashboard navigation" className="hidden items-center gap-1 font-sans text-sm font-semibold md:flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => changeTab(tab.key)}
                aria-pressed={activeTab === tab.key}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary-dark"
                    : "text-body hover:bg-slate-50 hover:text-heading"
                }`}
              >
                <tab.icon aria-hidden={true} className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Account menu */}
          <div ref={avatarMenuRef} className="relative flex shrink-0 items-center gap-2">
            {isFreePlan && (
              <Link
                href="/checkout?plan=Resident"
                className="hidden items-center gap-1.5 rounded-full bg-primary py-1.5 pl-2.5 pr-3 text-xs text-white shadow-sm transition-[background-color,box-shadow] duration-150 hover:bg-primary-dark hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:inline-flex"
              >
                <ArrowUpCircle aria-hidden={true} className="h-3.5 w-3.5" />
                <span className="font-semibold">Upgrade</span>
                <span className="rounded-full bg-white/20 px-1 py-0.5 text-[10px] font-bold tabular-nums text-white ring-1 ring-white/30">$4</span>
              </Link>
            )}
            <span className="hidden rounded-md border border-primary/15 bg-primary/5 px-2 py-1 text-[11px] font-semibold leading-none text-primary-dark sm:inline-flex">
              {user.plan ?? "Free"}
            </span>
            <button
              type="button"
              onClick={() => setAvatarMenuOpen((open) => !open)}
              aria-expanded={avatarMenuOpen}
              aria-controls="account-menu"
              aria-label="Open account menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-bold uppercase text-primary transition-[background-color,border-color,transform] duration-150 hover:border-primary/40 hover:bg-primary/15 active:scale-95"
            >
              {user.name.charAt(0)}
            </button>

            {avatarMenuOpen && (
              <div id="account-menu" role="menu" aria-label="Account menu" className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary">{user.name.charAt(0)}</div>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-heading">{user.name}</p><p className="truncate text-xs text-muted">{user.email}</p></div>
                </div>
                <div className="my-1 border-t border-slate-100" />
                <button type="button" role="menuitem" onClick={() => router.push("/account")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-body transition-colors duration-150 hover:bg-slate-50 hover:text-heading"><UserRound aria-hidden={true} className="h-4 w-4 text-primary" />Manage Profile</button>
                <button type="button" role="menuitem" onClick={() => router.push("/account/security")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-body transition-colors duration-150 hover:bg-slate-50 hover:text-heading"><Settings aria-hidden={true} className="h-4 w-4 text-primary" />Account Security</button>
                <button type="button" role="menuitem" onClick={() => openAccountSection("settings")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-body transition-colors duration-150 hover:bg-slate-50 hover:text-heading"><Settings aria-hidden={true} className="h-4 w-4 text-primary" />Settings</button>
                <button type="button" role="menuitem" onClick={() => openAccountSection("settings", "billing")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-body transition-colors duration-150 hover:bg-slate-50 hover:text-heading"><CreditCard aria-hidden={true} className="h-4 w-4 text-primary" />Plan & Billing</button>
                <button type="button" role="menuitem" onClick={() => openAccountSection("history")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-body transition-colors duration-150 hover:bg-slate-50 hover:text-heading"><Images aria-hidden={true} className="h-4 w-4 text-primary" />My Photos</button>
                <div className="my-1 border-t border-slate-100" />
                <button type="button" role="menuitem" onClick={openSupport} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-body transition-colors duration-150 hover:bg-slate-50 hover:text-heading"><MessageSquareText aria-hidden={true} className="h-4 w-4 text-primary" />Help & Feedback</button>
                <div className="my-1 border-t border-slate-100" />
                <button type="button" role="menuitem" onClick={() => void handleLogout()} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"><LogOut aria-hidden={true} className="h-4 w-4" />Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === "overview" && (
          <OverviewPanel user={user} onStartEditor={() => changeTab("editor")} onOpenPhoto={openPhotoInEditor} />
        )}
        {activeTab === "editor" && (
          <EditorPanel
            user={user}
            initialPhoto={
              photoToEdit ? { name: photoToEdit.name, sizeKB: photoToEdit.sizeKB, thumbnail: photoToEdit.thumbnail } : null
            }
            onInitialPhotoConsumed={() => setPhotoToEdit(null)}
          />
        )}
        {activeTab === "history" && <HistoryPanel onOpenPhoto={openPhotoInEditor} />}
        {activeTab === "settings" && <SettingsPanel key={`${settingsTarget ?? "default"}-${settingsPanelInstance}`} user={user} initialPanel={settingsTarget} onOpenSupport={openSupport} />}
      </main>

      <nav
        aria-label="Mobile dashboard navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden"
      >
        <div className={`mx-auto grid max-w-md ${isFreePlan ? "grid-cols-4" : "grid-cols-3"}`}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              aria-pressed={activeTab === tab.key}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition-colors ${
                activeTab === tab.key ? "bg-primary/10 text-primary-dark" : "text-muted hover:bg-slate-50 hover:text-heading"
              }`}
            >
              <tab.icon aria-hidden={true} className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
          {isFreePlan && (
            <Link
              href="/checkout?plan=Resident"
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg bg-primary px-2 text-[11px] font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <ArrowUpCircle aria-hidden={true} className="h-4 w-4" />
              Upgrade · $4
            </Link>
          )}
        </div>
      </nav>

      {/* First-run onboarding */}
      <Modal open={showOnboarding} onClose={dismissOnboarding} maxWidth="max-w-lg">
        <span className="tag mb-2">Welcome</span>
        <h3 className="font-sans text-2xl font-semibold text-heading mt-1 mb-4">
          Let&apos;s get your ERAS photo ready
        </h3>
        <ol className="space-y-4 mb-6">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <span className="text-sm text-body leading-relaxed">Upload a high-resolution headshot with a plain background.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <span className="text-sm text-body leading-relaxed">Crop to the guide and adjust brightness/warmth as needed.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <span className="text-sm text-body leading-relaxed">Download — sized and compressed to exact AAMC ERAS specs.</span>
          </li>
        </ol>
        <button onClick={dismissOnboarding} className="w-full btn-primary">
          Get started
        </button>
      </Modal>

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} user={user} />
    </div>
  );
}
