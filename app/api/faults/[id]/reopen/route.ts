import { query } from "@/lib/db";
import { body, handler, HttpError, intId, ok, requireApiUser, str } from "@/lib/http";
import { getFault } from "@/lib/faults";
import { addEvent, notify } from "@/lib/notify";

export const POST = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser("customer");
  const f = await getFault(intId((await params).id));
  if (!f || f.user_id !== user.id) throw new HttpError(404, "Fault not found.");
  if (f.status !== "resolved") throw new HttpError(400, "Only resolved faults can be reopened.");
  const reason = str((await body(req)).reason, "Reason", { min: 5, max: 500 })!;
  const bump = f.priority === "low" ? "medium" : f.priority === "medium" ? "high" : f.priority;
  await query(
    "UPDATE faults SET status='reported', priority=$1, resolved_at=NULL, rating=NULL, feedback=NULL, updated_at=now() WHERE id=$2",
    [bump, f.id],
  );
  await addEvent(f.id, user.id, "reopen", `Customer says the fault is NOT fixed: ${reason}`);
  const admins = await query<{ id: number }>("SELECT id FROM users WHERE role='admin' AND active");
  await notify([...admins.map((a) => a.id), f.assigned_to], f.id, `${f.ticket} was reopened by the customer.`);
  return ok();
});
