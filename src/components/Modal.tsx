"use client";

import React, { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, children, maxWidth = "max-w-md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overscroll-contain p-6 font-sans" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close Dialog"
      />
      <div className={`relative w-full ${maxWidth} card bg-white p-6 animate-fade-in-up`}>
        {children}
      </div>
    </div>
  );
}
