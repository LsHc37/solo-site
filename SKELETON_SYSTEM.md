# Skeleton Loading System

A comprehensive collection of reusable skeleton components for better perceived performance during loading states.

## Overview

Skeletons provide a preview of the page layout while content is loading, improving perceived performance and user experience.

## Components

### Basic Skeletons

#### `<SkeletonLine />`
Single line of text placeholder
```typescript
<SkeletonLine className="w-full" />
```

#### `<SkeletonHeading />`
Larger heading placeholder
```typescript
<SkeletonHeading className="w-64" />
```

### Composite Skeletons

#### `<SkeletonCard />`
Card with heading and text lines
```typescript
<SkeletonCard />
```

#### `<SkeletonTable />`
Complete table skeleton
```typescript
<SkeletonTable rows={8} columns={5} />
```

#### `<SkeletonTableRow />`
Single table row skeleton
```typescript
<SkeletonTableRow columns={5} />
```

#### `<SkeletonGrid />`
Grid of card skeletons
```typescript
<SkeletonGrid items={6} />  {/* 3 columns on large screens */}
```

#### `<SkeletonForm />`
Form with multiple input fields
```typescript
<SkeletonForm fields={5} />
```

#### `<SkeletonList />`
List of items with titles and descriptions
```typescript
<SkeletonList items={5} />
```

#### `<SkeletonHero />`
Hero section with heading, description, and buttons
```typescript
<SkeletonHero />
```

#### `<SkeletonSettingsPanel />`
Settings panel with multiple sections (ideal for admin pages)
```typescript
<SkeletonSettingsPanel sections={4} />
```

## Usage Example

### Settings Page with Skeleton Loading

```typescript
import { SkeletonSettingsPanel } from "@/components/Skeletons";

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-black" style={{ color: "var(--foreground)" }}>
          Site Settings
        </h1>
        <SkeletonSettingsPanel sections={4} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Your form content */}
    </div>
  );
}
```

### Table Page with Skeleton Loading

```typescript
import { SkeletonTable } from "@/components/Skeletons";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-black">Employees</h1>
        <SkeletonTable rows={8} columns={7} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Your table content */}
    </div>
  );
}
```

## Features

✓ **Theme-Aware**: Uses CSS variables so automatically adapts to dark/light mode
✓ **Customizable**: All components accept className and style props
✓ **Consistent**: All skeletons use the same animation and color scheme
✓ **Performant**: Pure CSS animations, no JavaScript overhead
✓ **Responsive**: Grid skeletons are responsive by default
✓ **Accessible**: Properly semanticmarked as loading placeholders

## Customization

### Custom Width
```typescript
<SkeletonLine className="w-32" />
<SkeletonLine className="w-full" />
<SkeletonLine className="w-2/3" />
```

### Custom Styles
```typescript
<SkeletonCard 
  style={{ borderRadius: "8px" }}
  className="my-custom-class"
/>
```

### Different Variants
Combine multiple skeletons for custom layouts:
```typescript
<div className="flex flex-col gap-4">
  <SkeletonHeading className="w-64" />
  <SkeletonForm fields={3} />
  <SkeletonGrid items={2} />
</div>
```

## CSS Color Variables Used

All skeletons use these CSS variables (automatically adapt to theme):
- `var(--surface)` - Skeleton background color
- `var(--border)` - Border color for containers
- `var(--background)` - Container background
- `var(--muted)` - Muted text color

## Integrated Pages

The following pages have been updated to use skeleton loading:
- `/admin/settings` - Settings form loading
- `/admin/files` - File browser loading
- `/admin/employees` - Employees table loading

## Animation

All skeletons use the `animate-pulse` Tailwind class for a subtle fade in/out effect. This is non-intrusive and doesn't distract from the page structure.
