import React, { createContext, useContext, useState } from "react";

export interface ConfirmDialogOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<void>;
  dialog: ConfirmDialogOptions | null;
  isOpen: boolean;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<ConfirmDialogOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = (options: ConfirmDialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        onConfirm: async () => {
          try {
            setIsLoading(true);
            await options.onConfirm();
            setIsOpen(false);
            setDialog(null);
            resolve();
          } catch (error) {
            console.error("Confirm dialog error:", error);
            setIsLoading(false);
          }
        },
        onCancel: () => {
          options.onCancel?.();
          setIsOpen(false);
          setDialog(null);
          resolve();
        },
      });
      setIsOpen(true);
    });
  };

  const handleConfirm = async () => {
    if (dialog) {
      await dialog.onConfirm();
    }
  };

  const handleCancel = () => {
    if (dialog) {
      dialog.onCancel?.();
    }
    setIsOpen(false);
    setDialog(null);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm, dialog, isOpen, handleConfirm, handleCancel }}>
      {children}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }
  return context;
}
