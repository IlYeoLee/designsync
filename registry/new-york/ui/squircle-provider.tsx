"use client";

import * as React from "react";

/**
 * SquircleProvider — DesignSync Corner Smoothing
 *
 * Wraps your app and applies iOS/Figma-style squircle corners
 * to all shadcn/ui components automatically using @cornerkit/core.
 *
 * Usage:
 *   <SquircleProvider smoothing={0.6} radius={8}>
 *     <App />
 *   </SquircleProvider>
 *
 * - smoothing: 0-1 (0.6 = Apple/Figma default)
 * - radius: base corner radius in px (default: 8)
 * - disabled: set true to turn off (default: false)
 */

interface SquircleProviderProps {
  children: React.ReactNode;
  smoothing?: number;
  radius?: number;
  disabled?: boolean;
}

const SQUIRCLE_SLOTS: Record<string, { radiusMult: number; border: boolean }> = {
  button: { radiusMult: 1, border: false },
  card: { radiusMult: 1.5, border: true },
  input: { radiusMult: 1, border: true },
  textarea: { radiusMult: 1, border: true },
  "select-trigger": { radiusMult: 1, border: true },
  "select-content": { radiusMult: 1, border: true },
  badge: { radiusMult: 1, border: false },
  alert: { radiusMult: 1, border: true },
  avatar: { radiusMult: 100, border: false },
  checkbox: { radiusMult: 0.5, border: true },
  switch: { radiusMult: 100, border: true },
  toggle: { radiusMult: 1, border: true },
  "tabs-list": { radiusMult: 1, border: true },
  "tabs-trigger": { radiusMult: 0.8, border: false },
  "popover-content": { radiusMult: 1, border: true },
  "dropdown-menu-content": { radiusMult: 1, border: true },
  "context-menu-content": { radiusMult: 1, border: true },
  "tooltip-content": { radiusMult: 0.8, border: true },
  "dialog-content": { radiusMult: 1.5, border: true },
  "sheet-content": { radiusMult: 1.5, border: true },
  "alert-dialog-content": { radiusMult: 1.5, border: true },
  "hover-card-content": { radiusMult: 1, border: true },
  "navigation-menu-content": { radiusMult: 1, border: true },
  command: { radiusMult: 1, border: true },
  skeleton: { radiusMult: 1, border: false },
  progress: { radiusMult: 100, border: false },
  "input-otp-slot": { radiusMult: 1, border: true },
};

const SELECTOR = Object.keys(SQUIRCLE_SLOTS)
  .map((s) => `[data-slot='${s}']`)
  .join(",");

export function SquircleProvider({
  children,
  smoothing = 0.6,
  radius = 8,
  disabled = false,
}: SquircleProviderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const ckRef = React.useRef<import("@cornerkit/core").default | null>(null);
  const observerRef = React.useRef<MutationObserver | null>(null);

  const applySquircle = React.useCallback(() => {
    if (disabled || !containerRef.current) return;

    import("@cornerkit/core").then(({ default: CornerKit }) => {
      if (!containerRef.current) return;
      if (!ckRef.current) ckRef.current = new CornerKit();
      const ck = ckRef.current;

      const elements = containerRef.current.querySelectorAll(SELECTOR);
      elements.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        if (!htmlEl.id) htmlEl.id = `ds-sq-${i}-${Date.now()}`;
        const slot = htmlEl.getAttribute("data-slot") || "";
        const cfg = SQUIRCLE_SLOTS[slot];
        if (!cfg) return;

        const r = Math.min(cfg.radiusMult * radius, 9999);
        const styles = getComputedStyle(htmlEl);
        const borderWidth = parseFloat(styles.borderWidth) || 0;

        const opts: { radius: number; smoothing: number; border?: { width: number; color: string } } = {
          radius: r,
          smoothing,
        };
        if (cfg.border && borderWidth > 0) {
          opts.border = { width: borderWidth, color: styles.borderColor };
        }

        try {
          if (htmlEl.hasAttribute("data-squircle-applied")) {
            ck.update(`#${htmlEl.id}`, opts);
          } else {
            ck.apply(`#${htmlEl.id}`, opts);
            htmlEl.setAttribute("data-squircle-applied", "true");
          }
        } catch {
          try {
            ck.apply(`#${htmlEl.id}`, opts);
            htmlEl.setAttribute("data-squircle-applied", "true");
          } catch { /* element not in DOM yet */ }
        }
      });
    });
  }, [smoothing, radius, disabled]);

  // Initial apply + MutationObserver for dynamically added elements
  React.useEffect(() => {
    if (disabled || !containerRef.current) return;

    // Apply after initial render
    const timer = setTimeout(applySquircle, 100);

    // Watch for new elements (dialogs, popovers, etc.)
    observerRef.current = new MutationObserver(() => {
      requestAnimationFrame(applySquircle);
    });
    observerRef.current.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [applySquircle, disabled]);

  // Re-apply when smoothing or radius changes
  React.useEffect(() => {
    if (!disabled) applySquircle();
  }, [smoothing, radius, applySquircle, disabled]);

  return (
    <div ref={containerRef} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
