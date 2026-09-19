"use client";

import Image from "next/image";
import React, { useRef, useState } from "react";
import { ArrowRight, Check, ImagePlus } from "lucide-react";
import { buildDashboardOverview } from "@/lib/dashboard-overview";
import { getHistory, type HistoryRecord } from "@/lib/eras-storage";

interface OverviewProps {
  user: { email: string; name: string; plan?: "Free" | "Resident" | "Program" };
  onStartEditor: () => void;
  onOpenPhoto: (item: HistoryRecord) => void;
  onSelectFile: (file: File) => void;
}

const ACCEPT = "image/jpeg,image/png,image/heic,image/heif";

export function OverviewPanel({ onStartEditor, onOpenPhoto, onSelectFile }: OverviewProps) {
  const [history] = useState(() => (typeof window === "undefined" ? [] : getHistory()));
  const overview = buildDashboardOverview(history, new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null | undefined) => {
    const file = files?.[0];
    if (file) onSelectFile(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-14rem)] w-full max-w-3xl flex-col justify-center animate-fade-in-up font-sans">
      {overview.hasPhotos && overview.latestPhoto ? (
        <section className="rounded-[20px] bg-white p-6 shadow-raised sm:p-10">
          <div className="flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => onOpenPhoto(overview.latestPhoto!)}
              className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-2xl"
              aria-label={`Continue editing ${overview.latestPhoto.name}`}
            >
              <Image
                src={overview.latestPhoto.thumbnail}
                alt={`Latest ERAS photo: ${overview.latestPhoto.name}`}
                width={180}
                height={252}
                unoptimized
                className="aspect-[5/7] h-auto w-40 rounded-2xl object-cover shadow-raised transition-transform duration-200 group-hover:scale-[1.03]"
              />
              <span className="pill-success absolute bottom-3 right-3">
                <Check aria-hidden={true} className="h-3 w-3" />
                Ready
              </span>
            </button>
            <p className="mt-4 text-xs text-muted">
              {overview.latestPhoto.name} · {overview.latestPhoto.sizeKB} KB
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-heading sm:text-2xl">
              Continue with your latest photo
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-body">
              Reopen your latest file to refine the crop, review its checks, or export another copy.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => onOpenPhoto(overview.latestPhoto!)}
                className="btn-primary gap-2 px-6 py-2.5 text-sm"
              >
                Continue Editing
                <ArrowRight aria-hidden={true} className="h-4 w-4" />
              </button>
              <button type="button" onClick={onStartEditor} className="btn-ghost px-6 py-2.5 text-sm">
                Create New
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a photo to start. You can also drag and drop an image file here."
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-[24rem] cursor-pointer flex-col items-center justify-center rounded-[20px] border-[1.5px] border-dashed bg-white px-6 py-16 text-center shadow-raised transition-[border-color,background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            dragging ? "scale-[1.01] border-primary bg-primary/[0.04]" : "border-slate-300 hover:border-primary/60"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-hidden={true}
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImagePlus aria-hidden={true} className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-heading sm:text-[28px]">
            Drop a photo to start
          </h2>
          <p className="mt-2 text-sm text-muted">5:7 crop · 375 × 525 px · under 150 KB</p>
          <span className="btn-primary mt-8 gap-2 px-7 py-3 text-sm" aria-hidden={true}>
            Choose a photo
            <ArrowRight aria-hidden={true} className="h-4 w-4" />
          </span>
        </div>
      )}
    </div>
  );
}
