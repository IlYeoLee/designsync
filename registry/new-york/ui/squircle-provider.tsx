"use client";

import * as React from "react";

/**
 * SquircleProvider — DesignSync Corner Smoothing
 *
 * Applies iOS/Figma-style squircle corners via @cornerkit/core.
 * Automatically targets ALL elements with border-radius > 0,
 * including custom components not in the design library.
 *
 * Known limitations:
 *   - box-shadow is clipped → removed when squircle is active
 *   - overflow content is clipped → excluded tags listed below
 *   - pill/circle elements (border-radius ≥ 9999px) auto-skipped
 */

interface SquircleProviderProps {
  children: React.ReactNode;
  smoothing?: number;
  disabled?: boolean;
}

const PILL_THRESHOLD = 9000;

// Tags/roles that should never get squircle (overflow-dependent or layout-sensitive)
const EXCLUDED_TAGS = new Set([
  "HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "LINK", "META",
  "SVG", "PATH", "CIRCLE", "RECT", "LINE", "POLYGON",
  "IFRAME", "VIDEO", "CANVAS", "IMG",
]);

// data-slot values to exclude (clips overflow children)
const EXCLUDED_SLOTS = new Set([
  "carousel", "carousel-content",
  "resizable-panel", "resizable-handle",
  "scroll-area", "scroll-area-viewport",
  "sidebar",
]);

function applyToEl(
  ck: import("@cornerkit/core").default,
  el: HTMLElement,
  smoothing: number,
  prefix: string,
  idx: number,
): void {
  // Skip excluded tags
  if (EXCLUDED_TAGS.has(el.tagName)) return;

  // Skip excluded slots
  const slot = el.getAttribute("data-slot");
  if (slot && EXCLUDED_SLOTS.has(slot)) return;

  // Skip if already applied
  if (el.hasAttribute("data-squircle-applied")) return;

  const styles = getComputedStyle(el);
  const cr = parseFloat(styles.borderRadius) || 0;

  // Skip: no radius or pill-shaped
  if (cr <= 0 || cr >= PILL_THRESHOLD) return;

  // Skip: tiny elements (icons, dots, etc.)
  if (el.offsetWidth < 8 || el.offsetHeight < 8) return;

  if (!el.id) el.id = `${prefix}-${idx}-${Date.now()}`;

  const opts = { radius: cr, smoothing };

  try {
    ck.apply(`#${el.id}`, opts);
    el.setAttribute("data-squircle-applied", "true");
  } catch { /* not ready */ }

  // Shadow: clip-path clips box-shadow — remove entirely
  const bs = styles.boxShadow;
  if (bs && bs !== "none") {
    el.style.boxShadow = "none";
  }
}

function updateEl(
  ck: import("@cornerkit/core").default,
  el: HTMLElement,
  smoothing: number,
): void {
  const styles = getComputedStyle(el);
  const cr = parseFloat(styles.borderRadius) || 0;
  if (cr <= 0 || cr >= PILL_THRESHOLD) return;

  try {
    ck.update(`#${el.id}`, { radius: cr, smoothing });
  } catch { /* ignore */ }
}

export function SquircleProvider({
  children,
  smoothing = 0.6,
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

      // Scan ALL elements inside the container
      containerRef.current.querySelectorAll("*").forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.hasAttribute("data-squircle-applied")) {
          updateEl(ck, htmlEl, smoothing);
        } else {
          applyToEl(ck, htmlEl, smoothing, "ds-sq", i);
        }
      });

      // Scan portal elements (rendered outside container via React portals)
      if (typeof document === "undefined") return;
      document.querySelectorAll("[data-radix-portal] *, [data-slot] ").forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        // Skip elements inside our container (already processed)
        if (containerRef.current?.contains(htmlEl)) return;
        if (htmlEl.hasAttribute("data-squircle-applied")) {
          updateEl(ck, htmlEl, smoothing);
        } else {
          applyToEl(ck, htmlEl, smoothing, "ds-pt", i);
        }
      });
    });
  }, [smoothing, disabled]);

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

  React.useEffect(() => { if (!disabled) applyAll(); }, [smoothing, applyAll, disabled]);

  return (
    <div ref={containerRef} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
