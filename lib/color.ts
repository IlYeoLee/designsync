/**
 * OKLCH-based deterministic color palette generator for DesignSync.
 *
 * Core design:
 * - Step 600 = exact input hex anchor (NEVER modified or recalculated)
 * - Other steps use fixed target L values with chroma multipliers
 * - Gamut mapping: reduce chroma only, preserve L and H
 * - Hue correction for yellow-green/lime (H 90°–140°) to prevent olive/khaki
 *
 * Color pipeline: hex → sRGB → linear sRGB → OKLab → OKLCH → tone → gamut fit → hex
 */

// ─── Types ──────────────────────────────────────────────────────────────────────

type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

// ─── Constants ──────────────────────────────────────────────────────────────────

/** Target OKLCH L for each palette step. 600 is a placeholder — uses base L. */
const TARGET_L: Record<PaletteStep, number> = {
  50: 0.97, 100: 0.93, 200: 0.87, 300: 0.79, 400: 0.71,
  500: 0.63, 600: 0,   700: 0.49, 800: 0.37, 900: 0.24,
};

/** Chroma multiplier relative to base chroma for each step. */
const CHROMA_MULT: Record<PaletteStep, number> = {
  50: 0.18, 100: 0.32, 200: 0.55, 300: 0.78, 400: 0.92,
  500: 0.98, 600: 1.00, 700: 0.88, 800: 0.72, 900: 0.52,
};

const PALETTE_STEPS: PaletteStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

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

/** Check if linear sRGB values are within [0, 1] gamut */
function isInGamut(r: number, g: number, b: number): boolean {
  const eps = 1e-6;
  return (
    r >= -eps && r <= 1 + eps &&
    g >= -eps && g <= 1 + eps &&
    b >= -eps && b <= 1 + eps
  );
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

// ─── Gamut mapping ──────────────────────────────────────────────────────────────

/**
 * Fit an OKLCH color into sRGB gamut by reducing chroma only.
 * L and H are strictly preserved. Uses binary search (32 iterations).
 */
export function fitOklchToSrgbGamut(
  l: number, c: number, h: number
): { l: number; c: number; h: number; clipped: boolean } {
  const [r, g, b] = oklchToLinearRgb(l, c, h);
  if (isInGamut(r, g, b)) {
    return { l, c, h, clipped: false };
  }

  // Binary search: keep L & H, reduce C until in gamut
  let lo = 0, hi = c;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const [rm, gm, bm] = oklchToLinearRgb(l, mid, h);
    if (isInGamut(rm, gm, bm)) lo = mid;
    else hi = mid;
  }

  return { l, c: lo, h, clipped: true };
}

// ─── Step tone generation ───────────────────────────────────────────────────────

/**
 * Compute the corrected hue for yellow-green/lime colors.
 *
 * Problem: OKLCH H 90°–140° (yellow-green) produces olive/khaki when
 * lightness or chroma changes, because sRGB gamut is narrow in the
 * green direction at extreme lightness.
 *
 * Solution: shift hue toward "safe green" (H≈148°) for non-anchor steps.
 * Steps further from the 600 anchor get stronger correction.
 * This makes the palette read as "green family" instead of "olive".
 */
function correctHueForLimeRange(baseH: number, step: PaletteStep): number {
  if (baseH < 90 || baseH > 140 || step === 600) return baseH;

  const SAFE_GREEN_H = 148;
  const drift = SAFE_GREEN_H - baseH; // positive = toward green

  // Correction strength: stronger for steps far from anchor (600)
  // Ranges from 0.25 (near 600) to 0.70 (at extremes like 50, 900)
  const distFrom600 = Math.abs(step - 600) / 550;
  const strength = 0.25 + distFrom600 * 0.45;

  return baseH + drift * strength;
}

/**
 * Generate OKLCH values for a single palette step.
 *
 * - Step 600 = exact base values (anchor, never modified)
 * - L = fixed target from TARGET_L
 * - C = baseC × CHROMA_MULT[step], then gamut-fitted
 * - H = baseH with lime correction if applicable
 */
export function generateStepTone(
  base: { l: number; c: number; h: number },
  step: PaletteStep
): { l: number; c: number; h: number; clipped: boolean } {
  if (step === 600) {
    return { ...base, clipped: false };
  }

  const targetL = TARGET_L[step];
  const targetC = base.c * CHROMA_MULT[step];
  const targetH = correctHueForLimeRange(base.h, step);

  return fitOklchToSrgbGamut(targetL, targetC, targetH);
}

// ─── Main palette generator ─────────────────────────────────────────────────────

/**
 * Generate a 50–900 OKLCH palette with the input hex anchored at step 600.
 *
 * - palette[600] === inputHex (exact, never recalculated)
 * - All other steps returned as hex strings
 * - Debug info logged to console
 *
 * @param hex - Base color as #rrggbb, becomes palette[600]
 */
export function generatePaletteFromHex(hex: string): Record<string, string> | null {
  const base = hexToOklch(hex);
  if (!base) return null;

  const result: Record<string, string> = {};

  for (const step of PALETTE_STEPS) {
    if (step === 600) {
      // Exact anchor — original hex, no conversion
      result[String(step)] = hex;
      console.log("[palette]", {
        step, l: +base.l.toFixed(4), c: +base.c.toFixed(4), h: +base.h.toFixed(2),
        hex, clipped: false,
      });
      continue;
    }

    const tone = generateStepTone(base, step);
    const stepHex = oklchToHex(tone.l, tone.c, tone.h);

    result[String(step)] = stepHex;
    console.log("[palette]", {
      step,
      l: +tone.l.toFixed(4),
      c: +tone.c.toFixed(4),
      h: +tone.h.toFixed(2),
      hex: stepHex,
      clipped: tone.clipped,
    });
  }

  return result;
}

/** Alias for explicit naming */
export const generateBrandPaletteFrom600 = generatePaletteFromHex;

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
