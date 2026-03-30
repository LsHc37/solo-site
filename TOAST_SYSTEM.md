# Toast Notification System

The app now has a centralized, global toast notification system for user feedback.

## Usage

### In any client component:

```typescript
"use client";

import { useToast } from "@/lib/toast-context";

export function MyComponent() {
  const { addToast } = useToast();

  const handleSave = async () => {
    try {
      const response = await fetch("/api/save", { method: "POST" });
      if (response.ok) {
        addToast("Changes saved successfully!", "success");
      } else {
        addToast("Failed to save changes", "error");
      }
    } catch (error) {
      addToast("An error occurred", "error");
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## API

### `useToast()` hook

Returns:
- `addToast(message, type?, duration?)` - Adds a toast notification
  - `message` (string): The message to display
  - `type` (ToastType, optional): `'success' | 'error' | 'warning' | 'info'` (default: 'success')
  - `duration` (number, optional): How long to display before auto-dismissing in ms (default: 3500)
  - Returns: Toast ID for manual removal if needed
  
- `removeToast(id)` - Manually removes a toast by ID
- `toasts` - Array of current toasts

## Toast Types

- **success** (green): ✓ For successful operations
- **error** (red): ✗ For errors and failures
- **warning** (orange): ⚠ For warnings and cautions
- **info** (blue): ℹ For informational messages

## Features

✓ Auto-dismiss after 3.5 seconds
✓ Manual dismiss button
✓ Stacking support (multiple toasts at once)
✓ Type-safe TypeScript support
✓ ARIA live region for screen readers
✓ Smooth animations (fade-in, slide-in)
✓ Dark/light theme compatible

## Examples

### Success notification
```typescript
addToast("Profile updated successfully!", "success");
```

### Error notification
```typescript
addToast("Failed to load data", "error");
```

### Custom duration (5 seconds)
```typescript
addToast("Keep this message longer", "info", 5000);
```

### No auto-dismiss (0 = infinite)
```typescript
addToast("Critical: Please take action", "warning", 0);
```

## Updated Components

The following pages have been migrated to use the global toast system:
- `/admin/settings` - Settings save feedback
- `/admin/files` - File upload, delete, folder creation feedback

To integrate into other pages:
1. Import `useToast` hook
2. Replace local state toast handlers with `addToast` calls
3. Remove old inline toast rendering from JSX
