"use client";

import * as React from "react";

/**
 * SquircleProvider — DesignSync Corner Smoothing
 *
 * Applies iOS/Figma-style squircle corners via @cornerkit/core.
 * Automatically targets ALL elements with border-radius > 0.
 *
 * CornerKit handles clip-path, shadow, and border internally.
 * We only call apply/update — no manual CSS manipulation.
 */

interface SquircleProviderProps {
  children: React.ReactNode;
  smoothing?: number;
  disabled?: boolean;
}

const PILL_THRESHOLD = 9000;

const EXCLUDED_TAGS = new Set([
  "HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "LINK", "META",
  "SVG", "PATH", "CIRCLE", "RECT", "LINE", "POLYGON",
  "IFRAME", "VIDEO", "CANVAS", "IMG",
]);

const EXCLUDED_SLOTS = new Set([
  "carousel", "carousel-content",
  "resizable-panel", "resizable-handle",
  "scroll-area", "scroll-area-viewport",
  "sidebar",
]);

function shouldSkip(el: HTMLElement): boolean {
  if (EXCLUDED_TAGS.has(el.tagName)) return true;
  const slot = el.getAttribute("data-slot");
  if (slot && EXCLUDED_SLOTS.has(slot)) return true;
  if (el.offsetWidth < 8 || el.offsetHeight < 8) return true;
  return false;
}

function getRadius(el: HTMLElement): number {
  const cr = parseFloat(getComputedStyle(el).borderRadius) || 0;
  if (cr <= 0 || cr >= PILL_THRESHOLD) return 0;
  return cr;
}

function getBorder(el: HTMLElement): { width: number; color: string } | null {
  const styles = getComputedStyle(el);
  const bw = parseFloat(styles.borderWidth) || 0;
  const bc = styles.borderColor || "";
  if (bw > 0 && bc && bc !== "transparent" && bc !== "rgba(0, 0, 0, 0)") {
    return { width: bw, color: bc };
  }
  return null;
}

export function SquircleProvider({
  children,
  smoothing = 0.6,
  disabled = false,
}: SquircleProviderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const ckRef = React.useRef<import("@cornerkit/core").default | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const applyAll = React.useCallback(() => {
    if (disabled || !containerRef.current) return;

    import("@cornerkit/core").then(({ default: CK }) => {
      if (!containerRef.current) return;
      if (!ckRef.current) ckRef.current = new CK();
      const ck = ckRef.current;

      const processEl = (el: HTMLElement, prefix: string, idx: number) => {
        if (shouldSkip(el)) return;
        const cr = getRadius(el);
        if (cr <= 0) return;
        if (!el.id) el.id = `${prefix}-${idx}-${Date.now()}`;

        const opts: Record<string, unknown> = { radius: cr, smoothing };
        const border = getBorder(el);
        if (border) opts.border = border;

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
      };

      // Container elements
      containerRef.current.querySelectorAll("*").forEach((el, i) => {
        processEl(el as HTMLElement, "ds-sq", i);
      });

      // Portal elements (Radix portals + Sonner toasts)
      if (typeof document === "undefined") return;
      document.querySelectorAll(
        "[data-radix-portal] *, [data-sonner-toast], [data-sonner-toast] *"
      ).forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        if (containerRef.current?.contains(htmlEl)) return;
        processEl(htmlEl, "ds-pt", i);
      });
    });
  }, [smoothing, disabled]);

  // Container observer
  React.useEffect(() => {
    if (disabled || !containerRef.current) return;
    const timer = setTimeout(applyAll, 100);
    const observer = new MutationObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyAll);
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [applyAll, disabled]);

  // Portal observer (Radix + Sonner)
  React.useEffect(() => {
    if (disabled || typeof document === "undefined") return;
    const observer = new MutationObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyAll);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); };
  }, [applyAll, disabled]);

  React.useEffect(() => { if (!disabled) applyAll(); }, [smoothing, applyAll, disabled]);

  return (
    <div ref={containerRef} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
