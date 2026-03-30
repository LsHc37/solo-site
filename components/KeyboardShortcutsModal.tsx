"use client";

import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts-context";
import { GLOBAL_SHORTCUTS, ADMIN_SHORTCUTS, formatShortcut } from "@/lib/keyboard-shortcuts";

export function KeyboardShortcutsModal() {
  const { isHelpOpen, closeHelp } = useKeyboardShortcuts();

  if (!isHelpOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={closeHelp}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border max-h-[80vh] overflow-y-auto shadow-2xl"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="sticky top-0 px-6 py-4 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                ⌨️ Keyboard Shortcuts
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                Press <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>?</kbd> anytime to show this guide
              </p>
            </div>
            <button
              onClick={closeHelp}
              className="text-xl leading-none hover:opacity-60 transition-opacity"
              style={{ color: "var(--muted)" }}
              aria-label="Close shortcuts"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Global Shortcuts */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--accent)" }}>
              Global Shortcuts
            </h3>
            <div className="space-y-2">
              {GLOBAL_SHORTCUTS.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <span style={{ color: "var(--foreground)" }}>{shortcut.description}</span>
                  <kbd
                    className="px-3 py-1 rounded text-xs font-mono font-semibold flex gap-1"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--accent)",
                    }}
                  >
                    {formatShortcut(shortcut.keys)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Shortcuts */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--accent)" }}>
              Admin Dashboard Shortcuts
            </h3>
            <div className="space-y-2">
              {ADMIN_SHORTCUTS.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <span style={{ color: "var(--foreground)" }}>{shortcut.description}</span>
                  <kbd
                    className="px-3 py-1 rounded text-xs font-mono font-semibold"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--accent)",
                    }}
                  >
                    {formatShortcut(shortcut.keys)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Tips */}
          <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              💡 <strong>Tip:</strong> Use <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>Tab</kbd> to navigate, <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>Enter</kbd> to select, and <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>Esc</kbd> to close.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
          Press <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>Esc</kbd> to close
        </div>
      </div>
    </>
  );
}
