import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DEMO_OWNER_USER_ID } from "@/lib/demo-tokens";

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: return all DS owned by demo account
export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("design_systems")
    .select("*")
    .eq("user_id", DEMO_OWNER_USER_ID)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: "Demo DS not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// POST: save a specific DS by id
export async function POST(request: Request) {
  const supabase = getServiceSupabase();
  const body = await request.json();
  const { id, tokens, style_preset, icon_library } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("design_systems")
    .update({ tokens, style_preset, icon_library, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", DEMO_OWNER_USER_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
