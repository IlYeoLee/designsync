import { fetchAndResolveTokens } from "@/lib/resolve-tokens";
import { generateFontFaceCSS } from "@/lib/tokens";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const STORAGE_BUCKET = "fonts";

const FONT_CDN: Record<string, string> = {
  pretendard: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css",
  geist: "",
};

// Shadcn semantic tokens that conflict — prefix with --ds-
const SHADCN_TOKENS = new Set([
  "primary", "primary-foreground",
  "secondary", "secondary-foreground",
  "background", "foreground",
  "card", "card-foreground",
  "muted", "muted-foreground",
  "accent", "accent-foreground",
  "destructive", "destructive-foreground",
  "border", "card-border", "input", "ring",
  "popover", "popover-foreground",
  "radius", "font-sans", "font-mono",
  "sidebar", "sidebar-foreground",
  "sidebar-primary", "sidebar-primary-foreground",
  "sidebar-accent", "sidebar-accent-foreground",
  "sidebar-border", "sidebar-ring",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
]);

function toVarName(key: string): string {
  return SHADCN_TOKENS.has(key) ? `ds-${key}` : key;
}

async function buildFontFaceCSS(fontNames: string[]): Promise<{ imports: string; fontFaces: string }> {
  const supabase = getSupabase();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  let imports = "";
  let fontFaces = "";

  for (const fontName of fontNames) {
    if (!fontName || fontName === "Geist") continue;
    const fontSlug = fontName.replace(/ /g, "-").toLowerCase();

    const cdnUrl = FONT_CDN[fontSlug];
    if (cdnUrl) {
      imports += `@import url("${cdnUrl}");\n`;
      continue;
    }

    // List all files matching this font slug
    const { data: allFiles } = await supabase.storage.from(STORAGE_BUCKET).list("", { search: fontSlug });
    if (allFiles && allFiles.length > 0) {
      const weightFileRe = new RegExp(`^${fontSlug}-(\\d+)\\.(woff2|woff|ttf|otf)$`);
      const matched = allFiles
        .map((f) => { const m = f.name.match(weightFileRe); return m ? { name: f.name, weight: parseInt(m[1], 10), ext: m[2] } : null; })
        .filter((x): x is { name: string; weight: number; ext: string } => x !== null)
        .sort((a, b) => a.weight - b.weight);
      for (let i = 0; i < matched.length; i++) {
        const { name, weight, ext } = matched[i];
        const format = ext === "ttf" ? "truetype" : ext === "otf" ? "opentype" : ext;
        const url = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${name}`;
        const lower = i === 0 ? 1 : matched[i - 1].weight + 1;
        const upper = i === matched.length - 1 ? 1000 : weight;
        const weightDescriptor = lower === upper ? `${weight}` : `${lower} ${upper}`;
        fontFaces += `@font-face {\n  font-family: '${fontName}';\n  src: url('${url}') format('${format}');\n  font-weight: ${weightDescriptor};\n  font-display: swap;\n}\n`;
      }
    }
  }

  return { imports, fontFaces };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const resolved = await fetchAndResolveTokens(slug);
    if (!resolved) {
      return new Response("/* Design system not found */", {
        status: 404,
        headers: { "Content-Type": "text/css", "Access-Control-Allow-Origin": "*" },
      });
    }

    const { lightVars, darkVars, fontSansKoValue, fontFamily, fontFamilyKo, fontFaceUrls, fontFaceUrlsKo } = resolved;

    const indent = "  ";

    // Output vars with --ds- prefix for shadcn-conflicting tokens
    function varsBlock(vars: Record<string, string>): string {
      return Object.entries(vars)
        .filter(([, v]) => v)
        .map(([k, v]) => `${indent}--${toVarName(k)}: ${v};`)
        .join("\n");
    }

    const fontNames = [fontFamily, fontFamilyKo].filter(Boolean);
    const { imports, fontFaces } = await buildFontFaceCSS(fontNames);

    // @import must come first per CSS spec
    let css = "";
    if (imports) css += imports + "\n";

    css += `/* DesignSync — Live design tokens for "${slug}" */\n`;
    css += `/* Edit at https://designsync-omega.vercel.app */\n\n`;

    if (fontFaces) css += fontFaces + "\n";

    // Custom uploaded font @font-face with step-down bridge rules
    if (fontFamily && Object.keys(fontFaceUrls).length > 0) {
      css += generateFontFaceCSS(fontFamily, fontFaceUrls) + "\n";
    }
    if (fontFamilyKo && Object.keys(fontFaceUrlsKo).length > 0) {
      css += generateFontFaceCSS(fontFamilyKo, fontFaceUrlsKo) + "\n";
    }

    // :root — DS-prefixed semantic tokens + primitive tokens
    css += `:root {\n${varsBlock(lightVars)}\n}\n\n`;

    // .dark
    css += `.dark {\n${varsBlock(darkVars)}\n}\n\n`;

    // Shadcn variable mapping — maps --ds-* back to shadcn names
    // This is injected here for live sync; postinstall also injects at bottom of globals.css
    css += `/* shadcn variable mapping */\n`;
    const shadcnKeys = Object.keys(lightVars).filter(k => SHADCN_TOKENS.has(k));
    css += `:root {\n`;
    for (const k of shadcnKeys) {
      css += `${indent}--${k}: var(--ds-${k});\n`;
    }
    css += `}\n`;
    css += `.dark {\n`;
    for (const k of shadcnKeys) {
      if (darkVars[k]) css += `${indent}--${k}: var(--ds-${k});\n`;
    }
    css += `}\n\n`;

    // Shadcn radius calc() override — neutralizes +4px/+8px offset formulas
    // shadcn globals.css uses calc(var(--radius) + 4px) which breaks DS "square" presets.
    // These unlayered :root vars beat @layer base shadcn definitions.
    css += `/* Shadcn radius tier override */\n`;
    css += `:root {\n`;
    css += `${indent}--radius-sm: var(--radius-sm-prim);\n`;
    css += `${indent}--radius-md: var(--radius-md-prim);\n`;
    css += `${indent}--radius-lg: var(--radius-lg-prim);\n`;
    css += `${indent}--radius-xl: var(--radius-xl-prim);\n`;
    css += `${indent}--radius-2xl: var(--radius-xl-prim);\n`;
    css += `}\n\n`;

    // Typography override — higher specificity to beat Tailwind default @theme :root
    css += `/* Typography override */\n`;
    css += `:root:root {\n`;
    for (const k of ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]) {
      if (lightVars[`font-size-${k}`]) {
        css += `${indent}--text-${k}: ${lightVars[`font-size-${k}`]};\n`;
      }
    }
    for (const k of ["normal", "medium", "semibold", "bold", "extrabold"]) {
      if (lightVars[`font-weight-${k}`]) {
        css += `${indent}--font-weight-${k}: ${lightVars[`font-weight-${k}`]};\n`;
      }
    }
    for (const k of ["tight", "snug", "normal", "relaxed", "loose"]) {
      if (lightVars[`line-height-${k}`]) {
        css += `${indent}--leading-${k}: ${lightVars[`line-height-${k}`]};\n`;
      }
    }
    for (const level of ["sm", "md", "lg"]) {
      if (lightVars[`ds-shadow-${level}`]) {
        css += `${indent}--shadow-${level}: ${lightVars[`ds-shadow-${level}`]};\n`;
      }
    }
    // When sm is "none", also zero out xs/2xs so Tailwind shadow-xs on inputs/buttons is killed
    if (lightVars["ds-shadow-sm"] === "none") {
      css += `${indent}--shadow-xs: none;\n`;
      css += `${indent}--shadow-2xs: none;\n`;
    }
    // When lg is "none", also zero out xl/2xl
    if (lightVars["ds-shadow-lg"] === "none") {
      css += `${indent}--shadow-xl: none;\n`;
      css += `${indent}--shadow-2xl: none;\n`;
    }
    css += `}\n\n`;

    // Korean font unicode-range
    if (fontFamilyKo && fontSansKoValue && fontFamilyKo !== fontFamily) {
      css += `@font-face {\n`;
      css += `${indent}font-family: '${fontFamily}';\n`;
      css += `${indent}src: local('${fontFamilyKo}');\n`;
      css += `${indent}unicode-range: U+AC00-D7A3, U+1100-11FF, U+3130-318F, U+A960-A97F, U+D7B0-D7FF;\n`;
      css += `}\n`;
    }

    return new Response(css, {
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      `/* Error: ${err instanceof Error ? err.message : "Unknown"} */`,
      { status: 500, headers: { "Content-Type": "text/css", "Access-Control-Allow-Origin": "*" } }
    );
  }
}
