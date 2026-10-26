import { query } from "@/lib/db";
import { handler, HttpError, intId, ok, requireApiUser } from "@/lib/http";
import { OPEN_STATUSES } from "@/lib/constants";
import { getFault } from "@/lib/faults";
import { addEvent } from "@/lib/notify";

// "I have this problem too" — follow an existing open fault instead of duplicating it.
export const POST = handler(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser("customer");
  const f = await getFault(intId((await params).id));
  if (!f || !OPEN_STATUSES.includes(f.status)) throw new HttpError(404, "That fault is no longer open.");
  if (f.user_id === user.id) throw new HttpError(400, "That is your own report.");
  await query("INSERT INTO fault_followers (fault_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [f.id, user.id]);
  await addEvent(f.id, user.id, "note", `Another customer confirmed this fault (${f.followers! + 1} affected).`, true);
  return ok({ id: f.id });
});
