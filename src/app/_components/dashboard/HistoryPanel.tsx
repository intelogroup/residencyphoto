"use client";

import React, { useState } from "react";
import { getHistory, clearHistory, removeHistoryRecord, type HistoryRecord } from "@/lib/eras-storage";
import { isPhotoHistoryEnabled } from "@/lib/privacy-settings";

interface HistoryPanelProps {
  onOpenPhoto: (item: HistoryRecord) => void;
}

export function HistoryPanel({ onOpenPhoto }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryRecord[]>(() => (typeof window === "undefined" ? [] : getHistory()));
  const historyEnabled = typeof window !== "undefined" && isPhotoHistoryEnabled();

  const handleClearHistory = () => {
    if (confirm("Remove all photos from your history? This can't be undone.")) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm("Delete this photo from your history? This can't be undone.")) {
      removeHistoryRecord(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (history.length === 0) {
    return (
      <div className="card bg-white p-12 text-center max-w-2xl mx-auto space-y-6 animate-fade-in-up font-sans">
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="font-sans text-lg font-semibold text-heading">No Photos Yet</h3>
          <p className="text-muted text-sm max-w-sm mx-auto leading-relaxed">
            {historyEnabled
              ? "Head to the Photo Editor to prepare your headshot. Downloaded photos will appear here after you upgrade."
              : "Photo history is off by default. Enable “Save processed photos in this browser” under Settings if you want local history."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up font-sans">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-sans text-xl font-semibold text-heading">My Photos</h3>
          <p className="text-muted text-sm mt-1">Your last 20 downloads, saved only in this browser.</p>
        </div>
        <button
          onClick={handleClearHistory}
          className="text-sm text-red-600 hover:text-red-800 font-semibold cursor-pointer border border-red-200/50 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors duration-150"
        >
          Clear history
        </button>
      </div>

      {/* Grid of Polaroid crops */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenPhoto(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpenPhoto(item);
            }}
            className="polaroid-frame border relative flex flex-col justify-between group cursor-pointer"
          >
            {/* Stamp Overlay top right */}
            <div className="absolute top-2 right-2 z-10 scale-75 origin-top-right">
              <span className="stamp-approve">Approved</span>
            </div>

            {/* Thumbnail Box */}
            <div className="aspect-[5/7] w-full overflow-hidden bg-slate-100 border border-slate-100">
              <img
                src={item.thumbnail}
                alt={item.name}
                width={375}
                height={525}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Metadata Text Block */}
            <div className="mt-4 space-y-2 text-xs text-muted border-t border-slate-100 pt-3">
              <div className="truncate font-sans font-semibold text-slate-800 text-sm text-heading mb-1.5" title={item.name}>
                {item.name}
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-0.5">
                <span>File size</span>
                <span className="text-slate-800">{item.sizeKB} KB</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-0.5">
                <span>Downloaded</span>
                <span className="text-slate-800">{item.date}</span>
              </div>

              <div className="pt-3 font-sans flex justify-between items-center text-sm">
                <span className="text-xs text-green-600 font-bold">Compliant</span>
                <div className="flex items-center gap-3">
                  <a
                    href={item.thumbnail}
                    download={item.name}
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Download
                    <svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(item.id);
                    }}
                    aria-label={`Delete ${item.name}`}
                    className="text-red-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Delete
                    <svg aria-hidden="true" className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
