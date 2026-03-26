import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("design_systems")
    .select("tokens")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Design system not found" },
      { status: 404 }
    );
  }

  const tokens = data.tokens;

  // Build cssVars from tokens (light + dark)
  const lightVars: Record<string, string> = {};
  const darkVars: Record<string, string> = {};

  // Resolve semantic tokens
  if (tokens.semantic?.light) {
    for (const [key, val] of Object.entries(tokens.semantic.light)) {
      lightVars[key] = val as string;
    }
  }
  if (tokens.semantic?.dark) {
    for (const [key, val] of Object.entries(tokens.semantic.dark)) {
      darkVars[key] = val as string;
    }
  }

  // Font
  const fontFamily = tokens.primitives?.fontFamily || "Geist";
  const fontFamilyKo = tokens.primitives?.fontFamilyKo || "";
  if (fontFamily !== "Geist") {
    const parts = [fontFamily, fontFamilyKo].filter(Boolean);
    const stack = parts.map((f: string) => `'${f}'`).join(", ") + ", sans-serif";
    lightVars["font-sans"] = stack;
    darkVars["font-sans"] = stack;
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

  const result = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "designsync-tokens",
    type: "registry:style",
    cssVars: { light: lightVars, dark: darkVars },
  };

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
