import { query } from "@/lib/db";
import { handler, intId, ok, requireApiUser } from "@/lib/http";

export const DELETE = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await requireApiUser("admin");
  await query("DELETE FROM announcements WHERE id=$1", [intId((await params).id)]);
  return ok();
});
