import { NextResponse } from "next/server";
import { fetchAndResolveTokens } from "@/lib/resolve-tokens";
import { GOOGLE_FONTS, KOREAN_FONTS } from "@/lib/fonts";

const CDN_BASE = "https://designsync-omega.vercel.app";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const resolved = await fetchAndResolveTokens(slug);
    if (!resolved) {
      return NextResponse.json(
        { error: "Design system not found" },
        { status: 404 }
      );
    }

    const { lightVars, darkVars, fontFamily, fontFamilyKo, fontSansValue, fontSansKoValue } = resolved;

    // Font registry dependencies
    const registryDependencies: string[] = [];
    const isGoogleFont = fontFamily !== "Geist" && GOOGLE_FONTS.includes(fontFamily);
    if (isGoogleFont) {
      const fontSlug = fontFamily.replace(/ /g, "-").toLowerCase();
      registryDependencies.push(`${CDN_BASE}/r/font-${fontSlug}.json`);
    }
    if (fontFamilyKo && KOREAN_FONTS.includes(fontFamilyKo)) {
      const koSlug = fontFamilyKo.replace(/ /g, "-").toLowerCase();
      registryDependencies.push(`${CDN_BASE}/r/font-${koSlug}.json`);
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

    // Tailwind v4 border reset + lang="ko" font override
    const css: Record<string, Record<string, string>> = {
      "*, ::after, ::before": {
        "border-color": "var(--color-border, currentColor)",
      },
    };
    if (fontSansKoValue && fontSansKoValue !== fontSansValue) {
      css[":root:lang(ko)"] = { "--font-sans": fontSansKoValue };
    }
    result.css = css;

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error", stack: err instanceof Error ? err.stack : undefined },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
