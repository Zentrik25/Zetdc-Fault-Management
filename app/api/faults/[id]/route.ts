import { query } from "@/lib/db";
import { body, handler, HttpError, intId, ok, requireApiUser, str } from "@/lib/http";
import { PRIORITIES, STATUSES, STATUS_LABEL } from "@/lib/constants";
import { canView, getFault } from "@/lib/faults";
import { addEvent, notify } from "@/lib/notify";

type Ctx = { params: Promise<{ id: string }> };

// Staff update: status, priority, assignment, resolution note, duplicate merge.
export const PATCH = handler(async (req: Request, { params }: Ctx) => {
  const user = await requireApiUser("admin", "technician");
  const id = intId((await params).id);
  const f = await getFault(id);
  if (!f || !(await canView(user, f))) throw new HttpError(404, "Fault not found.");
  const b = await body(req);
  const isAdmin = user.role === "admin";
  const sets: string[] = [];
  const vals: unknown[] = [];
  const set = (col: string, v: unknown) => {
    vals.push(v);
    sets.push(`${col}=$${vals.length}`);
  };
  let status: string = f.status;
  const toNotify: (number | null)[] = [f.user_id];
  const followers = await query<{ user_id: number }>("SELECT user_id FROM fault_followers WHERE fault_id=$1", [id]);
  followers.forEach((x) => toNotify.push(x.user_id));

  if (b.priority !== undefined && b.priority !== f.priority) {
    if (!isAdmin) throw new HttpError(403, "Only admins can change priority.");
    if (!PRIORITIES.includes(b.priority)) throw new HttpError(400, "Invalid priority.");
    set("priority", b.priority);
    await addEvent(id, user.id, "priority", `Priority changed from ${f.priority} to ${b.priority}.`, true);
  }

  if (b.assigned_to !== undefined && b.assigned_to !== f.assigned_to) {
    if (!isAdmin) throw new HttpError(403, "Only admins can assign crews.");
    if (b.assigned_to === null) {
      set("assigned_to", null);
      await addEvent(id, user.id, "assign", "Technician unassigned.", true);
    } else {
      const [tech] = await query<{ id: number; name: string }>(
        "SELECT id, name FROM users WHERE id=$1 AND role='technician' AND active",
        [Number(b.assigned_to)],
      );
      if (!tech) throw new HttpError(400, "Choose a valid technician.");
      set("assigned_to", tech.id);
      await addEvent(id, user.id, "assign", `Crew assigned: ${tech.name}.`);
      await notify([tech.id], id, `You were assigned ${f.ticket} (${f.suburb ?? f.city}).`, user.id);
      if (["reported", "acknowledged"].includes(f.status) && b.status === undefined) status = "assigned";
    }
  }

  if (b.status !== undefined) status = b.status;
  if (status !== f.status) {
    if (!STATUSES.includes(status as never)) throw new HttpError(400, "Invalid status.");
    if (!isAdmin && !["acknowledged", "in_progress", "resolved"].includes(status))
      throw new HttpError(403, "Technicians can set: acknowledged, in progress or resolved.");
    const note = str(b.resolution_note, "Resolution note", { max: 1000, optional: true });
    if (status === "resolved") {
      if (!note && !f.resolution_note) throw new HttpError(400, "Add a resolution note describing what was fixed.");
      if (note) set("resolution_note", note);
      set("resolved_at", new Date());
    }
    if (status === "closed" && !note) throw new HttpError(400, "Add a note explaining why the fault is closed.");
    if (status === "closed" && note) set("resolution_note", note);
    if (["reported", "acknowledged", "assigned", "in_progress"].includes(status) && f.resolved_at) set("resolved_at", null);
    set("status", status);
    await addEvent(id, user.id, "status", `Status: ${STATUS_LABEL[f.status]} → ${STATUS_LABEL[status]}.${note ? " " + note : ""}`);
    await notify(
      toNotify,
      id,
      `${f.ticket} is now "${STATUS_LABEL[status]}".`,
      user.id,
    );
    if (!isAdmin) {
      const admins = await query<{ id: number }>("SELECT id FROM users WHERE role='admin' AND active");
      await notify(admins.map((a) => a.id), id, `${user.name} set ${f.ticket} to "${STATUS_LABEL[status]}".`, user.id);
    }
  } else if (b.resolution_note !== undefined && f.status === "resolved") {
    set("resolution_note", str(b.resolution_note, "Resolution note", { max: 1000 }));
  }

  if (b.duplicate_of !== undefined && b.duplicate_of !== null) {
    if (!isAdmin) throw new HttpError(403, "Only admins can merge duplicates.");
    const parent = await getFault(Number(b.duplicate_of));
    if (!parent || parent.id === id) throw new HttpError(400, "Invalid original fault.");
    set("duplicate_of", parent.id);
    if (status !== "closed") set("status", "closed");
    await query(
      "INSERT INTO fault_followers (fault_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [parent.id, f.user_id],
    );
    await addEvent(id, user.id, "duplicate", `Merged into ${parent.ticket} (same fault). Updates will continue there.`);
    await addEvent(parent.id, user.id, "note", `${f.ticket} was merged into this fault.`, true);
    await notify([f.user_id], parent.id, `Your report ${f.ticket} was merged into ${parent.ticket}. Follow it for updates.`, user.id);
  }

  if (!sets.length) return ok();
  vals.push(id);
  await query(`UPDATE faults SET ${sets.join(", ")}, updated_at=now() WHERE id=$${vals.length}`, vals);
  return ok();
});
