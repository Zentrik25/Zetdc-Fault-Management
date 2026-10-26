import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { body, handler, HttpError, ok } from "@/lib/http";

export const POST = handler(async (req: Request) => {
  const b = await body(req);
  const email = String(b.email ?? "").trim().toLowerCase();
  const password = String(b.password ?? "");
  const u = await queryOne<{ id: number; password_hash: string; role: string; active: boolean }>(
    "SELECT id, password_hash, role, active FROM users WHERE email=$1",
    [email],
  );
  if (!u || !(await bcrypt.compare(password, u.password_hash)))
    throw new HttpError(401, "Wrong email or password.");
  if (!u.active) throw new HttpError(403, "This account has been deactivated. Contact ZETDC.");
  await createSession(u.id);
  return ok({ ok: true, role: u.role });
});
