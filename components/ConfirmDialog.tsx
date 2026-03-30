"use client";

import { useState, useEffect } from "react";
import { useConfirmDialog } from "@/lib/confirm-dialog-context";

export function ConfirmDialog() {
  const { dialog, isOpen, handleConfirm, handleCancel } = useConfirmDialog();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmClick = async () => {
    setIsLoading(true);
    try {
      await handleConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleCancel]);

  if (!isOpen || !dialog) return null;

  const isDangerous = dialog.isDangerous ?? false;
  const confirmText = dialog.confirmText ?? "Confirm";
  const cancelText = dialog.cancelText ?? "Cancel";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
        style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
      />

      {/* Dialog */}
      <div
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="p-6">
          {/* Header */}
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {dialog.title}
          </h2>

          {/* Description */}
          {dialog.description && (
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--muted)" }}
            >
              {dialog.description}
            </p>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-medium transition-colors border text-sm"
              style={{
                borderColor: "var(--border)",
                color: "var(--muted)",
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {cancelText}
            </button>

            <button
              onClick={handleConfirmClick}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2"
              style={{
                backgroundColor: isDangerous ? "#EF4444" : "var(--accent)",
                color: isDangerous ? "#FFFFFF" : "#0D1117",
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading && (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
