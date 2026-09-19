"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Download,
  Images,
  KeyRound,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";
import { clearHistory, type EraUser } from "@/lib/eras-storage";
import { isPhotoHistoryEnabled, setPhotoHistoryEnabled } from "@/lib/privacy-settings";
import { Modal } from "@/components/Modal";
import { authClient } from "@/lib/auth/client";

interface SettingsProps {
  user: EraUser;
  initialPanel?: "billing" | null;
  onOpenSupport: () => void;
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon aria-hidden={true} className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-heading">{title}</h2>
        {description && <p className="mt-0.5 text-sm leading-5 text-muted">{description}</p>}
      </div>
    </div>
  );
}

export function SettingsPanel({ user, initialPanel = null, onOpenSupport }: SettingsProps) {
  const router = useRouter();
  const plan = user.plan ?? "Free";
  const [savePhotoHistory, setSavePhotoHistory] = useState(() =>
    typeof window === "undefined" ? false : isPhotoHistoryEnabled()
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const planCardRef = useRef<HTMLElement>(null);
  const [billingHighlight, setBillingHighlight] = useState(false);

  // Deep-link from the account menu ("Plan & Billing"): scroll to the plan card.
  useEffect(() => {
    if (initialPanel !== "billing") return;
    planCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setBillingHighlight(true);
    const timer = setTimeout(() => setBillingHighlight(false), 2400);
    if (window.location.search.includes("panel=billing")) {
      window.history.replaceState(null, "", "/dashboard?tab=settings");
      window.dispatchEvent(new Event("dashboard-session-change"));
    }
    return () => clearTimeout(timer);
  }, [initialPanel]);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/account/export");
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "residencyphoto-data-export.json";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      if (!response.ok) throw new Error("Could not delete your data. Please try again.");
      await authClient.deleteUser();
      clearHistory();
      router.push("/");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Could not delete your account.");
      setDeleting(false);
    }
  };

  const handleUpgrade = () => {
    router.push("/checkout?plan=Resident");
  };

  const isPaid = plan !== "Free";
  const planPrice = plan === "Resident" ? "$4" : plan === "Program" ? "$19" : "—";

  return (
    <div className="mx-auto max-w-6xl animate-fade-in-up font-sans">
      <header className="mb-5">
        <p className="text-sm font-medium text-primary-dark">Account</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">Settings</h1>
        <p className="mt-1.5 text-sm text-muted">Manage your account, privacy, and plan.</p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <SectionTitle icon={UserRound} title="Account" description="Profile details and sign-in security." />
            </div>
            <div className="divide-y divide-slate-100">
              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-heading">{user.name}</p>
                  <p className="mt-0.5 truncate text-sm text-muted">{user.email}</p>
                </div>
                <button type="button" onClick={() => router.push("/account")} className="btn-ghost shrink-0 px-4 py-2 text-sm">
                  Manage Profile
                </button>
              </div>
              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                  <KeyRound aria-hidden={true} className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-heading">Password & Security</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">Change your password and review active sessions.</p>
                  </div>
                </div>
                <button type="button" onClick={() => router.push("/account/security")} className="btn-ghost shrink-0 px-4 py-2 text-sm">
                  Manage Security
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <SectionTitle icon={Images} title="Privacy" description="Control what this browser keeps." />
            </div>
            <label className="flex cursor-pointer items-start justify-between gap-5 px-5 py-5 transition-colors hover:bg-slate-50 sm:px-6">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-heading">Save Processed Photos</span>
                <span className="mt-1 block max-w-xl text-xs leading-5 text-muted">
                  Store copies only in this browser. Turning this off deletes existing local photo history.
                </span>
              </span>
              <span className="relative mt-0.5 inline-flex shrink-0">
                <input
                  id="savePhotoHistory"
                  name="savePhotoHistory"
                  type="checkbox"
                  checked={savePhotoHistory}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    setPhotoHistoryEnabled(enabled);
                    setSavePhotoHistory(enabled);
                    if (!enabled) clearHistory();
                  }}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2" />
                <span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-21">
          <section ref={planCardRef} className={`overflow-hidden rounded-xl border bg-white transition-shadow ${billingHighlight ? "border-primary/60 ring-2 ring-primary/30" : "border-primary/20"}`}>
            <div className="bg-primary/[0.07] px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-primary-dark">
                  <CreditCard aria-hidden={true} className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-[0.12em]">Plan & Billing</p>
                </div>
                <span className="pill-success">Current</span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-heading">{isPaid ? `${plan} Plan` : "Preview Access"}</p>
                  <p className="mt-0.5 text-xs text-muted">{isPaid ? "One-time purchase" : "Upgrade to download — $4"}</p>
                </div>
                <p className="text-2xl font-semibold tabular-nums text-heading">{planPrice}</p>
              </div>
            </div>
            <dl className="divide-y divide-slate-100 px-5 text-sm">
              <div className="flex justify-between gap-3 py-3.5"><dt className="text-muted">Downloads</dt><dd className="font-semibold text-heading">{isPaid ? "Unlimited" : "Available after $4 unlock"}</dd></div>
              <div className="flex justify-between gap-3 py-3.5"><dt className="text-muted">Next charge</dt><dd className="font-semibold text-heading">$0</dd></div>
            </dl>
            <div className="border-t border-slate-100 p-4">
              {!isPaid && (
                <button type="button" onClick={handleUpgrade} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#c9df67] bg-[#f1facb] px-4 py-2.5 text-sm font-semibold text-heading shadow-sm transition-[background-color,border-color,box-shadow] hover:border-[#b8d34d] hover:bg-[#e8f7aa] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <Sparkles aria-hidden={true} className="h-4 w-4 text-primary-dark" />
                  Unlock Downloads
                  <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold tabular-nums ring-1 ring-black/5">$4</span>
                </button>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="px-5 py-4">
              <SectionTitle icon={MessageSquareText} title="Help & Feedback" description="Questions, problems, or product suggestions." />
            </div>
            <div className="border-t border-slate-100 p-4">
              <button type="button" onClick={onOpenSupport} className="btn-ghost w-full px-4 py-2.5 text-sm">
                Contact Support
              </button>
              <a href="mailto:support@residencyphoto.com" className="mt-2 block text-center text-xs font-medium text-primary-dark hover:text-primary">
                support@residencyphoto.com
              </a>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="px-5 py-4">
              <SectionTitle icon={ShieldAlert} title="Data & Account" description="Export or permanently delete your data." />
            </div>
            <div className="grid border-t border-slate-100">
              <button type="button" onClick={handleExportData} disabled={exporting} className="flex items-center gap-3 px-5 py-3.5 text-left text-sm font-medium text-body transition-colors hover:bg-slate-50 hover:text-heading disabled:opacity-60">
                <Download aria-hidden={true} className="h-4 w-4 text-primary" />
                {exporting ? "Exporting…" : "Export My Data"}
              </button>
              <button type="button" onClick={() => setDeleteOpen(true)} className="flex items-center gap-3 border-t border-red-100 px-5 py-3.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700">
                <ShieldAlert aria-hidden={true} className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </section>
        </aside>
      </div>

      <Modal open={deleteOpen} onClose={() => (deleting ? null : setDeleteOpen(false))}>
        <h2 className="text-xl font-semibold text-heading">Delete your account?</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          This permanently deletes your plan, photo history, and sign-in — it cannot be undone.
        </p>
        {deleteError && <p aria-live="polite" className="mt-3 text-sm text-red-600">{deleteError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setDeleteOpen(false)} disabled={deleting} className="btn-ghost px-5 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </Modal>

    </div>
  );
}
