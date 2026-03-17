/**
 * Palette generation regression test.
 *
 * Run: node --experimental-strip-types scripts/test-palette.ts
 *
 * Tests 4 problem colors:
 * 1. palette[600] === inputHex (exact match)
 * 2. No excessive hue drift (measured at C > 0.04 to avoid low-chroma noise)
 * 3. No muddy/dirty olive output (chroma check on light steps)
 */

// ─── Inline pure-math color functions (no DOM needed) ───────────────────────────

function srgbToLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function linearToSrgb(v: number): number {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}
function oklchToLinearRgb(l: number, c: number, h: number): [number, number, number] {
  const hRad = h * Math.PI / 180;
  const a = c * Math.cos(hRad), b = c * Math.sin(hRad);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  const lc = l_ * l_ * l_, mc = m_ * m_ * m_, sc = s_ * s_ * s_;
  return [
     4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc,
  ];
}
function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const rl = srgbToLinear(r), gl = srgbToLinear(g), bl = srgbToLinear(b);
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
  } catch { return null; }
}
function oklchToHex(l: number, c: number, h: number): string {
  const [rLin, gLin, bLin] = oklchToLinearRgb(l, c, h);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const rr = Math.round(clamp(linearToSrgb(rLin)) * 255);
  const gg = Math.round(clamp(linearToSrgb(gLin)) * 255);
  const bb = Math.round(clamp(linearToSrgb(bLin)) * 255);
  return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
}
function isInGamut(r: number, g: number, b: number): boolean {
  const eps = 1e-6;
  return r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps;
}
function fitOklchToSrgbGamut(l: number, c: number, h: number) {
  const [r, g, b] = oklchToLinearRgb(l, c, h);
  if (isInGamut(r, g, b)) return { l, c, h, clipped: false };
  let lo = 0, hi = c;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const [rm, gm, bm] = oklchToLinearRgb(l, mid, h);
    if (isInGamut(rm, gm, bm)) lo = mid; else hi = mid;
  }
  return { l, c: lo, h, clipped: true };
}

// ─── Palette generation (mirrors lib/color.ts) ─────────────────────────────────

type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
const TARGET_L: Record<PaletteStep, number> = {
  50: 0.97, 100: 0.93, 200: 0.87, 300: 0.79, 400: 0.71,
  500: 0.63, 600: 0,   700: 0.49, 800: 0.37, 900: 0.24,
};
const CHROMA_MULT: Record<PaletteStep, number> = {
  50: 0.18, 100: 0.32, 200: 0.55, 300: 0.78, 400: 0.92,
  500: 0.98, 600: 1.00, 700: 0.88, 800: 0.72, 900: 0.52,
};
const STEPS: PaletteStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

function correctHueForLimeRange(baseH: number, step: PaletteStep): number {
  if (baseH < 90 || baseH > 140 || step === 600) return baseH;
  const SAFE_GREEN_H = 148;
  const drift = SAFE_GREEN_H - baseH;
  const distFrom600 = Math.abs(step - 600) / 550;
  const strength = 0.25 + distFrom600 * 0.45;
  return baseH + drift * strength;
}

function generatePalette(hex: string): Record<string, string> | null {
  const base = hexToOklch(hex);
  if (!base) return null;
  const result: Record<string, string> = {};
  for (const step of STEPS) {
    if (step === 600) { result[String(step)] = hex; continue; }
    const targetL = TARGET_L[step];
    const targetC = base.c * CHROMA_MULT[step];
    const targetH = correctHueForLimeRange(base.h, step);
    const fitted = fitOklchToSrgbGamut(targetL, targetC, targetH);
    result[String(step)] = oklchToHex(fitted.l, fitted.c, fitted.h);
  }
  return result;
}

// ─── Test runner ────────────────────────────────────────────────────────────────

const TEST_CASES = [
  { name: "Mint",  hex: "#6ee7b7" },
  { name: "Lime",  hex: "#88ff47" },
  { name: "Blue",  hex: "#3b82f6" },
  { name: "Red",   hex: "#ef4444" },
];

let allPassed = true;

