import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";
import { body, handler, HttpError, ok, requireApiUser } from "@/lib/http";

export const POST = handler(async (req: Request) => {
  const user = await requireApiUser();
  const b = await body(req);
  const current = typeof b.current === "string" ? b.current : "";
  const next = typeof b.next === "string" ? b.next : "";
  if (next.length < 6) throw new HttpError(400, "New password must be at least 6 characters.");
  const row = await queryOne<{ password_hash: string }>("SELECT password_hash FROM users WHERE id=$1", [user.id]);
  if (!row || !(await bcrypt.compare(current, row.password_hash))) throw new HttpError(400, "Your current password is incorrect.");
  if (current === next) throw new HttpError(400, "Choose a password different from the current one.");
  await query("UPDATE users SET password_hash=$1 WHERE id=$2", [await bcrypt.hash(next, 10), user.id]);
  return ok();
});
