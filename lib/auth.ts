import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { queryOne } from "./db";
import type { Role } from "./constants";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
};

const COOKIE = "zetdc_session";

function secret() {
  // On Vercel set AUTH_SECRET. If it is missing we derive one from DATABASE_URL
  // (itself a secret) so a school deployment still works safely.
  const s =
    process.env.AUTH_SECRET ??
    (process.env.DATABASE_URL
      ? createHash("sha256").update("zetdc:" + process.env.DATABASE_URL).digest("hex")
      : "dev-only-secret-change-me");
  return new TextEncoder().encode(s);
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const u = await queryOne<SessionUser & { active: boolean }>(
      "SELECT id, name, email, phone, role, active FROM users WHERE id=$1",
      [payload.uid],
    );
    if (!u || !u.active) return null;
    return { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role };
  } catch {
    return null;
  }
}

/** For server components: redirect to login unless the user has one of the roles. */
export async function requirePage(...roles: Role[]): Promise<SessionUser> {
  const u = await getUser();
  if (!u) redirect("/login");
  if (roles.length && !roles.includes(u.role)) redirect(homeFor(u.role));
  return u;
}

export const homeFor = (role: Role) => (role === "customer" ? "/dashboard" : "/admin");
