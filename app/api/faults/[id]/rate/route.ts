import { query } from "@/lib/db";
import { body, handler, HttpError, intId, ok, requireApiUser, str } from "@/lib/http";
import { getFault } from "@/lib/faults";
import { addEvent } from "@/lib/notify";

export const POST = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireApiUser("customer");
  const f = await getFault(intId((await params).id));
  if (!f || f.user_id !== user.id) throw new HttpError(404, "Fault not found.");
  if (f.status !== "resolved") throw new HttpError(400, "You can rate a fault once it is resolved.");
  const b = await body(req);
  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "Choose 1 to 5 stars.");
  const feedback = str(b.feedback, "Feedback", { max: 500, optional: true });
  await query("UPDATE faults SET rating=$1, feedback=$2 WHERE id=$3", [rating, feedback, f.id]);
  await addEvent(f.id, user.id, "rating", `Customer rated the service ${rating}/5.${feedback ? " “" + feedback + "”" : ""}`, true);
  return ok();
});
