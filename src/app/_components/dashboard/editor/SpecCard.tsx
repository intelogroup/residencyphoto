"use client";

import { AlertOctagon, AlertTriangle, CheckCircle2, Download, FileCheck2, RotateCcw, ShieldCheck, Upload } from "lucide-react";
import { MAX_FILE_KB } from "@/lib/eras-checks";

interface SpecCardProps {
  imageSrc: string | null;
  exportKB: number | null;
  /** Async stage of the download flow — drives the button's visible state. */
  downloadPhase: DownloadPhase;
  onDownload: () => void | Promise<void>;
  downloadLocked: boolean;
  onReset: () => void;
  resolutionWarning: string | null;
  ratioWarning: string | null;
  bgWarning: string | null;
  topEdgeWarning: string | null;
  faceWarning: string | null;
  eyewearWarning: string | null;
  attireWarning: string | null;
  framingWarning: string | null;
  poseWarning: string | null;
  sizeWarning: string | null;
  // Not "the photo failed a check" — "a check never ran." Kept separate from
  // WARNING_ORDER so it renders as its own, more serious banner instead of
  // blending into the ordinary review list.
  landmarkerWarning: string | null;
  classifierWarning: string | null;
}

const WARNING_ORDER = ["resolutionWarning", "ratioWarning", "faceWarning", "poseWarning", "framingWarning", "topEdgeWarning", "eyewearWarning", "bgWarning", "attireWarning"] as const;

/** Async stage of the download flow — every stage gets visible UI. */
export type DownloadPhase = "authorizing" | "preparing" | "redirecting" | null;

const PHASE_LABEL: Record<Exclude<DownloadPhase, null>, string> = {
  authorizing: "Checking your plan…",
  preparing: "Preparing…",
  redirecting: "Opening checkout…",
};

export function SpecCard(props: SpecCardProps) {
  const { imageSrc, exportKB, downloadPhase, onDownload, onReset, sizeWarning, downloadLocked, landmarkerWarning, classifierWarning } = props;
  const warnings = WARNING_ORDER.map((key) => props[key]).filter(Boolean) as string[];
  const unavailableWarnings = [landmarkerWarning, classifierWarning].filter(Boolean) as string[];
  const hasAnyWarning = warnings.length > 0 || !!sizeWarning || unavailableWarnings.length > 0;
  const isReady = !!imageSrc && !hasAnyWarning && !!exportKB && exportKB <= MAX_FILE_KB;
  const primaryWarning = sizeWarning || warnings[0];

  const readiness = !imageSrc
    ? { title: "Ready When You Are", description: "Upload a photo to check its ERAS readiness.", icon: Upload, tone: "bg-slate-50 border-slate-200 text-slate-600" }
    : unavailableWarnings.length > 0
      ? { title: "Can't Verify This Photo", description: "Some automatic checks failed to load — see below. Review your photo manually before downloading.", icon: AlertOctagon, tone: "bg-red-50 border-red-200 text-red-800" }
      : isReady
        ? { title: "ERAS Ready", description: "Your photo meets the checks shown here.", icon: CheckCircle2, tone: "bg-primary/5 border-primary/20 text-primary-dark" }
        : { title: "Needs Attention", description: primaryWarning ?? "Review the crop and quality checks before downloading.", icon: AlertTriangle, tone: "bg-amber-50 border-amber-200 text-amber-800" };
  const ReadinessIcon = readiness.icon;

  return (
    <aside className="space-y-4 lg:sticky lg:top-28">
      <section className="card overflow-hidden bg-white">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck aria-hidden={true} className="h-[18px] w-[18px]" /></div>
            <div><h2 className="text-base font-semibold text-heading">ERAS Readiness</h2><p className="mt-0.5 text-xs text-muted">Live export validation</p></div>
          </div>
          <div aria-live="polite" className={`mt-5 rounded-lg border p-3.5 ${readiness.tone}`}>
            <div className="flex gap-2.5"><ReadinessIcon aria-hidden={true} className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="text-sm font-semibold">{readiness.title}</p><p className="mt-1 text-xs leading-5 opacity-80">{readiness.description}</p></div></div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-heading">Final File</h3>
          <dl className="mt-3 space-y-0 text-sm tabular-nums">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5"><dt className="text-muted">Dimensions</dt><dd className="font-semibold text-heading">375 × 525 px</dd></div>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5"><dt className="text-muted">Size</dt><dd className={`font-semibold ${exportKB && exportKB > MAX_FILE_KB ? "text-error" : "text-heading"}`}>{exportKB ? `${exportKB} KB` : "Under 150 KB"}</dd></div>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5"><dt className="text-muted">Format</dt><dd className="font-semibold text-heading">JPEG · 150 DPI</dd></div>
            <div className="flex items-center justify-between gap-3 pt-2.5"><dt className="text-muted">Print Size</dt><dd className="font-semibold text-heading">2.5 × 3.5 in</dd></div>
          </dl>
        </div>
      </section>

      {imageSrc && unavailableWarnings.length > 0 && (
        <section aria-live="polite" className="card border-red-200 bg-red-50/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-900"><AlertOctagon aria-hidden={true} className="h-4 w-4" />Checks Unavailable</div>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-red-900">{unavailableWarnings.map((warning) => <li key={warning} className="flex gap-2"><span aria-hidden={true}>•</span><span>{warning}</span></li>)}</ul>
        </section>
      )}

      {imageSrc && (warnings.length > 0 || !!sizeWarning) && (
        <section aria-live="polite" className="card border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900"><AlertTriangle aria-hidden={true} className="h-4 w-4" />What to Review</div>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-amber-900">{warnings.map((warning) => <li key={warning} className="flex gap-2"><span aria-hidden={true}>•</span><span>{warning}</span></li>)}{sizeWarning && <li className="flex gap-2"><span aria-hidden={true}>•</span><span>{sizeWarning}</span></li>}</ul>
        </section>
      )}

      <div className="space-y-2.5">
        <button onClick={() => void onDownload()} disabled={!imageSrc || downloadPhase !== null} aria-live="polite" className="btn-primary w-full gap-2 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          {downloadPhase !== null ? <><span aria-hidden={true} className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{PHASE_LABEL[downloadPhase]}</> : <><Download aria-hidden={true} className="h-4 w-4" />{downloadLocked ? "Unlock Download — $4" : "Download ERAS-Ready Photo"}</>}
        </button>
        {imageSrc && downloadLocked && <p className="text-center text-xs leading-5 text-muted">Editing and readiness checks are free. Upgrade once to download.</p>}
        {imageSrc && <button onClick={onReset} className="btn-ghost w-full gap-2 px-4 py-2.5 text-sm"><RotateCcw aria-hidden={true} className="h-4 w-4" />Start With a New Photo</button>}
        {!imageSrc && <p className="flex items-center justify-center gap-1.5 text-center text-xs leading-5 text-muted"><FileCheck2 aria-hidden={true} className="h-3.5 w-3.5" />No uploads leave your device.</p>}
      </div>
    </aside>
  );
}
