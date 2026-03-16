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

/**
 * Clamp chroma to the sRGB gamut boundary at fixed (L, H).
 * Uses binary search — H is never modified, preventing hue drift.
 */
function clampChromaToGamut(l: number, c: number, h: number): number {
  if (isInSRGBGamut(l, c, h)) return c;
  let lo = 0, hi = c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (isInSRGBGamut(l, mid, h)) lo = mid;
    else hi = mid;
  }
  return lo;
}

// ─── Tone curve ───────────────────────────────────────────────────────────────

type ToneEntry = {
  /** Target lightness. null = use input color's actual L (600 anchor). */
  l: number | null;
  /** Chroma multiplier relative to the input color's C at 600. */
  cMul: number;
  /** Degrees to shift hue. Positive = toward higher H (greener for lime). */
  hShift: number;
};

/**
 * Base tone curve — same shape as Tailwind v3/shadcn oklch palettes.
 * 600 uses l:null so the seed color's actual lightness is preserved exactly.
 */
const BASE_TONE_CURVE: Record<string, ToneEntry> = {
  "50":  { l: 0.97, cMul: 0.12, hShift: 0 },
  "100": { l: 0.93, cMul: 0.22, hShift: 0 },
  "200": { l: 0.87, cMul: 0.38, hShift: 0 },
  "300": { l: 0.79, cMul: 0.58, hShift: 0 },
  "400": { l: 0.71, cMul: 0.78, hShift: 0 },
  "500": { l: 0.64, cMul: 0.92, hShift: 0 },
  "600": { l: null, cMul: 1.00, hShift: 0 },
  "700": { l: 0.54, cMul: 0.86, hShift: 0 },
  "800": { l: 0.46, cMul: 0.68, hShift: 0 },
  "900": { l: 0.38, cMul: 0.50, hShift: 0 },
};

/** Keep PALETTE_LIGHTNESS exported — used in other editor tabs. */
export const PALETTE_LIGHTNESS: Record<string, number> = Object.fromEntries(
  Object.entries(BASE_TONE_CURVE).map(([k, v]) => [k, v.l ?? 0.44])
);

// ─── Hue-family detection & corrections ───────────────────────────────────────

type HueFamily = 'lime' | 'mint' | 'default';

function detectHueFamily(h: number, c: number): HueFamily {
  if (c < 0.05) return 'default'; // near-achromatic
  // Lime / yellow-green: 80°–145°
  if (h >= 80 && h < 145) return 'lime';
  // Mint / teal-green: 145°–190°
  if (h >= 145 && h < 190) return 'mint';
  return 'default';
}

/**
 * Layer family-specific corrections on top of the base tone entry.
 *
 * Lime (80°–145°):
 *   Light tones — reduce cMul to prevent neon-yellow cast.
 *   Dark tones  — shift H toward pure green (+) to prevent brown/olive cast.
 *
 * Mint (145°–190°):
 *   Light tones — reduce cMul strongly to prevent highlighter/neon look.
 *   Dark tones  — shift H away from cyan/teal (−) to prevent teal drift.
 */
function applyFamilyCorrections(step: string, entry: ToneEntry, family: HueFamily): ToneEntry {
  const t = { ...entry };
  const n = parseInt(step, 10);

  if (family === 'lime') {
    if (n <= 100) t.cMul *= 0.75;
    else if (n <= 200) t.cMul *= 0.82;
    else if (n <= 300) t.cMul *= 0.90;
    if (n === 700) t.hShift = +4;
    else if (n === 800) t.hShift = +7;
    else if (n === 900) t.hShift = +10;
  } else if (family === 'mint') {
    if (n <= 100) t.cMul *= 0.50;
    else if (n <= 200) t.cMul *= 0.62;
    else if (n <= 300) t.cMul *= 0.75;
    else if (n <= 400) t.cMul *= 0.87;
    if (n === 700) t.hShift = -4;
    else if (n === 800) t.hShift = -7;
    else if (n === 900) t.hShift = -10;
  }

  return t;
}

// ─── Main palette generator ───────────────────────────────────────────────────

/**
 * Generate a full 50–900 oklch palette from a seed hex color.
 *
 * Algorithm:
 * 1. Convert hex → oklch(inputL, inputC, inputH).
 * 2. Detect hue family (lime / mint / default) for family corrections.
 * 3. Step 600 = original hex (pixel-perfect anchor).
 * 4. For every other step:
 *    a. Target L  = BASE_TONE_CURVE[step].l
 *    b. Target H  = inputH + hShift  (family correction, ±0–10°)
 *    c. Target C  = inputC × cMul   (base × family correction)
 *    d. Gamut map : if (L, C, H) is outside sRGB, binary-search the
 *       maximum in-gamut chroma while keeping L and H fixed.
 * 5. Console-log each step's final L/C/H plus any gamut-clip notes.
 */
export function generatePaletteFromHex(hex: string): Record<string, string> | null {
  const oklch = hexToOklch(hex);
  if (!oklch) return null;
  const { l: inputL, c: inputC, h: inputH } = oklch;

  const family = detectHueFamily(inputH, inputC);
  const steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;
  const result: Record<string, string> = {};

  console.group(
    `[palette] ${hex}  L=${inputL.toFixed(3)} C=${inputC.toFixed(3)} H=${inputH.toFixed(1)}°` +
    (family !== 'default' ? `  family=${family}` : '')
  );

  for (const step of steps) {
    if (step === "600") {
      result[step] = hex;
      console.log(`  600  anchor  L=${inputL.toFixed(3)} C=${inputC.toFixed(3)} H=${inputH.toFixed(1)}° (original hex)`);
      continue;
    }

    const base = BASE_TONE_CURVE[step];
    const entry = applyFamilyCorrections(step, base, family);

    const targetL = entry.l!;
    const targetH = ((inputH + entry.hShift) % 360 + 360) % 360;
    const nominalC = inputC * entry.cMul;
    const finalC = clampChromaToGamut(targetL, nominalC, targetH);
    const clipped = finalC < nominalC - 0.0005;

    result[step] = `oklch(${targetL.toFixed(3)} ${finalC.toFixed(4)} ${targetH.toFixed(2)})`;

    const hTag = entry.hShift !== 0 ? ` hShift=${entry.hShift > 0 ? '+' : ''}${entry.hShift}°` : '';
    const cTag = clipped
      ? `  ⚠ gamut C ${nominalC.toFixed(3)}→${finalC.toFixed(3)}`
      : '';
    console.log(
      `  ${step.padStart(3)}  L=${targetL.toFixed(3)} C=${finalC.toFixed(4)} H=${targetH.toFixed(1)}°${hTag}${cTag}`
    );
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
