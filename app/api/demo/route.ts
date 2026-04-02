import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DEMO_DS_ID } from "@/lib/demo-tokens";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("design_systems")
    .select("tokens, style_preset, icon_library")
    .eq("id", DEMO_DS_ID)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Demo DS not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = getServiceSupabase();
  const body = await request.json();
  const { tokens, style_preset, icon_library } = body;

  const { error } = await supabase
    .from("design_systems")
    .update({ tokens, style_preset, icon_library, updated_at: new Date().toISOString() })
    .eq("id", DEMO_DS_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
