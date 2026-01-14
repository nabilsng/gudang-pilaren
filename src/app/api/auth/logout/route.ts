import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  await clearAuthCookie();

  // setelah logout, pindah ke halaman login (GET)
  const url = new URL("/login?next=/dashboard", req.url);
  return NextResponse.redirect(url, 303);
}

// optional: kalau user kebuka /api/auth/logout via GET (kayak screenshot),
// tetap redirect juga biar ga tampil JSON / blank page
export async function GET(req: Request) {
  await clearAuthCookie();

  const url = new URL("/login?next=/dashboard", req.url);
  return NextResponse.redirect(url, 303);
}
