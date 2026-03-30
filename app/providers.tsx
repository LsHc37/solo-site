"use client";

import { ReactNode, useEffect, useState } from "react";
import { getInitialTheme, applyTheme } from "@/lib/theme";
import { ToastProvider } from "@/lib/toast-context";
import { ConfirmDialogProvider } from "@/lib/confirm-dialog-context";
import { KeyboardShortcutsProvider } from "@/lib/keyboard-shortcuts-context";
import { ToastContainer } from "@/components/ToastContainer";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const theme = getInitialTheme();
    applyTheme(theme);
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <ConfirmDialogProvider>
        <KeyboardShortcutsProvider>
          {children}
          <ToastContainer />
          <ConfirmDialog />
          <KeyboardShortcutsModal />
        </KeyboardShortcutsProvider>
      </ConfirmDialogProvider>
    </ToastProvider>
  );
}
