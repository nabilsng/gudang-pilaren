import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = process.env.JWT_SECRET || "dev-secret-change-me";
const key = new TextEncoder().encode(secret);

export type TokenPayload = {
  sub: string;
  username: string;
  role: string;
  name?: string | null;
};

export async function signToken(payload: TokenPayload) {
  // custom claims kita taruh di payload, sub tetap dipakai juga
  return await new SignJWT({
    username: payload.username,
    role: payload.role,
    name: payload.name ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, key);

  const p = payload as JWTPayload & {
    username?: string;
    role?: string;
    name?: string | null;
  };

  if (!p.sub || !p.username || !p.role) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: String(p.sub),
    username: String(p.username),
    role: String(p.role),
    name: p.name ?? null,
  };
}
