"use client";

/**
 * GlassShell — animated background layers shared across all pages.
 * Must be rendered inside the <body>; wraps page content with the grid + scanlines.
 */
export function GlassShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Animated grid */}
      <div className="bg-grid" aria-hidden />
      {/* CRT scanlines */}
      <div className="scanlines" aria-hidden />
      {/* Content */}
      <div className="content-layer">{children}</div>
    </>
  );
}
