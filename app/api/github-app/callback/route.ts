import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GitHub App installation callback.
 *
 * After user installs the app on their repos, GitHub redirects here with:
 * ?installation_id=12345&setup_action=install
 *
 * We store the installation_id in the user's active design system.
 */
export async function GET(req: NextRequest) {
  const installationId = req.nextUrl.searchParams.get("installation_id");
  const setupAction = req.nextUrl.searchParams.get("setup_action");
  const dsId = req.nextUrl.searchParams.get("state"); // we pass DS id as state

  const origin = req.nextUrl.origin;

  if (!installationId || setupAction !== "install") {
    return NextResponse.redirect(`${origin}?github_error=invalid_callback`);
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
    return NextResponse.redirect(`${origin}/login`);
  }

  // Store installation_id — if dsId provided, update that DS; otherwise update all user's DS
  if (dsId) {
    await supabase
      .from("design_systems")
      .update({ github_installation_id: parseInt(installationId, 10) })
      .eq("id", dsId)
      .eq("user_id", user.id);
  } else {
    // Store on all user's design systems that don't have an installation yet
    await supabase
      .from("design_systems")
      .update({ github_installation_id: parseInt(installationId, 10) })
      .eq("user_id", user.id)
      .is("github_installation_id", null);
  }

  return NextResponse.redirect(`${origin}?github_installed=true`);
}
