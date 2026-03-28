import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getInstallationRepos } from "@/lib/github-app";

/**
 * GET /api/github-app/repos?dsId=xxx
 *
 * Returns repos accessible by the design system's GitHub App installation.
 * Used to populate the repo selector dropdown.
 */
export async function GET(req: NextRequest) {
  const dsId = req.nextUrl.searchParams.get("dsId");
  if (!dsId) {
    return NextResponse.json({ error: "Missing dsId" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) { c.forEach(({ name, value, options }) => { try { cookieStore.set(name, value, options); } catch {} }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: ds } = await supabase
    .from("design_systems")
    .select("github_installation_id")
    .eq("id", dsId)
    .eq("user_id", user.id)
    .single();

  if (!ds?.github_installation_id) {
    return NextResponse.json({ repos: [], installed: false });
  }

  try {
    const repos = await getInstallationRepos(ds.github_installation_id);
    return NextResponse.json({ repos, installed: true });
  } catch {
    return NextResponse.json({ repos: [], installed: true, error: "Failed to list repos" });
  }
}
