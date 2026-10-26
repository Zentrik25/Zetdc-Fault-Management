import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Open /api/health after deploying: "ok" means the app can reach the database.
export async function GET() {
  try {
    const [{ users }] = await query<{ users: number }>("SELECT count(*)::int AS users FROM users");
    return NextResponse.json({ status: "ok", database: "connected", users });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "error", database: "unreachable — check DATABASE_URL" }, { status: 503 });
  }
}
