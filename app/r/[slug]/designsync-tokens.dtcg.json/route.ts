import { NextResponse } from "next/server";
import { fetchAndResolveTokens } from "@/lib/resolve-tokens";

/**
 * W3C Design Token Community Group (DTCG) format output.
 * Spec: https://tr.designtokens.org/format/
 */

function inferType(name: string, value: string): string {
  if (name.includes("radius") || name.includes("spacing")) return "dimension";
  if (name.includes("font-size")) return "dimension";
  if (name.includes("font-weight")) return "number";
  if (name.includes("line-height")) return "number";
  if (name.includes("font-sans") || name.includes("font-mono")) return "fontFamily";
  if (name.includes("shadow")) return "shadow";
  if (value.startsWith("oklch(") || value.startsWith("#") || value.startsWith("rgb")) return "color";
  if (value.endsWith("rem") || value.endsWith("px")) return "dimension";
  return "color";
}

type DTCGToken = {
  $type: string;
  $value: string;
};

type DTCGGroup = {
  [key: string]: DTCGToken | DTCGGroup | string;
};

function buildGroup(
  vars: Record<string, string>,
  filter?: (key: string) => boolean
): DTCGGroup {
  const group: DTCGGroup = {};
  for (const [key, value] of Object.entries(vars)) {
    if (!value) continue;
    if (filter && !filter(key)) continue;
    group[key] = {
      $type: inferType(key, value),
      $value: value,
    };
  }
  return group;
}

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
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const { lightVars, darkVars } = resolved;

    // Color scales
    const colorScales = ["brand", "neutral", "error", "success", "warning"];
    const isColorScale = (k: string) => colorScales.some((s) => k.startsWith(`${s}-`));

    // Semantic tokens
    const semanticKeys = [
      "background", "foreground", "card", "card-foreground",
      "popover", "popover-foreground", "primary", "primary-foreground",
      "secondary", "secondary-foreground", "muted", "muted-foreground",
      "accent", "accent-foreground", "destructive", "border", "input", "ring",
      "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
      "sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground",
      "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring",
    ];
    const isSemantic = (k: string) => semanticKeys.includes(k);

    // Build structured DTCG output
    const primitives: DTCGGroup = {};
    for (const scale of colorScales) {
      primitives[scale] = buildGroup(lightVars, (k) => k.startsWith(`${scale}-`));
    }

    const dtcg: DTCGGroup = {
      $name: `designsync/${slug}`,
      $description: `Design tokens for "${slug}" in W3C DTCG format`,
      primitives: {
        ...primitives,
        spacing: buildGroup(lightVars, (k) => k.startsWith("spacing-")),
        radius: buildGroup(lightVars, (k) => k.startsWith("radius-")),
        shadows: buildGroup(lightVars, (k) => k.startsWith("ds-shadow-")),
        typography: buildGroup(lightVars, (k) =>
          k.startsWith("font-size-") || k.startsWith("font-weight-") || k.startsWith("line-height-")
        ),
      },
      semantic: {
        light: buildGroup(lightVars, isSemantic),
        dark: buildGroup(darkVars, isSemantic),
      },
      density: buildGroup(lightVars, (k) => k.startsWith("ds-")),
    };

    // Font
    if (lightVars["font-sans"]) {
      (dtcg as DTCGGroup)["font"] = {
        "font-sans": { $type: "fontFamily", $value: lightVars["font-sans"] },
      };
    }

    return NextResponse.json(dtcg, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
