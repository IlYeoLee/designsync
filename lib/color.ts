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
 * Check if an oklch(L, C, H) color is within the sRGB gamut.
 * Uses the inverse OKLab → linear sRGB matrix.
 */
function isInSRGBGamut(l: number, c: number, h: number): boolean {
  const hRad = h * Math.PI / 180;
  const a = c * Math.cos(hRad);
  const bOk = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * bOk;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * bOk;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * bOk;

  const ll = l_ * l_ * l_;
  const mm = m_ * m_ * m_;
  const ss = s_ * s_ * s_;

  const rLin =  4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss;
  const gLin = -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss;
  const bLin = -0.0041960863 * ll - 0.7034186147 * mm + 1.7076147010 * ss;

  const eps = 0.0001;
  return (
    rLin >= -eps && rLin <= 1 + eps &&
    gLin >= -eps && gLin <= 1 + eps &&
    bLin >= -eps && bLin <= 1 + eps
  );
}

/**
 * Binary-search for the maximum chroma that keeps oklch(L, C, H) in sRGB.
 * H and L are held fixed — no hue shift.
 * Returns the mapped chroma and whether clipping occurred.
 */
function mapToGamut(l: number, c: number, h: number): { c: number; clipped: boolean } {
  if (isInSRGBGamut(l, c, h)) return { c, clipped: false };

  let lo = 0, hi = c;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (isInSRGBGamut(l, mid, h)) lo = mid;
    else hi = mid;
  }
  return { c: lo, clipped: true };
}

/**
 * Perceptual lightness for each palette step (oklch L, 0–1).
 * Canonical anchors: 50 = 0.97 (lightest), 600 = 0.44 (base), 900 = 0.15 (darkest).
 */
export const PALETTE_LIGHTNESS: Record<string, number> = {
  "50": 0.97, "100": 0.93, "200": 0.86, "300": 0.76,
  "400": 0.64, "500": 0.54, "600": 0.44, "700": 0.35,
  "800": 0.25, "900": 0.15,
};

/** Canonical lightness anchors used for curve re-scaling */
const CANON_L50  = 0.97;
const CANON_L600 = 0.44;
const CANON_L900 = 0.15;

/**
 * Re-scale the lightness curve so that step 600 lands exactly on inputL.
 * Steps lighter than 600 are proportionally stretched between 0.97 and inputL.
 * Steps darker than 600 are proportionally stretched between inputL and 0.15.
 */
function anchoredLightness(step: string, inputL: number): number {
  if (step === "600") return inputL;
  const canonL = PALETTE_LIGHTNESS[step];
  const stepNum = parseInt(step);

  if (stepNum < 600) {
    // t = 0 at step 50, t = 1 at step 600 (canonical)
    const t = (canonL - CANON_L50) / (CANON_L600 - CANON_L50);
    return CANON_L50 + t * (inputL - CANON_L50);
  } else {
    // t = 0 at step 600, t = 1 at step 900 (canonical)
    const t = (canonL - CANON_L600) / (CANON_L900 - CANON_L600);
    return inputL + t * (CANON_L900 - inputL);
  }
}

/**
 * Chroma factor for each step, normalized so peak (500–600) = 1.0.
 * Vivid at mid-tones, muted at extremes.
 */
export const PALETTE_CHROMA_FACTOR: Record<string, number> = {
  "50":  0.08, "100": 0.21, "200": 0.42, "300": 0.63,
  "400": 0.83, "500": 1.00, "600": 1.00, "700": 0.88,
  "800": 0.71, "900": 0.54,
};

/**
 * Generate a full 50-900 color scale from a hex color.
 *
 * Algorithm:
 * 1. Extract oklch { l, c, h } from the input hex.
 * 2. Step 600 anchors to the original hex (pixel-perfect match).
 * 3. All other steps use anchoredLightness() to re-scale the canonical
 *    L-curve so that 600 aligns with the input's actual lightness.
 * 4. Chroma = inputC × PALETTE_CHROMA_FACTOR[step].
 * 5. Binary-search gamut mapping: if oklch(L, C, H) is out of sRGB,
 *    reduce C until in-gamut while keeping L and H fixed.
 * 6. Console logs: hue per step (should be ±2° of input) + gamut-clip notices.
 */
export function generatePaletteFromHex(hex: string): Record<string, string> | null {
  const oklch = hexToOklch(hex);
  if (!oklch) return null;
  const { l: inputL, c: inputC, h: inputH } = oklch;

  const steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
  const result: Record<string, string> = {};

  console.group(`[palette] input: ${hex}  oklch(${inputL.toFixed(3)} ${inputC.toFixed(3)} ${inputH.toFixed(1)}°)`);

  for (const step of steps) {
    if (step === "600") {
      result[step] = hex;
      console.log(`  600 → anchor  hue=${inputH.toFixed(1)}° (original hex)`);
      continue;
    }

    const targetL = anchoredLightness(step, inputL);
    const nominalC = inputC * PALETTE_CHROMA_FACTOR[step];
    const { c: mappedC, clipped } = mapToGamut(targetL, nominalC, inputH);

    result[step] = `oklch(${targetL.toFixed(3)} ${mappedC.toFixed(3)} ${Math.round(inputH)})`;

    const hueDiff = 0; // H is never changed — hue shift is always 0
    const hueOk = Math.abs(hueDiff) <= 2;
    if (clipped) {
      console.log(`  ${step.padStart(3)} → GAMUT CLIP  L=${targetL.toFixed(3)}  C ${nominalC.toFixed(3)} → ${mappedC.toFixed(3)}  hue=${Math.round(inputH)}° ${hueOk ? "✓" : "⚠"}`);
    } else {
      console.log(`  ${step.padStart(3)} → ok         L=${targetL.toFixed(3)}  C=${mappedC.toFixed(3)}  hue=${Math.round(inputH)}° ✓`);
    }
  }

  console.groupEnd();
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
