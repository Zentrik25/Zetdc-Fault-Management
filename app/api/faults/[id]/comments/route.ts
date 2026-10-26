import { query } from "@/lib/db";
import { body, handler, HttpError, intId, ok, requireApiUser, str } from "@/lib/http";
import { canView, getFault } from "@/lib/faults";
import { addEvent, notify } from "@/lib/notify";

export const POST = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser();
  const f = await getFault(intId((await params).id));
  if (!f || !(await canView(user, f))) throw new HttpError(404, "Fault not found.");
  const b = await body(req);
  const message = str(b.message, "Message", { max: 1000 })!;
  const staff = user.role !== "customer";
  const internal = staff && b.internal === true;
  await addEvent(f.id, user.id, internal ? "note" : "comment", message, internal);
  if (!internal) {
    const followers = await query<{ user_id: number }>("SELECT user_id FROM fault_followers WHERE fault_id=$1", [f.id]);
    const admins = staff ? [] : await query<{ id: number }>("SELECT id FROM users WHERE role='admin' AND active");
    await notify(
      staff
        ? [f.user_id, ...followers.map((x) => x.user_id)]
        : [f.assigned_to, ...admins.map((a) => a.id)],
      f.id,
      `New message on ${f.ticket} from ${user.name}.`,
      user.id,
    );
  }
  return ok({ ok: true }, 201);
});
