import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes (accessible without login)
  const publicPaths = ["/", "/login", "/signup", "/forgot", "/api", "/_next", "/static", "/student-signin"];
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next();

  // 🧩 Check Student Cookie Auth first (custom auth)
  const portalRole = req.cookies.get("portal_role")?.value;
  const studentRoll = req.cookies.get("student_roll")?.value;

  if (pathname.startsWith("/student")) {
    // ✅ Allow if student cookie exists
    if (portalRole === "student" && studentRoll) {
      return NextResponse.next();
    }

    // 🚫 Otherwise redirect to student login
    const url = req.nextUrl.clone();
    url.pathname = "/student-signin";
    return NextResponse.redirect(url);
  }

  // 🧩 Admin & Teacher — use Supabase Auth only
  const token = req.cookies.get("sb:token")?.value || null;

  if (token) {
    const { data: userData } = await supabase.auth.getUser(token);
    if (userData?.user) {
      const userId = userData.user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      const role = profile?.role ?? "student";

      if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      if (pathname.startsWith("/teacher") && role !== "teacher") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      return NextResponse.next();
    }
  }

  // 🚫 If no token and trying to access admin/teacher
  if (pathname.startsWith("/admin") || pathname.startsWith("/teacher")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"]
};