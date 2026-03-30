"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const BREADCRUMB_LABELS: Record<string, string> = {
  admin: "Dashboard",
  content: "Content",
  editor: "Code Editor",
  employees: "Employees",
  enterprise: "Enterprise",
  departments: "Departments",
  files: "Files",
  "server-console": "Server Console",
  settings: "Settings",
  staff: "Staff",
  timesheets: "Timesheets",
  users: "Users",
  "visual-builder": "Visual Builder",
  add: "Add",
};

export default function AdminBreadcrumbs() {
  const pathname = usePathname();

  // Build breadcrumb items from path
  const items: BreadcrumbItem[] = [{ label: "Admin", href: "/admin" }];

  const segments = pathname
    .replace("/admin", "")
    .split("/")
    .filter(Boolean);

  let currentPath = "/admin";

  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = BREADCRUMB_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Don't make the last segment a link
    if (segment === segments[segments.length - 1]) {
      items.push({ label });
    } else {
      items.push({ label, href: currentPath });
    }
  });

  return (
    <nav className="mb-6 flex items-center gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="text-sm font-medium transition-colors"
              style={{ color: "#00F0FF" }}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-sm font-medium"
              style={{ color: "#8B949E" }}
            >
              {item.label}
            </span>
          )}
          
          {index < items.length - 1 && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              style={{ color: "#30363D" }}
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          )}
        </div>
      ))}
    </nav>
  );
}
