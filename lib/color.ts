/**
 * OKLCH-based deterministic color palette generator for DesignSync.
 *
 * Uses colorizr's scale() for palette generation with step 600 locked to the input color.
 * Pure-math OKLCH ↔ hex conversions are kept for other modules.
 */

import { scale } from 'colorizr';

/** Backward-compatible export for modules that reference PALETTE_LIGHTNESS. */
export const PALETTE_LIGHTNESS: Record<string, number> = {
  "50": 0.97, "100": 0.93, "200": 0.87, "300": 0.79, "400": 0.71,
  "500": 0.63, "600": 0.48, "700": 0.49, "800": 0.37, "900": 0.24,
};

// ─── Low-level color math ───────────────────────────────────────────────────────

/** sRGB gamma → linear */
function srgbToLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** linear → sRGB gamma */
function linearToSrgb(v: number): number {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

/** OKLCH → linear sRGB triplet (may be out of gamut) */
function oklchToLinearRgb(l: number, c: number, h: number): [number, number, number] {
  const hRad = h * Math.PI / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab → LMS (cube root domain)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  // Cube to get LMS
  const lc = l_ * l_ * l_;
  const mc = m_ * m_ * m_;
  const sc = s_ * s_ * s_;

  // LMS → linear sRGB
  return [
     4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc,
  ];
}

// ─── Public conversion functions ────────────────────────────────────────────────

/** #rrggbb → OKLCH { l, c, h } (pure math, works server & client) */
export function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const rl = srgbToLinear(r), gl = srgbToLinear(g), bl = srgbToLinear(b);

    // linear sRGB → intermediate (M1 matrix for OKLab)
    const x = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
    const y = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
    const z = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

    // → LMS cube root
    const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
    const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
    const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

    // → OKLab
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    // → OKLCH
    const C = Math.sqrt(A * A + B * B);
    const H = Math.atan2(B, A) * 180 / Math.PI;
    return { l: L, c: C, h: H < 0 ? H + 360 : H };
  } catch {
    return null;
  }
}

/**
 * OKLCH → #rrggbb (pure math, no canvas dependency).
 *
 * Overloaded:
 * - oklchToHex(l, c, h)         — numbers → hex
 * - oklchToHex("oklch(l c h)")  — CSS string → hex (backward compat)
 */
export function oklchToHex(lOrCss: number | string, cVal?: number, hVal?: number): string {
  let l: number, c: number, h: number;

  if (typeof lOrCss === 'string') {
    // Already hex? Pass through.
    if (lOrCss.startsWith('#')) return lOrCss;

    // Parse oklch(...) CSS string
    const match = lOrCss.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (match) {
      l = parseFloat(match[1]);
      c = parseFloat(match[2]);
      h = parseFloat(match[3]);
    } else {
      // Fallback: canvas for arbitrary CSS colors (browser only)
      if (typeof document !== 'undefined') {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 1; canvas.height = 1;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = lOrCss;
            ctx.fillRect(0, 0, 1, 1);
            const d = ctx.getImageData(0, 0, 1, 1).data;
            return `#${d[0].toString(16).padStart(2, '0')}${d[1].toString(16).padStart(2, '0')}${d[2].toString(16).padStart(2, '0')}`;
          }
        } catch { /* fall through */ }
      }
      return '#000000';
    }
  } else {
    l = lOrCss;
    c = cVal ?? 0;
    h = hVal ?? 0;
  }

  const [rLin, gLin, bLin] = oklchToLinearRgb(l, c, h);

  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const rr = Math.round(clamp(linearToSrgb(rLin)) * 255);
  const gg = Math.round(clamp(linearToSrgb(gLin)) * 255);
  const bb = Math.round(clamp(linearToSrgb(bLin)) * 255);

  return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
}

// ─── Main palette generator ─────────────────────────────────────────────────────

/**
 * Generate a 50–900 OKLCH palette with the input hex anchored at step 600.
 *
 * Uses colorizr's scale() with lock: 600 to preserve the input color exactly.
 *
 * @param hex - Base color as #rrggbb, becomes palette[600]
 */
export function generatePaletteFromHex(hex: string): Record<string, string> | null {
  try {
    const palette = scale(hex, {
      steps: 10,
      lock: 600,
      minLightness: 0.16,
      maxLightness: 0.97,
      lightnessCurve: 1.5,
    });

    // Convert numeric keys to string keys for backward compatibility
    const result: Record<string, string> = {};
    for (const [step, color] of Object.entries(palette)) {
      result[step] = color;
    }

    return result;
  } catch {
    return null;
  }
}

// ─── Utility ────────────────────────────────────────────────────────────────────

/** Convert any CSS color value to hex */
export function resolveColorToHex(value: string): string {
  if (typeof document === 'undefined') return '#000000';
  if (value.startsWith('#')) return value;
  if (value.startsWith('oklch')) return oklchToHex(value);
  if (value.startsWith('var(')) {
    const varName = value.match(/var\(([^)]+)\)/)?.[1];
    if (varName) {
      const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return resolveColorToHex(resolved);
    }
  }
  return oklchToHex(value);
}
