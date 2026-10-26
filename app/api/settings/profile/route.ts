import { query } from "@/lib/db";
import { body, handler, ok, requireApiUser, str } from "@/lib/http";

export const PATCH = handler(async (req: Request) => {
  const user = await requireApiUser();
  const b = await body(req);
  const name = str(b.name, "Name", { min: 2, max: 80 })!;
  const phone = str(b.phone, "Phone number", { min: 7, max: 20, optional: true });
  await query("UPDATE users SET name=$1, phone=$2 WHERE id=$3", [name, phone, user.id]);
  return ok();
});
