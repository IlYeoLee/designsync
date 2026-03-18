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

// --- Slot definitions ---
// Slots inside the provider container (non-portal elements)
const CONTAINER_SLOTS: Record<string, { radiusMult: number; border: boolean }> = {
  button: { radiusMult: 1, border: false },
  card: { radiusMult: 1.5, border: true },
  input: { radiusMult: 1, border: true },
  textarea: { radiusMult: 1, border: true },
  "select-trigger": { radiusMult: 1, border: true },
  badge: { radiusMult: 1, border: false },
  alert: { radiusMult: 1, border: true },
  checkbox: { radiusMult: 0.5, border: true },
  toggle: { radiusMult: 1, border: true },
  "toggle-group-item": { radiusMult: 1, border: true },
  "tabs-list": { radiusMult: 1, border: true },
  "tabs-trigger": { radiusMult: 0.8, border: false },
  command: { radiusMult: 1, border: true },
  skeleton: { radiusMult: 1, border: false },
  "input-otp-slot": { radiusMult: 1, border: true },
  calendar: { radiusMult: 1, border: false },
  chart: { radiusMult: 1, border: true },
  carousel: { radiusMult: 1, border: false },
  "accordion-item": { radiusMult: 1, border: true },
  "table-container": { radiusMult: 1, border: true },
  menubar: { radiusMult: 1, border: true },
  "resizable-panel-group": { radiusMult: 1, border: true },
  "navigation-menu-content": { radiusMult: 1, border: true },
  "navigation-menu-viewport": { radiusMult: 1, border: true },
};

// Slots rendered via React portals (outside provider container, in document.body)
const PORTAL_SLOTS: Record<string, { radiusMult: number; border: boolean }> = {
  "dialog-content": { radiusMult: 1.5, border: true },
  "sheet-content": { radiusMult: 1.5, border: true },
  "alert-dialog-content": { radiusMult: 1.5, border: true },
  "drawer-content": { radiusMult: 1.5, border: true },
  "popover-content": { radiusMult: 1, border: true },
  "dropdown-menu-content": { radiusMult: 1, border: true },
  "context-menu-content": { radiusMult: 1, border: true },
  "menubar-content": { radiusMult: 1, border: true },
  "tooltip-content": { radiusMult: 0.8, border: true },
  "hover-card-content": { radiusMult: 1, border: true },
  "select-content": { radiusMult: 1, border: true },
};

// Threshold: elements with computed border-radius >= this are already pill/circle shaped
const PILL_RADIUS_THRESHOLD = 9000;

function buildSelector(slots: Record<string, unknown>): string {
  return Object.keys(slots).map((s) => `[data-slot='${s}']`).join(",");
}

const CONTAINER_SELECTOR = buildSelector(CONTAINER_SLOTS);
const PORTAL_SELECTOR = buildSelector(PORTAL_SLOTS);

/**
 * Parse computed box-shadow string → filter: drop-shadow().
 * drop-shadow does NOT support spread or inset.
 */
function parseBoxShadowToDropShadow(boxShadow: string): string {
  return boxShadow
    .split(/,(?![^(]*\))/)
    .map((shadow) => {
      const s = shadow.trim();
      if (s.startsWith("inset")) return null;
      // Computed style: color x y blur [spread]
      const m = s.match(
        /^(rgba?\([^)]+\)|oklch\([^)]+\/[^)]*\)|oklch\([^)]+\)|#[\da-f]+|\w+)\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px(?:\s+[-\d.]+px)?/i
      );
      if (m) {
        const [, color, x, y, blur] = m;
        return `drop-shadow(${x}px ${y}px ${blur}px ${color})`;
      }
      // Fallback: x y blur [spread] color
      const m2 = s.match(
        /([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px(?:\s+[-\d.]+px)?\s+(rgba?\([^)]+\)|oklch\([^)]+\/[^)]*\)|oklch\([^)]+\)|#[\da-f]+|\w+)/i
      );
      if (m2) {
        const [, x, y, blur, color] = m2;
        return `drop-shadow(${x}px ${y}px ${blur}px ${color})`;
      }
      return null;
    })
    .filter(Boolean)
    .join(" ");
}

