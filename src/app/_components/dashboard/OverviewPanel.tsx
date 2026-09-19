"use client";

import Image from "next/image";
import React, { useState } from "react";
import { ArrowRight, Check, Edit3, ImagePlus } from "lucide-react";
import { buildDashboardOverview } from "@/lib/dashboard-overview";
import { getHistory, type HistoryRecord } from "@/lib/eras-storage";

interface OverviewProps {
  user: { email: string; name: string; plan?: "Free" | "Resident" | "Program" };
  onStartEditor: () => void;
  onOpenPhoto: (item: HistoryRecord) => void;
}

export function OverviewPanel({ onStartEditor, onOpenPhoto }: OverviewProps) {
  const [history] = useState(() => (typeof window === "undefined" ? [] : getHistory()));
  const overview = buildDashboardOverview(history, new Date());

  return (
    <div className="space-y-5 animate-fade-in-up font-sans">
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
    </div>
  );
}
