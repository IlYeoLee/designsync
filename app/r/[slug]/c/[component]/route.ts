import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rewriteIconImports, rewriteIconDependency } from "@/lib/icon-map";
import { readFile } from "fs/promises";
import { join } from "path";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; component: string }> }
) {
  const { slug, component } = await params;

  // Validate component name (prevent path traversal)
  if (!/^[a-z0-9-]+\.json$/.test(component)) {
    return NextResponse.json({ error: "Invalid component name" }, { status: 400 });
  }

  try {
    // 1. Read static JSON from public/r/
    const filePath = join(process.cwd(), "public", "r", component);
    let raw: string;
    try {
      raw = await readFile(filePath, "utf-8");
    } catch {
      return NextResponse.json({ error: "Component not found" }, { status: 404 });
    }

    const json = JSON.parse(raw);

    // 2. Look up user's icon library preference
    const supabase = getSupabase();
    const { data } = await supabase
      .from("design_systems")
      .select("icon_library")
      .eq("slug", slug)
      .single();

    const iconLib = data?.icon_library || "lucide";

    // 3. If not lucide, rewrite icon imports in all file contents
    if (iconLib !== "lucide" && json.files) {
      for (const file of json.files) {
        if (file.content && file.content.includes("lucide-react")) {
          file.content = rewriteIconImports(file.content, iconLib);
        }
      }
      // Rewrite dependencies
      if (json.dependencies) {
        json.dependencies = rewriteIconDependency(json.dependencies, iconLib);
      }
    }

    return NextResponse.json(json, {
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
