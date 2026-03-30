# Confirmation Dialog System

A beautiful, accessible confirmation dialog system for destructive actions with theme support.

## Overview

Replaces browser `confirm()` dialogs with elegant modal dialogs that integrate with the toast system and respect dark/light mode themes.

## Usage

### Basic Usage

```typescript
"use client";

import { useConfirmDialog } from "@/lib/confirm-dialog-context";

export function MyComponent() {
  const { confirm } = useConfirmDialog();

  const handleDelete = async () => {
    await confirm({
      title: "Delete Item?",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: async () => {
        await deleteAPI();
        // Toast feedback automatically shown by your action
      },
    });
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### API

#### `useConfirmDialog()` Hook

Returns:
- `confirm(options)` - Shows confirmation dialog, returns Promise that resolves when user responds

#### Options

```typescript
interface ConfirmDialogOptions {
  title: string;                    // Dialog title
  description?: string;             // Additional description/explanation
  confirmText?: string;             // Button text (default: "Confirm")
  cancelText?: string;              // Cancel button text (default: "Cancel")
  isDangerous?: boolean;            // Red confirmation button (default: false)
  onConfirm: () => void | Promise<void>;  // Callback when user confirms
  onCancel?: () => void;            // Optional callback when user cancels
}
```

## Features

✓ **Async Action Support**: Handles async operations with loading spinner
✓ **Two Button Styles**: Normal (cyan) or dangerous (red) confirmation buttons
✓ **Customizable Text**: All button labels can be customized
✓ **Accessible**: Proper focus management, keyboard support, ARIA labels
✓ **Theme-Aware**: Automatically adapts to dark/light mode
✓ **Dismissible**: Click backdrop or cancel button to dismiss
✓ **Loading State**: Shows spinner while action is executing

## Examples

### Delete with Dangerous Style
```typescript
await confirm({
  title: "Delete User?",
  description: "This action cannot be undone. All user data will be permanently removed.",
  confirmText: "Delete User",
  isDangerous: true,
  onConfirm: async () => {
    await deleteUser(userId);
    addToast("User deleted", "success");
  },
});
```

### Confirmation with Safe Action
```typescript
await confirm({
  title: "Archive Item?",
  description: "You can restore archived items from the archive section.",
  confirmText: "Archive",
  onConfirm: async () => {
    await archiveItem(itemId);
    addToast("Item archived", "success");
  },
});
```

### With Cancel Callback
```typescript
await confirm({
  title: "Proceed?",
  description: "Are you sure?",
  onConfirm: async () => {
    await action();
  },
  onCancel: () => {
    console.log("User cancelled");
  },
});
```

## Visual States

### Normal Confirmation
- Cyan (#00F0FF) confirm button
- Suitable for non-destructive confirmations
- Used for: Archive, Export, Submit

### Dangerous Confirmation
- Red (#EF4444) confirm button with white text
- Highlights destructive nature of action
- Used for: Delete, Remove, Clear

### Loading
- Shows spinner while async action executes
- Buttons disabled while loading
- Prevents duplicate submissions

## Integration Pattern

When using with async operations:

```typescript
async function handleDelete(id: string) {
  await confirm({
    title: "Delete Item?",
    isDangerous: true,
    onConfirm: async () => {
      try {
        const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
        if (res.ok) {
          addToast("Item deleted", "success");
          // Refresh list or redirect
        } else {
          addToast("Failed to delete", "error");
        }
      } catch (error) {
        addToast("Error during deletion", "error");
        throw error; // Dialog handles error display
      }
    },
  });
}
```

## Integrated Pages

The following pages have been updated to use confirmation dialogs:
- `/admin/employees` - Delete employee with dangerous style
- `/admin/files` - Delete files/folders with normal style

## Accessibility

✓ Keyboard navigation (Tab, Enter, Escape)
✓ Focus trap within dialog
✓ ARIA labels and roles
✓ High contrast colors
✓ Clear action labels
✓ Backdrop click support

## Best Practices

1. **Use `isDangerous` for destructive actions** - Warn users visually
2. **Provide clear descriptions** - Explain consequences
3. **Use specific button text** - "Delete User" instead of just "Delete"
4. **Handle errors in onConfirm** - Show appropriate toasts
5. **Keep descriptions concise** - Users won't read long paragraphs
6. **Combine with toasts** - Use toast for action feedback

## Styling

All colors automatically adapt to theme via CSS variables:
- Surface: `var(--surface)` (dialog background)
- Border: `var(--border)` (dialog border)
- Foreground: `var(--foreground)` (title text)
- Muted: `var(--muted)` (description text)
- Accent: `var(--accent)` (normal confirm button)
