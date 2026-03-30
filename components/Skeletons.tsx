"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Basic skeleton line - use for text
 */
export function SkeletonLine({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`h-4 rounded animate-pulse ${className}`}
      style={{
        backgroundColor: "var(--surface)",
        ...style,
      }}
    />
  );
}

/**
 * Skeleton for heading text
 */
export function SkeletonHeading({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`h-8 rounded-lg animate-pulse ${className}`}
      style={{
        backgroundColor: "var(--surface)",
        ...style,
      }}
    />
  );
}

/**
 * Skeleton for a card
 */
export function SkeletonCard({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl border p-6 space-y-4 ${className}`}
      style={{
        backgroundColor: "var(--background)",
        borderColor: "var(--border)",
        ...style,
      }}
    >
      <div className="h-6 rounded animate-pulse" style={{ backgroundColor: "var(--surface)" }} />
      <div className="space-y-2">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-5/6" />
      </div>
    </div>
  );
}

/**
 * Skeleton for a table row
 */
export function SkeletonTableRow({ columns = 5, className = "" }: { columns?: number; className?: string }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonLine />
        </td>
      ))}
    </tr>
  );
}

/**
 * Complete skeleton table
 */
export function SkeletonTable({ rows = 5, columns = 5, className = "" }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${className}`} style={{ borderColor: "var(--border)" }}>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr
              key={i}
              style={{
                backgroundColor: i % 2 === 0 ? "var(--background)" : "var(--surface)",
                borderBottom: i < rows - 1 ? `1px solid var(--border)` : undefined,
              }}
            >
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <SkeletonLine />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton for a grid layout
 */
export function SkeletonGrid({ items = 6, className = "" }: { items?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for form fields
 */
export function SkeletonForm({ fields = 5, className = "" }: { fields?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="mb-2 h-4 w-24 rounded animate-pulse" style={{ backgroundColor: "var(--surface)" }} />
          <div className="h-10 rounded-lg animate-pulse" style={{ backgroundColor: "var(--surface)" }} />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for a list of items
 */
export function SkeletonList({ items = 5, className = "" }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: "var(--surface)" }}>
          <SkeletonLine className="w-48" />
          <div className="mt-2">
            <SkeletonLine className="w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for a hero section / panel
 */
export function SkeletonHero({ className = "" }: SkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="h-12 rounded-lg animate-pulse w-64" style={{ backgroundColor: "var(--surface)" }} />
      <div className="space-y-3">
        <SkeletonLine />
        <SkeletonLine className="w-4/5" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-32 rounded-lg animate-pulse" style={{ backgroundColor: "var(--surface)" }} />
        <div className="h-10 w-32 rounded-lg animate-pulse" style={{ backgroundColor: "var(--surface)" }} />
      </div>
    </div>
  );
}

/**
 * Skeleton for a settings panel (like admin)
 */
export function SkeletonSettingsPanel({ sections = 3, className = "" }: { sections?: number; className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
          >
            <div className="h-5 w-32 rounded animate-pulse" style={{ backgroundColor: "var(--muted)" }} />
          </div>
          <div className="px-6 py-6 space-y-4">
            <SkeletonForm fields={3} />
          </div>
        </div>
      ))}
    </div>
  );
}
