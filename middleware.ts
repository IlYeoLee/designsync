import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 공개 경로는 그냥 통과
  const publicPaths = ["/login", "/auth", "/r/", "/api/setup", "/api/rules", "/api/sync", "/api/save"];
  const isPublic = publicPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  const isAsset = request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/fonts") ||
    request.nextUrl.pathname.includes(".");

  if (isPublic || isAsset) {
    return NextResponse.next();
  }

  // 보호 경로: 쿠키에 Supabase 세션이 있는지만 간단히 체크
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
