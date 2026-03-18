"use client";

import * as React from "react";

/**
 * SquircleProvider — DesignSync Corner Smoothing
 *
 * Applies iOS/Figma-style squircle corners via @cornerkit/core.
 * Uses clip-path internally — known limitations:
 *   - box-shadow is clipped → removed entirely when squircle is active
 *   - overflow content is clipped → container components with overflow children excluded
 *   - pill/circle elements (border-radius ≥ 9999px) auto-skipped
 */

interface SquircleProviderProps {
  children: React.ReactNode;
  smoothing?: number;
  radius?: number;
  disabled?: boolean;
}

// radiusMult: multiplier against base radius
// Excluded: carousel (clips arrows), resizable (clips handles), scroll-area (clips scrollbar)
const CONTAINER_SLOTS: Record<string, number> = {
  button: 1,
  card: 1.5,
  input: 1,
  textarea: 1,
  "select-trigger": 1,
  badge: 1,
  alert: 1,
  checkbox: 0.5,
  toggle: 1,
  "toggle-group-item": 1,
  "tabs-list": 1,
  "tabs-trigger": 0.8,
  command: 1,
  skeleton: 1,
  "input-otp-slot": 1,
  calendar: 1,
  chart: 1,
  "accordion-item": 1,
  "table-container": 1,
  menubar: 1,
};

const PORTAL_SLOTS: Record<string, number> = {
  "dialog-content": 1.5,
  "sheet-content": 1.5,
  "alert-dialog-content": 1.5,
  "drawer-content": 1.5,
  "popover-content": 1,
  "dropdown-menu-content": 1,
  "context-menu-content": 1,
  "menubar-content": 1,
  "tooltip-content": 0.8,
  "hover-card-content": 1,
  "select-content": 1,
  "navigation-menu-content": 1,
  "navigation-menu-viewport": 1,
};

const PILL_THRESHOLD = 9000;

function buildSelector(slots: Record<string, number>): string {
  return Object.keys(slots).map((s) => `[data-slot='${s}']`).join(",");
}

const CONTAINER_SEL = buildSelector(CONTAINER_SLOTS);
const PORTAL_SEL = buildSelector(PORTAL_SLOTS);


function applyToElement(
  ck: import("@cornerkit/core").default,
  el: HTMLElement,
  radiusMult: number,
  baseRadius: number,
  smoothing: number,
  prefix: string,
  idx: number,
): void {
  if (!el.id) el.id = `${prefix}-${idx}-${Date.now()}`;

  const styles = getComputedStyle(el);
  const cr = parseFloat(styles.borderRadius) || 0;
  if (cr >= PILL_THRESHOLD) return;

  const r = Math.min(radiusMult * baseRadius, 9999);
  if (r <= 0) return;

  const opts = { radius: r, smoothing };

  try {
    if (el.hasAttribute("data-squircle-applied")) {
      ck.update(`#${el.id}`, opts);
    } else {
      ck.apply(`#${el.id}`, opts);
      el.setAttribute("data-squircle-applied", "true");
    }
  } catch {
    try {
      ck.apply(`#${el.id}`, opts);
      el.setAttribute("data-squircle-applied", "true");
    } catch { /* not ready */ }
  }

  // Shadow: clip-path clips box-shadow — remove entirely
  const bs = styles.boxShadow;
  if (bs && bs !== "none") {
    el.style.boxShadow = "none";
  }
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

  const applyAll = React.useCallback(() => {
    if (disabled || !containerRef.current) return;

    import("@cornerkit/core").then(({ default: CK }) => {
      if (!containerRef.current) return;
      if (!ckRef.current) ckRef.current = new CK();
      const ck = ckRef.current;

      containerRef.current.querySelectorAll(CONTAINER_SEL).forEach((el, i) => {
        const slot = el.getAttribute("data-slot") || "";
        const mult = CONTAINER_SLOTS[slot];
        if (mult == null) return;
        applyToElement(ck, el as HTMLElement, mult, radius, smoothing, "ds-sq", i);
      });

      if (typeof document === "undefined") return;
      document.querySelectorAll(PORTAL_SEL).forEach((el, i) => {
        const slot = el.getAttribute("data-slot") || "";
        const mult = PORTAL_SLOTS[slot];
        if (mult == null) return;
        applyToElement(ck, el as HTMLElement, mult, radius, smoothing, "ds-pt", i);
      });
    });
  }, [smoothing, radius, disabled]);

  // Container observer
  React.useEffect(() => {
    if (disabled || !containerRef.current) return;
    const timer = setTimeout(applyAll, 100);
    observerRef.current = new MutationObserver(() => requestAnimationFrame(applyAll));
    observerRef.current.observe(containerRef.current, { childList: true, subtree: true });
    return () => { clearTimeout(timer); observerRef.current?.disconnect(); };
  }, [applyAll, disabled]);

  // Portal observer
  React.useEffect(() => {
    if (disabled || typeof document === "undefined") return;
    portalObserverRef.current = new MutationObserver(() => requestAnimationFrame(applyAll));
    portalObserverRef.current.observe(document.body, { childList: true, subtree: true });
    return () => { portalObserverRef.current?.disconnect(); };
  }, [applyAll, disabled]);

  React.useEffect(() => { if (!disabled) applyAll(); }, [smoothing, radius, applyAll, disabled]);

  return (
    <div ref={containerRef} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
