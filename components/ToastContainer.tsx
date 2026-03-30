"use client";

import { useEffect } from "react";
import { useToast } from "@/lib/toast-context";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default: // info
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "success":
        return { bg: "#10B98166", border: "#10B981AA", text: "#10B981", icon: "#10B981" };
      case "error":
        return { bg: "#EF444466", border: "#EF4444AA", text: "#EF4444", icon: "#EF4444" };
      case "warning":
        return { bg: "#F5991666", border: "#F59916AA", text: "#F59916", icon: "#F59916" };
      default: // info
        return { bg: "#3B82F666", border: "#3B82F6AA", text: "#3B82F6", icon: "#3B82F6" };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const colors = getColors(toast.type);
        return (
          <div
            key={toast.id}
            className="flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-200"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: colors.text,
            }}
            role="status"
            aria-live="polite"
          >
            <div style={{ color: colors.icon, flexShrink: 0 }}>{getIcon(toast.type)}</div>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
