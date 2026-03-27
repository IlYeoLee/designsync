import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateRules } from "@/lib/rules";

const CDN = "https://designsync-omega.vercel.app";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// All component names
const ALL_COMPONENTS = [
  "button", "card", "input", "label", "textarea",
  "accordion", "alert", "alert-dialog", "aspect-ratio", "avatar",
  "badge", "breadcrumb", "checkbox", "collapsible", "dialog",
  "dropdown-menu", "form", "hover-card", "pagination", "popover",
  "progress", "radio-group", "scroll-area", "select", "separator",
  "sheet", "skeleton", "slider", "switch", "table", "tabs",
  "toggle", "toggle-group", "tooltip", "calendar", "carousel",
  "chart", "command", "context-menu", "drawer", "input-otp",
  "menubar", "navigation-menu", "resizable", "sidebar", "sonner",
  "typography", "header", "combobox", "button-group", "field",
  "input-group", "spinner", "empty", "item", "native-select",
  "kbd", "direction", "date-picker", "data-table",
];

// Components that contain lucide-react imports and need icon rewriting
const ICON_COMPONENTS = new Set([
  "accordion", "breadcrumb", "calendar", "checkbox", "collapsible",
  "combobox", "command", "data-table", "date-picker", "dialog",
  "dropdown-menu", "header", "navigation-menu", "radio-group",
  "resizable", "scroll-area", "select", "sheet", "sidebar",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("design_systems")
    .select("tokens, icon_library, style_preset")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Design system not found" },
      { status: 404 }
    );
  }

  const tokens = data.tokens;
  const fontFamily = tokens.primitives?.fontFamily || "";
  const fontFamilyKo = tokens.primitives?.fontFamilyKo || "";

  let fontSansValue = "";
  if (fontFamilyKo && fontFamily && fontFamily !== "Geist") {
    fontSansValue = `'${fontFamily}', '${fontFamilyKo}', sans-serif`;
  } else if (fontFamilyKo) {
    fontSansValue = `'${fontFamilyKo}', sans-serif`;
  } else if (fontFamily && fontFamily !== "Geist") {
    fontSansValue = `'${fontFamily}', sans-serif`;
  }

  const readme = generateRules({
    fontFamily: fontFamily !== "Geist" ? fontFamily : undefined,
    fontFamilyKo: fontFamilyKo || undefined,
    fontSansValue: fontSansValue || undefined,
    iconLibrary: data.icon_library || "lucide",
    includeInstall: false,
  });

  // When icon library is not lucide, route icon-containing components
  // through the dynamic proxy that rewrites imports
  const iconLib = data.icon_library || "lucide";
  const componentUrls = ALL_COMPONENTS.map((name) => {
    if (iconLib !== "lucide" && ICON_COMPONENTS.has(name)) {
      return `${CDN}/r/${slug}/c/${name}.json`;
    }
    return `${CDN}/r/${name}.json`;
  });

  const result = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "designsync-all",
    type: "registry:ui",
    title: "DesignSync All Components",
    description: "Install all DesignSync components and design tokens in one command.",
    registryDependencies: [
      `${CDN}/r/${slug}/designsync-tokens.json`,
      ...componentUrls,
    ],
    files: [],
    readme,
  };

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
