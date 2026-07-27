"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface Toast {
  id: number;
  message: string;
  variant: "success" | "error";
}

const ToastContext = createContext<{ showToast: (message: string, variant?: Toast["variant"]) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 font-sans">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-in-up px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 border ${
              t.variant === "success"
                ? "bg-white text-heading border-primary/20"
                : "bg-white text-error border-red-200"
            }`}
          >
            <span aria-hidden="true" className={t.variant === "success" ? "text-primary" : "text-error"}>
              {t.variant === "success" ? "✓" : "!"}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
