import { fetchAndResolveTokens } from "@/lib/resolve-tokens";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const STORAGE_BUCKET = "fonts";

// CDN fallback for well-known fonts (no file upload needed)
const FONT_CDN: Record<string, string> = {
  pretendard: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css",
  geist: "",
};

async function buildFontFaceCSS(fontNames: string[]): Promise<string> {
  const supabase = getSupabase();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  let css = "";

  for (const fontName of fontNames) {
    if (!fontName || fontName === "Geist") continue;
    const fontSlug = fontName.replace(/ /g, "-").toLowerCase();

    // 1. Check CDN fallback first
    const cdnUrl = FONT_CDN[fontSlug];
    if (cdnUrl) {
      css += `@import url("${cdnUrl}");\n`;
      continue;
    }

    // 2. Try Supabase Storage for uploaded fonts
    const exts = ["woff2", "woff", "ttf", "otf"];
    for (const ext of exts) {
      const filename = `${fontSlug}-400.${ext}`;
      const { data } = await supabase.storage.from(STORAGE_BUCKET).list("", { search: filename });
      if (data && data.some((f) => f.name === filename)) {
        const url = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${filename}`;
        const format = ext === "ttf" ? "truetype" : ext === "otf" ? "opentype" : ext;
        css += `@font-face {\n  font-family: '${fontName}';\n  src: url('${url}') format('${format}');\n  font-weight: 100 900;\n  font-display: swap;\n}\n`;
        break;
      }
    }
  }

  return css;
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

    const { lightVars, darkVars, fontSansKoValue, fontSansValue, fontFamily, fontFamilyKo } = resolved;

    const indent = "  ";
    function varsBlock(vars: Record<string, string>): string {
      return Object.entries(vars)
        .filter(([, v]) => v)
        .map(([k, v]) => `${indent}--${k}: ${v};`)
        .join("\n");
    }

    // Build @font-face / @import for custom fonts
    const fontNames = [fontFamily, fontFamilyKo].filter(Boolean);
    const fontFaceCSS = await buildFontFaceCSS(fontNames);

    let css = `/* DesignSync — Live design tokens for "${slug}" */\n`;
    css += `/* This file is auto-generated. Edit at https://designsync-omega.vercel.app */\n\n`;

    if (fontFaceCSS) {
      css += fontFaceCSS + "\n";
    }

    // @theme inline for Tailwind v4
    css += `@theme inline {\n`;
    const fontSizeKeys = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
    for (const k of fontSizeKeys) {
      if (lightVars[`font-size-${k}`]) {
        css += `${indent}--text-${k}: var(--font-size-${k}, ${lightVars[`font-size-${k}`]});\n`;
      }
    }
    const fwKeys = ["normal", "medium", "semibold", "bold", "extrabold"];
    for (const k of fwKeys) {
      if (lightVars[`font-weight-${k}`]) {
        css += `${indent}--font-weight-${k}: var(--font-weight-${k});\n`;
      }
    }
    const lhKeys = ["tight", "normal", "relaxed", "loose"];
    for (const k of lhKeys) {
      if (lightVars[`line-height-${k}`]) {
        css += `${indent}--leading-${k}: var(--line-height-${k}, ${lightVars[`line-height-${k}`]});\n`;
      }
    }
    for (const level of ["sm", "md", "lg"]) {
      const key = `ds-shadow-${level}`;
      if (lightVars[key]) {
        css += `${indent}--shadow-${level}: var(--${key});\n`;
      }
    }
    css += `}\n\n`;

    // :root (light)
    css += `:root {\n${varsBlock(lightVars)}\n}\n\n`;

    // .dark
    css += `.dark {\n${varsBlock(darkVars)}\n}\n\n`;

    // Border reset
    css += `*, ::after, ::before {\n${indent}border-color: var(--color-border, currentColor);\n}\n`;

    // lang="ko" override
    if (fontSansKoValue && fontSansKoValue !== fontSansValue) {
      css += `\n:root:lang(ko) {\n${indent}--font-sans: ${fontSansKoValue};\n}\n`;
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
