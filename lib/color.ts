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

// ─── Gamut helpers ────────────────────────────────────────────────────────────

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

/** Maximum in-gamut chroma at (L, H) via binary search. */
function maxGamutChroma(l: number, h: number): number {
  if (isInSRGBGamut(l, 0.5, h)) return 0.5;
  let lo = 0, hi = 0.5;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (isInSRGBGamut(l, mid, h)) lo = mid;
    else hi = mid;
  }
  return lo;
}

// ─── Palette generator ────────────────────────────────────────────────────────

/**
 * Reference lightness values for a mid-tone seed (L≈0.50 at step 600).
 * Used by other editor tabs for display. Actual generated L values are
 * adaptive per seed — see generatePaletteFromHex.
 */
export const PALETTE_LIGHTNESS: Record<string, number> = {
  "50":  0.947, "100": 0.866, "200": 0.773, "300": 0.679,
  "400": 0.594, "500": 0.538, "600": 0.500,
  "700": 0.420, "800": 0.300, "900": 0.180,
};

/**
 * Generate a full 50–900 oklch palette anchored at step 600.
 *
 * Algorithm:
 * 1. Extract (inputL, inputC, inputH) from the seed hex.
 * 2. Compute satRatio = inputC / maxGamutChroma(inputL, inputH).
 *    This captures "how saturated the seed is relative to its gamut max."
 * 3. Step 600 = original hex exactly (pixel-perfect anchor).
 * 4. Other steps use adaptive lightness:
 *    - Steps 50–500: interpolate upward from inputL → 0.97
 *    - Steps 700–900: interpolate downward from inputL → 0.10
 * 5. Each step's C = satRatio × maxGamutChroma(targetL, inputH).
 *    This preserves the seed's relative vividness across all tones.
 * 6. H is never modified — no hue drift.
 */
export function generatePaletteFromHex(hex: string): Record<string, string> | null {
  const oklch = hexToOklch(hex);
  if (!oklch) return null;
  const { l: inputL, c: inputC, h: inputH } = oklch;

  // Saturation ratio: how vivid is the seed relative to its gamut ceiling?
  const maxCSeed = maxGamutChroma(inputL, inputH);
  const satRatio = maxCSeed > 0.005 ? Math.min(inputC / maxCSeed, 1) : 0;

  // Adaptive L spread: light steps go up to 0.97, dark steps down to 0.10
  const lightRange = Math.max(0.97 - inputL, 0.01);
  const darkRange  = Math.max(inputL - 0.10, 0.01);
  const lLight = (f: number) => inputL + f * lightRange;
  const lDark  = (f: number) => inputL - f * darkRange;

  // Fractional positions relative to the anchor (tuned for perceptual evenness)
  const stepL: Record<string, number | null> = {
    "50":  lLight(0.95),
    "100": lLight(0.78),
    "200": lLight(0.58),
    "300": lLight(0.38),
    "400": lLight(0.20),
    "500": lLight(0.08),
    "600": null,        // exact anchor
    "700": lDark(0.20),
    "800": lDark(0.50),
    "900": lDark(0.80),
  };

  const result: Record<string, string> = {};

  for (const [step, tL] of Object.entries(stepL)) {
    if (tL === null) {
      result[step] = hex;
      continue;
    }
    const c = satRatio * maxGamutChroma(tL, inputH);
    result[step] = `oklch(${tL.toFixed(3)} ${c.toFixed(4)} ${inputH.toFixed(2)})`;
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
