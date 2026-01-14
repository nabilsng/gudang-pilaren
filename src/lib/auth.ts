import { cookies } from "next/headers";
import { signToken, verifyToken } from "@/lib/jwt";
import type { TokenPayload } from "@/lib/jwt";
import { Role } from "@prisma/client";

const COOKIE_NAME = "gp_token";

// Re-export biar pemakaian tetap sama di route login/logout
export { signToken, verifyToken };
export type { TokenPayload };

// Tipe session auth yang dipakai app
export type AuthSession = Omit<TokenPayload, "role"> & { role: Role };

export async function setAuthCookie(token: string) {
  const jar = await cookies();

  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });
}

export async function clearAuthCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

function isRole(v: unknown): v is Role {
  return v === "ADMIN_GUDANG" || v === "KARYAWAN" || v === "KURIR";
}

export async function getAuthFromCookie(): Promise<AuthSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);

    // validasi minimal biar gak “asal cast”
    if (!payload?.sub || !payload?.username || !isRole(payload?.role)) return null;

    return {
      sub: String(payload.sub),
      username: String(payload.username),
      role: payload.role,
    };
  } catch {
    return null;
  }
}
