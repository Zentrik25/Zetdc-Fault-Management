import "server-only";
import { NextResponse } from "next/server";
import { getUser, type SessionUser } from "./auth";
import type { Role } from "./constants";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const ok = (data: unknown = { ok: true }, status = 200) =>
  NextResponse.json(data, { status });

/** Wrap a route handler: turns HttpError into JSON errors, hides unexpected ones. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error(e);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export async function requireApiUser(...roles: Role[]): Promise<SessionUser> {
  const u = await getUser();
  if (!u) throw new HttpError(401, "Please log in first.");
  if (roles.length && !roles.includes(u.role)) throw new HttpError(403, "You are not allowed to do that.");
  return u;
}

export async function body(req: Request): Promise<Record<string, any>> { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const b = await req.json();
    if (b && typeof b === "object") return b;
  } catch {}
  throw new HttpError(400, "Invalid request.");
}

export function str(v: unknown, label: string, { min = 1, max = 2000, optional = false } = {}) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) {
    if (optional) return null;
    throw new HttpError(400, `${label} is required.`);
  }
  if (s.length < min) throw new HttpError(400, `${label} is too short.`);
  if (s.length > max) throw new HttpError(400, `${label} is too long.`);
  return s;
}

export function intId(v: string) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(404, "Not found.");
  return n;
}
