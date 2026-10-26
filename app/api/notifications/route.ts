import { query } from "@/lib/db";
import { handler, ok, requireApiUser } from "@/lib/http";

export const POST = handler(async () => {
  const user = await requireApiUser();
  await query("UPDATE notifications SET read=TRUE WHERE user_id=$1 AND read=FALSE", [user.id]);
  return ok();
});
