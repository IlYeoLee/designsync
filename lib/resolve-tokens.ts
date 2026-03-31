/**
 * Shared token resolution logic.
 * Fetches a design system from Supabase and builds resolved light/dark CSS variable maps.
 */
import { createClient } from "@supabase/supabase-js";
import { STYLE_PRESETS } from "@/lib/style-presets";
import { oklchToHex } from "@/lib/color";
import { readableColor } from "colorizr";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function resolveToken(
  value: string,
  primitives: Record<string, string>
): string {
  if (!value.startsWith("var(")) return value;
  const varName = value.match(/var\(([^)]+)\)/)?.[1];
  if (!varName) return value;
  return primitives[varName] ?? value;
}

export type ResolvedTokens = {
  lightVars: Record<string, string>;
  darkVars: Record<string, string>;
  fontFamily: string;
  fontFamilyKo: string;
  fontSansValue: string;
  fontSansKoValue: string;
  iconLibrary: string;
  stylePreset: string;
  /** Uploaded custom font face URLs: weight → CDN URL */
  fontFaceUrls: Record<string, string>;
  fontFaceUrlsKo: Record<string, string>;
};

export async function fetchAndResolveTokens(
  slug: string
): Promise<ResolvedTokens | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("design_systems")
    .select("tokens, style_preset, icon_library")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  const tokens = data.tokens;

  // Flatten primitives
  const flatPrimitives: Record<string, string> = {};
  const { brand, neutral, error: errorScale, success, info: infoScale, radius } =
    tokens.primitives || {};

  for (const [step, val] of Object.entries((brand || {}) as Record<string, string>)) {
    flatPrimitives[`--brand-${step}`] = val;
  }
  for (const [step, val] of Object.entries((neutral || {}) as Record<string, string>)) {
    flatPrimitives[`--neutral-${step}`] = val;
  }
  for (const [step, val] of Object.entries((errorScale || {}) as Record<string, string>)) {
    flatPrimitives[`--error-${step}`] = val;
    // Backward compat: --warning-* aliases error (warning palette merged into error)
    flatPrimitives[`--warning-${step}`] = val;
  }
  for (const [step, val] of Object.entries((success || {}) as Record<string, string>)) {
    flatPrimitives[`--success-${step}`] = val;
  }
  for (const [step, val] of Object.entries((infoScale || {}) as Record<string, string>)) {
    flatPrimitives[`--info-${step}`] = val;
  }
  if (radius) {
    flatPrimitives["--radius-none"] = radius.none;
    flatPrimitives["--radius-sm-prim"] = radius.sm;
    flatPrimitives["--radius-md-prim"] = radius.md;
    flatPrimitives["--radius-lg-prim"] = radius.lg;
    flatPrimitives["--radius-xl-prim"] = radius.xl;
    flatPrimitives["--radius-full"] = radius.full;
  }

  const lightVars: Record<string, string> = {};
  const darkVars: Record<string, string> = {};

  // Primitive color scales
  const colorScales = ["brand", "neutral", "error", "success", "info"] as const;
  for (const scale of colorScales) {
    if (tokens.primitives?.[scale]) {
      for (const [step, val] of Object.entries(tokens.primitives[scale] as Record<string, string>)) {
        lightVars[`${scale}-${step}`] = val;
        darkVars[`${scale}-${step}`] = val;
      }
    }
  }
  // Backward compat: emit warning-* as aliases of error (merged palette)
  if (tokens.primitives?.error) {
    for (const [step, val] of Object.entries(tokens.primitives.error as Record<string, string>)) {
      lightVars[`warning-${step}`] = val;
      darkVars[`warning-${step}`] = val;
    }
  }

  // Spacing
  if (tokens.primitives?.spacing) {
    for (const [key, val] of Object.entries(tokens.primitives.spacing as Record<string, string>)) {
      lightVars[`spacing-${key}`] = val;
      darkVars[`spacing-${key}`] = val;
    }
  }

  // Radius
  if (tokens.primitives?.radius) {
    const radiusMap: Record<string, string> = {
      none: "radius-none", sm: "radius-sm-prim", md: "radius-md-prim",
      lg: "radius-lg-prim", xl: "radius-xl-prim", full: "radius-full",
    };
    for (const [key, val] of Object.entries(tokens.primitives.radius as Record<string, string>)) {
      const varName = radiusMap[key] || `radius-${key}`;
      lightVars[varName] = val;
      darkVars[varName] = val;
    }
  }

  // Shadows
  if (tokens.primitives?.shadows) {
    for (const [key, val] of Object.entries(tokens.primitives.shadows as Record<string, string>)) {
      lightVars[`ds-shadow-${key}`] = val;
      darkVars[`ds-shadow-${key}`] = val;
    }
  }

  // Density (style preset)
  const presetId = data.style_preset || "vega";
  const preset = STYLE_PRESETS.find((p) => p.id === presetId) || STYLE_PRESETS[0];
  for (const [key, val] of Object.entries(preset.vars)) {
    const varName = key.replace(/^--/, "");
    lightVars[varName] = val;
    darkVars[varName] = val;
  }

  // Semantic tokens
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

  // Chart colors
  lightVars["chart-1"] = flatPrimitives["--brand-500"] || lightVars["chart-1"] || "";
  lightVars["chart-2"] = flatPrimitives["--success-500"] || lightVars["chart-2"] || "";
  lightVars["chart-3"] = flatPrimitives["--info-500"] || lightVars["chart-3"] || "";
  lightVars["chart-4"] = flatPrimitives["--error-500"] || lightVars["chart-4"] || "";
  lightVars["chart-5"] = flatPrimitives["--neutral-500"] || lightVars["chart-5"] || "";
  darkVars["chart-1"] = flatPrimitives["--brand-500"] || darkVars["chart-1"] || "";
  darkVars["chart-2"] = flatPrimitives["--success-500"] || darkVars["chart-2"] || "";
  darkVars["chart-3"] = flatPrimitives["--warning-500"] || darkVars["chart-3"] || "";
  darkVars["chart-4"] = flatPrimitives["--error-500"] || darkVars["chart-4"] || "";
  darkVars["chart-5"] = flatPrimitives["--neutral-500"] || darkVars["chart-5"] || "";

  // Auto-contrast foreground
  const brand600Hex = oklchToHex(flatPrimitives["--brand-600"] || "#000000");
  const brand400Hex = oklchToHex(flatPrimitives["--brand-400"] || "#000000");
  const lightPrimaryFg = readableColor(brand600Hex);
  const darkPrimaryFg = readableColor(brand400Hex);

  // Only auto-compute if user hasn't explicitly set it in semantic tokens
  if (!tokens.semantic?.light?.["primary-foreground"]) {
    lightVars["primary-foreground"] = lightPrimaryFg === "#ffffff"
      ? flatPrimitives["--neutral-50"] || "oklch(1 0 0)"
      : flatPrimitives["--neutral-900"] || "oklch(0.145 0 0)";
  }
  if (!tokens.semantic?.dark?.["primary-foreground"]) {
    darkVars["primary-foreground"] = darkPrimaryFg === "#ffffff"
      ? flatPrimitives["--neutral-50"] || "oklch(1 0 0)"
      : flatPrimitives["--neutral-900"] || "oklch(0.145 0 0)";
  }

  // Sidebar tokens
  lightVars["sidebar"] = flatPrimitives["--neutral-100"] || lightVars["sidebar"] || "";
  lightVars["sidebar-foreground"] = flatPrimitives["--neutral-900"] || lightVars["sidebar-foreground"] || "";
  lightVars["sidebar-primary"] = flatPrimitives["--brand-600"] || lightVars["sidebar-primary"] || "";
  lightVars["sidebar-primary-foreground"] = lightVars["primary-foreground"];
  lightVars["sidebar-accent"] = flatPrimitives["--brand-100"] || lightVars["sidebar-accent"] || "";
  lightVars["sidebar-accent-foreground"] = flatPrimitives["--brand-900"] || lightVars["sidebar-accent-foreground"] || "";
  lightVars["sidebar-border"] = flatPrimitives["--neutral-200"] || lightVars["sidebar-border"] || "";
  lightVars["sidebar-ring"] = flatPrimitives["--brand-400"] || lightVars["sidebar-ring"] || "";

  darkVars["sidebar"] = flatPrimitives["--neutral-800"] || darkVars["sidebar"] || "";
  darkVars["sidebar-foreground"] = flatPrimitives["--neutral-50"] || darkVars["sidebar-foreground"] || "";
  darkVars["sidebar-primary"] = flatPrimitives["--brand-400"] || darkVars["sidebar-primary"] || "";
  darkVars["sidebar-primary-foreground"] = darkVars["primary-foreground"];
  darkVars["sidebar-accent"] = flatPrimitives["--brand-900"] || darkVars["sidebar-accent"] || "";
  darkVars["sidebar-accent-foreground"] = flatPrimitives["--brand-100"] || darkVars["sidebar-accent-foreground"] || "";
  darkVars["sidebar-border"] = flatPrimitives["--neutral-700"] || darkVars["sidebar-border"] || "";
  darkVars["sidebar-ring"] = flatPrimitives["--brand-500"] || darkVars["sidebar-ring"] || "";

  // Font
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

  lightVars["spacing"] = "0.25rem";
  darkVars["spacing"] = "0.25rem";

  // Typography
  if (tokens.primitives?.fontSize) {
    for (const [key, val] of Object.entries(tokens.primitives.fontSize)) {
      lightVars[`font-size-${key}`] = val as string;
      darkVars[`font-size-${key}`] = val as string;
    }
  }
  const defaultWeights: Record<string, string> = {
    normal: "400", medium: "500", semibold: "600", bold: "700", extrabold: "800",
  };
  for (const [key, val] of Object.entries(defaultWeights)) {
    lightVars[`font-weight-${key}`] = val;
    darkVars[`font-weight-${key}`] = val;
  }
  if (tokens.primitives?.fontWeight) {
    for (const [key, val] of Object.entries(tokens.primitives.fontWeight)) {
      lightVars[`font-weight-${key}`] = val as string;
      darkVars[`font-weight-${key}`] = val as string;
    }
  }
  const defaultLineHeights: Record<string, string> = {
    tight: "1.25", snug: "1.375", normal: "1.5", relaxed: "1.625", loose: "1.75",
  };
  for (const [key, val] of Object.entries(defaultLineHeights)) {
    lightVars[`line-height-${key}`] = val;
    darkVars[`line-height-${key}`] = val;
  }
  if (tokens.primitives?.lineHeight) {
    for (const [key, val] of Object.entries(tokens.primitives.lineHeight)) {
      lightVars[`line-height-${key}`] = val as string;
      darkVars[`line-height-${key}`] = val as string;
    }
  }

  // lang="ko" override
  let fontSansKoValue = "";
  if (fontFamilyKo && fontFamily !== "Geist") {
    fontSansKoValue = `'${fontFamilyKo}', '${fontFamily}', sans-serif`;
  } else if (fontFamilyKo) {
    fontSansKoValue = `'${fontFamilyKo}', sans-serif`;
  }

  return {
    lightVars,
    darkVars,
    fontFamily,
    fontFamilyKo,
    fontSansValue,
    fontSansKoValue,
    iconLibrary: data.icon_library || "lucide",
    stylePreset: presetId,
    fontFaceUrls: (tokens.primitives?.fontFaceUrls ?? {}) as Record<string, string>,
    fontFaceUrlsKo: (tokens.primitives?.fontFaceUrlsKo ?? {}) as Record<string, string>,
  };
}
