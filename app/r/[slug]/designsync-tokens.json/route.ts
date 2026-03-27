import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { STYLE_PRESETS } from "@/lib/style-presets";
import { oklchToHex } from "@/lib/color";
import { readableColor } from "colorizr";
import { GOOGLE_FONTS, KOREAN_FONTS } from "@/lib/fonts";

const CDN_BASE = "https://designsync-omega.vercel.app";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Resolve var(--brand-600) → actual value from primitives map */
function resolveToken(
  value: string,
  primitives: Record<string, string>
): string {
  if (!value.startsWith("var(")) return value;
  const varName = value.match(/var\(([^)]+)\)/)?.[1];
  if (!varName) return value;
  return primitives[varName] ?? value;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("design_systems")
    .select("tokens, style_preset")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Design system not found" },
      { status: 404 }
    );
  }

  const tokens = data.tokens;

  // 1. Flatten primitives for resolving var() references
  const flatPrimitives: Record<string, string> = {};
  const { brand, neutral, error: errorScale, success, warning, radius } =
    tokens.primitives || {};

  for (const [step, val] of Object.entries((brand || {}) as Record<string, string>)) {
    flatPrimitives[`--brand-${step}`] = val;
  }
  for (const [step, val] of Object.entries((neutral || {}) as Record<string, string>)) {
    flatPrimitives[`--neutral-${step}`] = val;
  }
  for (const [step, val] of Object.entries((errorScale || {}) as Record<string, string>)) {
    flatPrimitives[`--error-${step}`] = val;
  }
  for (const [step, val] of Object.entries((success || {}) as Record<string, string>)) {
    flatPrimitives[`--success-${step}`] = val;
  }
  for (const [step, val] of Object.entries((warning || {}) as Record<string, string>)) {
    flatPrimitives[`--warning-${step}`] = val;
  }
  if (radius) {
    flatPrimitives["--radius-none"] = radius.none;
    flatPrimitives["--radius-sm-prim"] = radius.sm;
    flatPrimitives["--radius-md-prim"] = radius.md;
    flatPrimitives["--radius-lg-prim"] = radius.lg;
    flatPrimitives["--radius-xl-prim"] = radius.xl;
    flatPrimitives["--radius-full"] = radius.full;
  }

  // Build cssVars from tokens (light + dark)
  const lightVars: Record<string, string> = {};
  const darkVars: Record<string, string> = {};

  // Primitive color scales (brand, neutral, error, success, warning)
  const colorScales = ["brand", "neutral", "error", "success", "warning"] as const;
  for (const scale of colorScales) {
    if (tokens.primitives?.[scale]) {
      for (const [step, val] of Object.entries(tokens.primitives[scale] as Record<string, string>)) {
        lightVars[`${scale}-${step}`] = val;
        darkVars[`${scale}-${step}`] = val;
      }
    }
  }

  // Primitive spacing
  if (tokens.primitives?.spacing) {
    for (const [key, val] of Object.entries(tokens.primitives.spacing as Record<string, string>)) {
      lightVars[`spacing-${key}`] = val;
      darkVars[`spacing-${key}`] = val;
    }
  }

  // Primitive radius
  if (tokens.primitives?.radius) {
    const radiusMap: Record<string, string> = { none: "radius-none", sm: "radius-sm-prim", md: "radius-md-prim", lg: "radius-lg-prim", xl: "radius-xl-prim", full: "radius-full" };
    for (const [key, val] of Object.entries(tokens.primitives.radius as Record<string, string>)) {
      const varName = radiusMap[key] || `radius-${key}`;
      lightVars[varName] = val;
      darkVars[varName] = val;
    }
  }

  // Primitive shadows
  if (tokens.primitives?.shadows) {
    for (const [key, val] of Object.entries(tokens.primitives.shadows as Record<string, string>)) {
      lightVars[`ds-shadow-${key}`] = val;
      darkVars[`ds-shadow-${key}`] = val;
    }
  }

  // Density variables (from user's selected style preset)
  const presetId = data.style_preset || "vega";
  const preset = STYLE_PRESETS.find((p) => p.id === presetId) || STYLE_PRESETS[0];
  for (const [key, val] of Object.entries(preset.vars)) {
    const varName = key.replace(/^--/, "");
    lightVars[varName] = val;
    darkVars[varName] = val;
  }

  // 2. Resolve semantic tokens — var(--brand-600) → actual oklch value
  if (tokens.semantic?.light) {
    for (const [key, val] of Object.entries(tokens.semantic.light)) {
      lightVars[key] = resolveToken(val as string, flatPrimitives);
    }
  }
  if (tokens.semantic?.dark) {
    for (const [key, val] of Object.entries(tokens.semantic.dark)) {
      darkVars[key] = resolveToken(val as string, flatPrimitives);
    }
  }

  // 3. Chart colors (mapped from color scales)
  lightVars["chart-1"] = flatPrimitives["--brand-500"] || lightVars["chart-1"] || "";
  lightVars["chart-2"] = flatPrimitives["--success-500"] || lightVars["chart-2"] || "";
  lightVars["chart-3"] = flatPrimitives["--warning-500"] || lightVars["chart-3"] || "";
  lightVars["chart-4"] = flatPrimitives["--error-500"] || lightVars["chart-4"] || "";
  lightVars["chart-5"] = flatPrimitives["--neutral-500"] || lightVars["chart-5"] || "";
  darkVars["chart-1"] = flatPrimitives["--brand-500"] || darkVars["chart-1"] || "";
  darkVars["chart-2"] = flatPrimitives["--success-500"] || darkVars["chart-2"] || "";
  darkVars["chart-3"] = flatPrimitives["--warning-500"] || darkVars["chart-3"] || "";
  darkVars["chart-4"] = flatPrimitives["--error-500"] || darkVars["chart-4"] || "";
  darkVars["chart-5"] = flatPrimitives["--neutral-500"] || darkVars["chart-5"] || "";

  // 4. Auto-contrast foreground for primary
  const brand600Hex = oklchToHex(flatPrimitives["--brand-600"] || "#000000");
  const brand400Hex = oklchToHex(flatPrimitives["--brand-400"] || "#000000");
  const lightPrimaryFg = readableColor(brand600Hex);
  const darkPrimaryFg = readableColor(brand400Hex);

  lightVars["primary-foreground"] = lightPrimaryFg === "#ffffff"
    ? flatPrimitives["--neutral-50"] || "oklch(1 0 0)"
    : flatPrimitives["--neutral-900"] || "oklch(0.145 0 0)";
  darkVars["primary-foreground"] = darkPrimaryFg === "#ffffff"
    ? flatPrimitives["--neutral-50"] || "oklch(1 0 0)"
    : flatPrimitives["--neutral-900"] || "oklch(0.145 0 0)";

  // 5. Sidebar tokens (light)
  lightVars["sidebar"] = flatPrimitives["--neutral-100"] || lightVars["sidebar"] || "";
  lightVars["sidebar-foreground"] = flatPrimitives["--neutral-900"] || lightVars["sidebar-foreground"] || "";
  lightVars["sidebar-primary"] = flatPrimitives["--brand-600"] || lightVars["sidebar-primary"] || "";
  lightVars["sidebar-primary-foreground"] = lightPrimaryFg === "#ffffff"
    ? flatPrimitives["--neutral-50"] || "oklch(1 0 0)"
    : flatPrimitives["--neutral-900"] || "oklch(0.145 0 0)";
  lightVars["sidebar-accent"] = flatPrimitives["--brand-100"] || lightVars["sidebar-accent"] || "";
  lightVars["sidebar-accent-foreground"] = flatPrimitives["--brand-900"] || lightVars["sidebar-accent-foreground"] || "";
  lightVars["sidebar-border"] = flatPrimitives["--neutral-200"] || lightVars["sidebar-border"] || "";
  lightVars["sidebar-ring"] = flatPrimitives["--brand-400"] || lightVars["sidebar-ring"] || "";

  // 5b. Sidebar tokens (dark)
  darkVars["sidebar"] = flatPrimitives["--neutral-800"] || darkVars["sidebar"] || "";
  darkVars["sidebar-foreground"] = flatPrimitives["--neutral-50"] || darkVars["sidebar-foreground"] || "";
  darkVars["sidebar-primary"] = flatPrimitives["--brand-400"] || darkVars["sidebar-primary"] || "";
  darkVars["sidebar-primary-foreground"] = darkPrimaryFg === "#ffffff"
    ? flatPrimitives["--neutral-50"] || "oklch(1 0 0)"
    : flatPrimitives["--neutral-900"] || "oklch(0.145 0 0)";
  darkVars["sidebar-accent"] = flatPrimitives["--brand-900"] || darkVars["sidebar-accent"] || "";
  darkVars["sidebar-accent-foreground"] = flatPrimitives["--brand-100"] || darkVars["sidebar-accent-foreground"] || "";
  darkVars["sidebar-border"] = flatPrimitives["--neutral-700"] || darkVars["sidebar-border"] || "";
  darkVars["sidebar-ring"] = flatPrimitives["--brand-500"] || darkVars["sidebar-ring"] || "";

  // 6. Font
  const fontFamily = tokens.primitives?.fontFamily || "Geist";
  const fontFamilyKo = tokens.primitives?.fontFamilyKo || "";

  let fontSansValue = "";
  if (fontFamilyKo && fontFamily !== "Geist") {
    fontSansValue = `'${fontFamily}', '${fontFamilyKo}', sans-serif`;
  } else if (fontFamilyKo) {
    fontSansValue = `'${fontFamilyKo}', sans-serif`;
  } else if (fontFamily !== "Geist") {
    fontSansValue = `'${fontFamily}', sans-serif`;
  }

  if (fontSansValue) {
    lightVars["font-sans"] = fontSansValue;
    darkVars["font-sans"] = fontSansValue;
  }

  // Typography tokens
  if (tokens.primitives?.fontSize) {
    for (const [key, val] of Object.entries(tokens.primitives.fontSize)) {
      lightVars[`font-size-${key}`] = val as string;
      darkVars[`font-size-${key}`] = val as string;
    }
  }
  if (tokens.primitives?.fontWeight) {
    for (const [key, val] of Object.entries(tokens.primitives.fontWeight)) {
      lightVars[`font-weight-${key}`] = val as string;
      darkVars[`font-weight-${key}`] = val as string;
    }
  }
  if (tokens.primitives?.lineHeight) {
    for (const [key, val] of Object.entries(tokens.primitives.lineHeight)) {
      lightVars[`line-height-${key}`] = val as string;
      darkVars[`line-height-${key}`] = val as string;
    }
  }

  // 7. Font registry dependencies
  const registryDependencies: string[] = [];
  const isGoogleFont = fontFamily !== "Geist" && GOOGLE_FONTS.includes(fontFamily);
  if (isGoogleFont) {
    const fontSlug = fontFamily.replace(/ /g, "-").toLowerCase();
    registryDependencies.push(`${CDN_BASE}/r/font-${fontSlug}.json`);
  }
  const koIsGoogleFont = KOREAN_FONTS.includes(fontFamilyKo) && fontFamilyKo !== "Pretendard";
  if (koIsGoogleFont) {
    const koSlug = fontFamilyKo.replace(/ /g, "-").toLowerCase();
    registryDependencies.push(`${CDN_BASE}/r/font-${koSlug}.json`);
  }

  // lang="ko" override for Korean font priority
  let fontSansKoValue = "";
  if (fontFamilyKo && fontFamily !== "Geist") {
    fontSansKoValue = `'${fontFamilyKo}', '${fontFamily}', sans-serif`;
  } else if (fontFamilyKo) {
    fontSansKoValue = `'${fontFamilyKo}', sans-serif`;
  }

  const result: Record<string, unknown> = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "designsync-tokens",
    type: "registry:style",
    cssVars: { light: lightVars, dark: darkVars },
  };

  if (registryDependencies.length > 0) {
    result.registryDependencies = registryDependencies;
  }

  // lang="ko" CSS override
  if (fontSansKoValue && fontSansKoValue !== fontSansValue) {
    result.css = {
      ":root:lang(ko)": {
        "--font-sans": fontSansKoValue,
      },
    };
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
