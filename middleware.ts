import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
      },
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
