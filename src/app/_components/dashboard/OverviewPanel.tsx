"use client";

import Image from "next/image";
import React, { useState } from "react";
import { ArrowRight, CalendarDays, Check, CircleCheck, Edit3, ImagePlus, LockKeyhole, ScanLine } from "lucide-react";
import { buildDashboardOverview } from "@/lib/dashboard-overview";
import { getHistory, type HistoryRecord } from "@/lib/eras-storage";

interface OverviewProps {
  user: { email: string; name: string; plan?: "Free" | "Resident" | "Program" };
  onStartEditor: () => void;
  onOpenPhoto: (item: HistoryRecord) => void;
}

function WorkflowStep({ index, title, complete, active }: { index: number; title: string; complete: boolean; active: boolean }) {
  return (
    <div className="relative flex min-w-0 items-center gap-2">
      <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${complete ? "bg-primary text-white" : active ? "border-2 border-primary bg-primary/10 text-primary" : "border border-slate-200 bg-white text-muted"}`}>
        {complete ? <Check aria-hidden={true} className="h-4 w-4" /> : index}
      </div>
      <p className="truncate text-sm font-semibold text-heading">{title}</p>
    </div>
  );
}

export function OverviewPanel({ user, onStartEditor, onOpenPhoto }: OverviewProps) {
  const [history] = useState(() => (typeof window === "undefined" ? [] : getHistory()));
  const overview = buildDashboardOverview(history, new Date());
  const currentPlan = user.plan ?? "Free";

  return (
    <div className="space-y-5 animate-fade-in-up font-sans">
      <header className="flex justify-end">
        <div className="inline-flex w-fit items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <CalendarDays aria-hidden={true} className="h-4 w-4 shrink-0" />
          <span><strong className="font-semibold tabular-nums">{overview.daysRemaining} days</strong> until programs begin reviewing</span>
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-subtle">
        <div className="grid lg:grid-cols-[minmax(0,1.2fr)_20rem]">
          <div className="flex flex-col justify-center p-5 sm:p-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {overview.hasPhotos ? <Edit3 aria-hidden={true} className="h-5 w-5" /> : <ImagePlus aria-hidden={true} className="h-5 w-5" />}
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-heading sm:text-2xl">
              {overview.hasPhotos ? "Continue with your latest photo" : "Start with a clear headshot"}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-body">
              {overview.hasPhotos
                ? "Reopen your latest file to refine the crop, review its checks, or export another copy."
                : "Upload a photo and the editor will guide the crop, file size, resolution, framing, and background checks."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={overview.latestPhoto ? () => onOpenPhoto(overview.latestPhoto!) : onStartEditor}
                className="btn-primary gap-2 px-5 py-2.5 text-sm"
              >
                {overview.hasPhotos ? "Continue Editing" : "Upload Photo"}
                <ArrowRight aria-hidden={true} className="h-4 w-4" />
              </button>
              {overview.hasPhotos && (
                <button type="button" onClick={onStartEditor} className="btn-ghost px-5 py-2.5 text-sm">
                  Create New
                </button>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5"><LockKeyhole aria-hidden={true} className="h-3.5 w-3.5 text-primary" />Processed on your device</span>
              <span className="inline-flex items-center gap-1.5"><ScanLine aria-hidden={true} className="h-3.5 w-3.5 text-primary" />6 readiness checks</span>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
            {overview.latestPhoto ? (
              <button type="button" onClick={() => onOpenPhoto(overview.latestPhoto!)} className="group mx-auto block w-full max-w-48 text-left">
                <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                  <Image src={overview.latestPhoto.thumbnail} alt={`Latest ERAS photo: ${overview.latestPhoto.name}`} width={180} height={252} unoptimized className="aspect-[5/7] h-auto w-full rounded-md object-cover" />
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-md bg-[#dfff6a] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-heading"><Check aria-hidden={true} className="h-3 w-3" />Ready</span>
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-heading group-hover:text-primary">{overview.latestPhoto.name}</p>
                <p className="mt-1 text-xs text-muted">{overview.latestPhoto.sizeKB} KB · Latest saved photo</p>
              </button>
            ) : (
              <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-5 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><ImagePlus aria-hidden={true} className="h-5 w-5" /></div>
                <p className="mt-4 text-sm font-semibold text-heading">Your photo preview appears here</p>
                <p className="mt-1.5 text-xs leading-5 text-muted">5:7 crop · 375 × 525 px · under 150 KB</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Dashboard status" className="grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
        <StatusItem label="Plan" value={`${currentPlan} plan`} icon={CircleCheck} />
        <StatusItem label="Saved locally" value={`${overview.photoCount} ${overview.photoCount === 1 ? "photo" : "photos"}`} icon={ImagePlus} />
        <StatusItem label="Processing" value="On your device" icon={LockKeyhole} />
        <StatusItem label="Program review" value={overview.reviewDateLabel} icon={CalendarDays} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-heading">Your progress</h2>
            <p className="mt-1 text-xs text-muted">{currentPlan === "Free" ? "Upload, adjust, and preview free. Upgrade to download." : "Upload, adjust, and download in one workflow."}</p>
          </div>
          <div className="relative grid gap-3 sm:grid-cols-3 sm:gap-7">
            <div aria-hidden="true" className="absolute left-4 right-4 top-3.5 hidden h-px bg-slate-200 sm:block" />
            <WorkflowStep index={1} title="Upload" complete={overview.hasPhotos} active={!overview.hasPhotos} />
            <WorkflowStep index={2} title="Adjust" complete={overview.hasPhotos} active={false} />
            <WorkflowStep index={3} title={currentPlan === "Free" ? "Unlock Download" : "Download"} complete={currentPlan !== "Free" && overview.hasPhotos} active={false} />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(n+3)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon aria-hidden={true} className="h-4 w-4" /></div>
      <div className="min-w-0"><p className="text-xs text-muted">{label}</p><p className="mt-0.5 truncate text-sm font-semibold text-heading">{value}</p></div>
    </div>
  );
}
