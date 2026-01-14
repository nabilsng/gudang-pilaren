import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "gp_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Proteksi semua route di /dashboard
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Optional: kalau sudah login, jangan balik ke /login
  if (pathname === "/login") {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Apply middleware hanya untuk route tertentu
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
