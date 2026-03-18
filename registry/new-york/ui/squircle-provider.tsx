"use client";

import * as React from "react";

/**
 * SquircleProvider — DesignSync Corner Smoothing
 *
 * Applies iOS/Figma-style squircle corners via tailwind-corner-smoothing.
 * Uses CSS mask-border (NOT clip-path) — borders, shadows, and overflow
 * are preserved.
 *
 * Automatically targets ALL elements with border-radius > 0 and adds
 * the appropriate smooth-corners-{sm|md|lg} class.
 */

interface SquircleProviderProps {
  children: React.ReactNode;
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

const SMOOTH_CLASSES = ["smooth-corners-sm", "smooth-corners-md", "smooth-corners-lg"] as const;

function getSmoothClass(radiusPx: number): typeof SMOOTH_CLASSES[number] {
  if (radiusPx <= 10) return "smooth-corners-sm";
  if (radiusPx <= 30) return "smooth-corners-md";
  return "smooth-corners-lg";
}

function shouldSkip(el: HTMLElement): boolean {
  if (EXCLUDED_TAGS.has(el.tagName)) return true;
  const slot = el.getAttribute("data-slot");
  if (slot && EXCLUDED_SLOTS.has(slot)) return true;
  if (el.offsetWidth < 8 || el.offsetHeight < 8) return true;
  return false;
}

function applySmooth(el: HTMLElement): void {
  if (shouldSkip(el)) return;
  const cr = parseFloat(getComputedStyle(el).borderRadius) || 0;
  if (cr <= 0 || cr >= PILL_THRESHOLD) return;

  const cls = getSmoothClass(cr);
  if (!el.classList.contains(cls)) {
    // Remove any existing smooth class first
    SMOOTH_CLASSES.forEach((c) => el.classList.remove(c));
    el.classList.add(cls);
    el.setAttribute("data-squircle-applied", "true");
  }
}

function removeSmooth(el: HTMLElement): void {
  SMOOTH_CLASSES.forEach((c) => el.classList.remove(c));
  el.removeAttribute("data-squircle-applied");
}

export function SquircleProvider({
  children,
  disabled = false,
}: SquircleProviderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);

  const applyAll = React.useCallback(() => {
    if (disabled || !containerRef.current) return;

    // Container elements
    containerRef.current.querySelectorAll("*").forEach((el) => {
      applySmooth(el as HTMLElement);
    });

    // Portal elements (Radix portals + Sonner toasts)
    if (typeof document === "undefined") return;
    document.querySelectorAll(
      "[data-radix-portal] *, [data-sonner-toast], [data-sonner-toast] *"
    ).forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (containerRef.current?.contains(htmlEl)) return;
      applySmooth(htmlEl);
    });
  }, [disabled]);

  const removeAll = React.useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.querySelectorAll("[data-squircle-applied]").forEach((el) => {
      removeSmooth(el as HTMLElement);
    });
    if (typeof document === "undefined") return;
    document.querySelectorAll("[data-squircle-applied]").forEach((el) => {
      removeSmooth(el as HTMLElement);
    });
  }, []);

  // Container observer
  React.useEffect(() => {
    if (disabled || !containerRef.current) {
      removeAll();
      return;
    }
    const timer = setTimeout(applyAll, 100);
    const observer = new MutationObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyAll);
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [applyAll, removeAll, disabled]);

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

  React.useEffect(() => { if (!disabled) applyAll(); }, [applyAll, disabled]);

  return (
    <div ref={containerRef} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
