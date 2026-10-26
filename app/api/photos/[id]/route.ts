import { queryOne } from "@/lib/db";
import { handler, HttpError, intId, requireApiUser } from "@/lib/http";
import { canView, getFault } from "@/lib/faults";

export const GET = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser();
  const p = await queryOne<{ data: string; fault_id: number }>("SELECT data, fault_id FROM fault_photos WHERE id=$1", [
    intId((await params).id),
  ]);
  const f = p && (await getFault(p.fault_id));
  if (!p || !f || !(await canView(user, f))) throw new HttpError(404, "Not found.");
  const m = /^data:(image\/[a-z]+);base64,(.*)$/.exec(p.data)!;
  return new Response(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=3600" },
  });
});
