import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { secretKey } from "@/lib/secret";

// Redirects happen here, before a page streams its loading skeleton, so they are real HTTP
// redirects: signed-out visitors go to /login and people on the wrong portal go to their own.
// Pages still verify the session and role against the database.
const CUSTOMER_ONLY = ["/dashboard", "/my-faults", "/report"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("zetdc_session")?.value;
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));
  if (!token) return to("/login");

  let role: string | undefined;
  try {
    role = (await jwtVerify(token, await secretKey())).payload.role as string | undefined;
  } catch {
    return to("/login");
  }
  if (role === "customer" && (pathname === "/admin" || pathname.startsWith("/admin/"))) return to("/dashboard");
  if ((role === "admin" || role === "technician") && CUSTOMER_ONLY.some((p) => pathname === p || pathname.startsWith(p + "/"))) return to("/admin");
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-faults/:path*", "/report/:path*", "/notifications/:path*", "/settings/:path*", "/search/:path*", "/admin/:path*"],
};