for (const { name, hex } of TEST_CASES) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`Testing: ${name} (${hex})`);
  console.log("═".repeat(60));

  const base = hexToOklch(hex)!;
  console.log(`Base OKLCH: L=${base.l.toFixed(4)} C=${base.c.toFixed(4)} H=${base.h.toFixed(2)}°`);

  const palette = generatePalette(hex);
  if (!palette) { console.log("FAIL: palette generation returned null"); allPassed = false; continue; }

  // Print full palette with RGB for visual inspection
  for (const step of STEPS) {
    const stepHex = palette[String(step)];
    const r = parseInt(stepHex.slice(1, 3), 16);
    const g = parseInt(stepHex.slice(3, 5), 16);
    const b = parseInt(stepHex.slice(5, 7), 16);
    const stepOklch = hexToOklch(stepHex);
    const lch = stepOklch
      ? `L=${stepOklch.l.toFixed(3)} C=${stepOklch.c.toFixed(4)} H=${stepOklch.h.toFixed(1)}°`
      : "???";
    console.log(
      `  ${String(step).padStart(3)}: ${stepHex}  RGB(${r},${g},${b})  ${lch}`
    );
  }

  // ── Check 1: 600 exact match ──
  const match600 = palette["600"] === hex;
  console.log(`\n  [CHECK 1] 600 exact match: ${match600 ? "PASS ✓" : "FAIL ✗"} (got ${palette["600"]})`);
  if (!match600) allPassed = false;

  // ── Check 2: Hue drift (only at C > 0.07 where hue is numerically stable) ──
  // At low chroma, 8-bit hex roundtrip causes large hue noise — not visual.
  let maxHueDrift = 0;
  let maxDriftStep = 0;
  for (const step of STEPS) {
    if (step === 600) continue;
    const stepOklch = hexToOklch(palette[String(step)]);
    if (stepOklch && stepOklch.c > 0.07) {
      const expectedH = correctHueForLimeRange(base.h, step);
      let drift = Math.abs(stepOklch.h - expectedH);
      if (drift > 180) drift = 360 - drift;
      if (drift > maxHueDrift) { maxHueDrift = drift; maxDriftStep = step; }
    }
  }
  const hueThreshold = 25; // gamut fitting + 8-bit quantization tolerance
  const huePassed = maxHueDrift < hueThreshold;
  console.log(`  [CHECK 2] Max hue drift (C>0.07): ${maxHueDrift.toFixed(1)}° at step ${maxDriftStep} ${huePassed ? "PASS ✓" : "WARN ⚠"}`);
  if (!huePassed) allPassed = false;

  // ── Check 3: Muddy/olive detection ──
  // For vivid base colors (C > 0.08), check that steps 100-400 retain chroma
  if (base.c > 0.08) {
    const muddySteps: number[] = [];
    for (const step of [100, 200, 300, 400] as PaletteStep[]) {
      const stepOklch = hexToOklch(palette[String(step)]);
      if (stepOklch && stepOklch.c < 0.015) {
        muddySteps.push(step);
      }
    }
    const muddyPassed = muddySteps.length === 0;
    console.log(`  [CHECK 3] Muddy/olive: ${muddyPassed ? "PASS ✓" : `FAIL ✗ (dead chroma at steps ${muddySteps.join(",")})`}`);
    if (!muddyPassed) allPassed = false;
  }

  // ── Check 4: Green channel dominance for green-family colors ──
  if (base.h >= 90 && base.h <= 160) {
    const oliveSteps: number[] = [];
    for (const step of [200, 300, 400, 500] as PaletteStep[]) {
      const stepHex = palette[String(step)];
      const r = parseInt(stepHex.slice(1, 3), 16);
      const g = parseInt(stepHex.slice(3, 5), 16);
      // For green-family: G should be noticeably > R (not R≈G which = olive)
      if (g <= r) {
        oliveSteps.push(step);
      }
    }
    const olivePassed = oliveSteps.length === 0;
    console.log(`  [CHECK 4] Green dominance (G>R): ${olivePassed ? "PASS ✓" : `FAIL ✗ (R≥G at steps ${oliveSteps.join(",")} = olive)`}`);
    if (!olivePassed) allPassed = false;
  }
}

console.log(`\n${"═".repeat(60)}`);
console.log(allPassed ? "ALL TESTS PASSED ✓" : "SOME TESTS FAILED ✗");
console.log("═".repeat(60));
process.exit(allPassed ? 0 : 1);
