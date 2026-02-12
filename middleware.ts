import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  );

  // 🔐 Get logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // ✅ Allow public routes
  const publicRoutes = [
    "/",
    "/admin/login",
    "/student-signin",
    "/login",
  ];

  if (publicRoutes.includes(pathname)) {
    return res;
  }

  // 🚫 Protect Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // 🚫 Protect Teacher Routes
  if (pathname.startsWith("/teacher")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*"],
};
