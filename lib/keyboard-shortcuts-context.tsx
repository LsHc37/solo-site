"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GLOBAL_SHORTCUTS, ADMIN_SHORTCUTS, shortcutMatches, KeyboardShortcut } from "@/lib/keyboard-shortcuts";

interface ShortcutContextType {
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (keys: string[]) => void;
}

const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [customShortcuts, setCustomShortcuts] = useState<KeyboardShortcut[]>([]);

  const openHelp = useCallback(() => setIsHelpOpen(true), []);
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setCustomShortcuts((prev) => [...prev, shortcut]);
  }, []);

  const unregisterShortcut = useCallback((keys: string[]) => {
    setCustomShortcuts((prev) => prev.filter((s) => 
      !(s.keys.length === keys.length && s.keys.every((k, i) => k === keys[i]))
    ));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Close help on Escape
      if (event.key === "Escape") {
        if (isHelpOpen) {
          event.preventDefault();
          setIsHelpOpen(false);
          return;
        }
      }

      // Show help on ?
      if (event.key === "?") {
        event.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // Toggle theme on Ctrl+/
      if (shortcutMatches(event, ["Ctrl", "/"])) {
        event.preventDefault();
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("retro-gigz-theme", newTheme);
        return;
      }

      // Check custom shortcuts
      const allShortcuts = [...GLOBAL_SHORTCUTS, ...ADMIN_SHORTCUTS, ...customShortcuts];
      for (const shortcut of allShortcuts) {
        if (shortcutMatches(event, shortcut.keys)) {
          event.preventDefault();
          shortcut.handler?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [customShortcuts, isHelpOpen]);

  return (
    <ShortcutContext.Provider value={{ isHelpOpen, openHelp, closeHelp, registerShortcut, unregisterShortcut }}>
      {children}
    </ShortcutContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider");
  }
  return context;
}
