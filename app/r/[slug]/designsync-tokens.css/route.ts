import { fetchAndResolveTokens } from "@/lib/resolve-tokens";

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

    const { lightVars, darkVars, fontSansKoValue, fontSansValue } = resolved;

    const indent = "  ";
    function varsBlock(vars: Record<string, string>): string {
      return Object.entries(vars)
        .filter(([, v]) => v)
        .map(([k, v]) => `${indent}--${k}: ${v};`)
        .join("\n");
    }

    let css = `/* DesignSync — Live design tokens for "${slug}" */\n`;
    css += `/* This file is auto-generated. Edit at https://designsync-omega.vercel.app */\n\n`;

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
