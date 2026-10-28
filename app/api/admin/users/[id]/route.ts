import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { passwordProblem } from "@/lib/password";
import { body, handler, HttpError, intId, ok, requireApiUser } from "@/lib/http";

export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const admin = await requireApiUser("admin");
  const id = intId((await params).id);
  const b = await body(req);
  if (id === admin.id && b.active === false) throw new HttpError(400, "You cannot deactivate yourself.");
  if (typeof b.active === "boolean") await query("UPDATE users SET active=$1 WHERE id=$2", [b.active, id]);
  if (typeof b.password === "string") {
    const weak = passwordProblem(b.password);
    if (weak) throw new HttpError(400, weak);
    await query("UPDATE users SET password_hash=$1 WHERE id=$2", [await bcrypt.hash(b.password, 10), id]);
  }
  return ok();
});