/**
 * Apply squircle to a single element.
 * Returns false if skipped (e.g., pill-shaped element).
 */
function applyToElement(
  ck: import("@cornerkit/core").default,
  htmlEl: HTMLElement,
  cfg: { radiusMult: number },
  radius: number,
  smoothing: number,
  idPrefix: string,
  index: number,
): boolean {
  if (!htmlEl.id) htmlEl.id = `${idPrefix}-${index}-${Date.now()}`;

  const styles = getComputedStyle(htmlEl);

  // Skip pill/circle elements (border-radius >= threshold)
  const computedRadius = parseFloat(styles.borderRadius) || 0;
  if (computedRadius >= PILL_RADIUS_THRESHOLD) return false;

  const r = Math.min(cfg.radiusMult * radius, 9999);

  // Shape only — CSS borders are naturally clipped by clip-path
  const opts = { radius: r, smoothing };

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
    } catch { /* element not ready */ }
  }

  // Convert box-shadow → filter: drop-shadow() (clip-path clips box-shadow)
  const boxShadow = styles.boxShadow;
  if (boxShadow && boxShadow !== "none") {
    const dropShadows = parseBoxShadowToDropShadow(boxShadow);
    if (dropShadows) {
      htmlEl.style.boxShadow = "none";
      const existingFilter = styles.filter;
      const hasExisting = existingFilter && existingFilter !== "none" && !existingFilter.includes("drop-shadow");
      htmlEl.style.filter = hasExisting ? `${existingFilter} ${dropShadows}` : dropShadows;
    }
  }

  return true;
}

export function SquircleProvider({
  children,
  smoothing = 0.6,
  radius = 8,
  disabled = false,
}: SquircleProviderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const ckRef = React.useRef<import("@cornerkit/core").default | null>(null);
  const observerRef = React.useRef<MutationObserver | null>(null);
  const portalObserverRef = React.useRef<MutationObserver | null>(null);

  const applySquircle = React.useCallback(() => {
    if (disabled || !containerRef.current) return;

    import("@cornerkit/core").then(({ default: CornerKit }) => {
      if (!containerRef.current) return;
      if (!ckRef.current) ckRef.current = new CornerKit();
      const ck = ckRef.current;

      // 1. Apply to container elements (non-portal)
      const containerEls = containerRef.current.querySelectorAll(CONTAINER_SELECTOR);
      containerEls.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        const slot = htmlEl.getAttribute("data-slot") || "";
        const cfg = CONTAINER_SLOTS[slot];
        if (!cfg) return;
        applyToElement(ck, htmlEl, cfg, radius, smoothing, "ds-sq", i);
      });

      // 2. Apply to portal elements (dialog, sheet, popover, etc.)
      if (typeof document === "undefined") return;
      const portalEls = document.querySelectorAll(PORTAL_SELECTOR);
      portalEls.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        const slot = htmlEl.getAttribute("data-slot") || "";
        const cfg = PORTAL_SLOTS[slot];
        if (!cfg) return;
        applyToElement(ck, htmlEl, cfg, radius, smoothing, "ds-pt", i);
      });
    });
  }, [smoothing, radius, disabled]);

  // Container observer: watch for new elements inside provider
  React.useEffect(() => {
    if (disabled || !containerRef.current) return;

    const timer = setTimeout(applySquircle, 100);

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

  // Portal observer: watch document.body for portals (dialog, popover, etc.)
  React.useEffect(() => {
    if (disabled || typeof document === "undefined") return;

    portalObserverRef.current = new MutationObserver(() => {
      requestAnimationFrame(applySquircle);
    });
    portalObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      portalObserverRef.current?.disconnect();
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
