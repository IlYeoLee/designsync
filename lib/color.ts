/**
 * Color conversion utilities for the design token editor.
 */

/** oklch string → #rrggbb using canvas (reliable in modern browsers) */
export function oklchToHex(oklch: string): string {
  if (typeof document === 'undefined') return '#000000';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#000000';
    ctx.fillStyle = oklch;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return `#${d[0].toString(16).padStart(2, '0')}${d[1].toString(16).padStart(2, '0')}${d[2].toString(16).padStart(2, '0')}`;
  } catch {
    return '#000000';
  }
}

/** #rrggbb → oklch { l, c, h } using the OKLab color space math */
export function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const toLinear = (v: number) =>
      v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    const rl = toLinear(r), gl = toLinear(g), bl = toLinear(b);

    const x = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
    const y = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
    const z = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

    const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
    const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
    const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    const C = Math.sqrt(A * A + B * B);
    const H = Math.atan2(B, A) * 180 / Math.PI;
    return { l: L, c: C, h: H < 0 ? H + 360 : H };
  } catch {
    return null;
  }
}

/**
 * Perceptual lightness for each palette step (oklch L, 0–1).
 * Based on Tailwind/shadcn oklch scale — darker than HSL equivalents
 * because oklch L is perceptually uniform (same L = same perceived brightness).
 */
export const PALETTE_LIGHTNESS: Record<string, number> = {
  "50": 0.97, "100": 0.93, "200": 0.86, "300": 0.76,
  "400": 0.64, "500": 0.54, "600": 0.44, "700": 0.35,
  "800": 0.25, "900": 0.15,
};

/**
 * Chroma factor for each step, normalized so peak (500–600) = 1.0.
 * Matches Tailwind's natural saturation curve: vivid at mid-tones, muted at extremes.
 */
export const PALETTE_CHROMA_FACTOR: Record<string, number> = {
  "50":  0.08, "100": 0.21, "200": 0.42, "300": 0.63,
  "400": 0.83, "500": 1.00, "600": 1.00, "700": 0.88,
  "800": 0.71, "900": 0.54,
};

/**
 * Generate a full 50-900 color scale from a hex color.
 *
 * Algorithm (oklch-based, perceptually uniform):
 * - Extract hue (H) and chroma (C) from the input hex via oklch conversion.
 * - Every step uses PALETTE_LIGHTNESS[step] as the absolute L value.
 *   This ensures 50→900 spans the full perceptual brightness range regardless
 *   of the input color's original lightness.
 * - Chroma is scaled per step: stepC = inputC × PALETTE_CHROMA_FACTOR[step].
 * - All steps output `oklch(L C H)` — no special-casing for 600.
 *   This prevents the "600 pops, others look flat" artifact that occurred
 *   when 600 stored the raw hex while other steps used computed oklch values.
 */
export function generatePaletteFromHex(hex: string): Record<string, string> | null {
  const oklch = hexToOklch(hex);
  if (!oklch) return null;
  const { c, h } = oklch;
  const steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
  const result: Record<string, string> = {};
  for (const step of steps) {
    const targetL = PALETTE_LIGHTNESS[step];
    const stepC = Math.max(0, c * PALETTE_CHROMA_FACTOR[step]);
    result[step] = `oklch(${targetL.toFixed(3)} ${stepC.toFixed(3)} ${Math.round(h)})`;
  }
  return result;
}

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
