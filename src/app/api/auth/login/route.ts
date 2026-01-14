import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

const COOKIE_NAME = "gp_token";

function safeNext(nextUrl: string | null) {
  // hindari open redirect ke domain luar
  if (!nextUrl) return "/dashboard";
  const n = String(nextUrl);
  if (n.startsWith("/") && !n.startsWith("//")) return n;
  return "/dashboard";
}

async function readBody(req: Request) {
  const ct = req.headers.get("content-type") || "";

  // Support JSON (fetch)
  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return {
      username: String(body.username ?? ""),
      password: String(body.password ?? ""),
      next: safeNext(body.next ?? null),
    };
  }

  // Support FormData (form POST)
  const fd = await req.formData().catch(() => null);
  return {
    username: String(fd?.get("username") ?? ""),
    password: String(fd?.get("password") ?? ""),
    next: safeNext(fd?.get("next") ? String(fd?.get("next")) : null),
  };
}

export async function GET() {
  // kalau user kebuka /api/auth/login lewat browser, jangan tampil JSON
  return NextResponse.redirect(new URL("/login", "http://localhost:3000"), { status: 303 });
}

export async function POST(req: Request) {
  try {
    const { username, password, next } = await readBody(req);

    if (!username || !password) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Username & password wajib.")}&next=${encodeURIComponent(next)}`, req.url),
        { status: 303 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, passwordHash: true, role: true, isActive: true, name: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Akun tidak ditemukan / tidak aktif.")}&next=${encodeURIComponent(next)}`, req.url),
        { status: 303 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Password salah.")}&next=${encodeURIComponent(next)}`, req.url),
        { status: 303 }
      );
    }

    const token = await signToken({
      sub: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    });

    const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (e) {
    // fallback: balik ke login biar user gak lihat JSON error
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Terjadi error saat login.")}`, req.url),
      { status: 303 }
    );
  }
}
