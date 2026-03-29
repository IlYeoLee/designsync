import { fetchAndResolveTokens } from "@/lib/resolve-tokens";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const resolved = await fetchAndResolveTokens(slug);
    if (!resolved) {
      return new Response("// Design system not found", {
        status: 404,
        headers: { "Content-Type": "text/x-scss", "Access-Control-Allow-Origin": "*" },
      });
    }

    const { lightVars, darkVars, fontSansKoValue, fontSansValue } = resolved;

    const indent = "  ";

    function scssVarsBlock(vars: Record<string, string>, prefix: string): string {
      return Object.entries(vars)
        .filter(([, v]) => v)
        .map(([k, v]) => `$${prefix}${k}: ${v};`)
        .join("\n");
    }

    function cssVarsBlock(vars: Record<string, string>): string {
      return Object.entries(vars)
        .filter(([, v]) => v)
        .map(([k, v]) => `${indent}--${k}: ${v};`)
        .join("\n");
    }

    let scss = `// DesignSync — SCSS tokens for "${slug}"\n`;
    scss += `// Auto-generated. Edit at https://designsync-omega.vercel.app\n\n`;

    // SCSS variables (light as default)
    scss += `// ── Light theme variables ──\n`;
    scss += scssVarsBlock(lightVars, "ds-");
    scss += `\n\n`;

    // Dark theme SCSS variables
    scss += `// ── Dark theme variables ──\n`;
    scss += scssVarsBlock(darkVars, "ds-dark-");
    scss += `\n\n`;

    // Also output as CSS custom properties for direct @import use
    scss += `// ── CSS custom properties (for direct use) ──\n`;
    scss += `:root {\n${cssVarsBlock(lightVars)}\n}\n\n`;
    scss += `.dark {\n${cssVarsBlock(darkVars)}\n}\n\n`;

    // Utility mixin
    scss += `// ── Mixins ──\n`;
    scss += `@mixin ds-dark {\n`;
    scss += Object.entries(darkVars)
      .filter(([, v]) => v)
      .map(([k, v]) => `${indent}--${k}: ${v};`)
      .join("\n");
    scss += `\n}\n`;

    // Border reset
    scss += `\n*, ::after, ::before {\n${indent}border-color: var(--color-border, currentColor);\n}\n`;

    // lang="ko" override
    if (fontSansKoValue && fontSansKoValue !== fontSansValue) {
      scss += `\n:root:lang(ko) {\n${indent}--font-sans: ${fontSansKoValue};\n}\n`;
    }

    return new Response(scss, {
      headers: {
        "Content-Type": "text/x-scss; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      `// Error: ${err instanceof Error ? err.message : "Unknown"}`,
      { status: 500, headers: { "Content-Type": "text/x-scss", "Access-Control-Allow-Origin": "*" } }
    );
  }
}
