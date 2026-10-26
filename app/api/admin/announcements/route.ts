import { query } from "@/lib/db";
import { body, handler, HttpError, ok, requireApiUser, str } from "@/lib/http";

export const POST = handler(async (req: Request) => {
  const admin = await requireApiUser("admin");
  const b = await body(req);
  const title = str(b.title, "Title", { min: 3, max: 120 })!;
  const text = str(b.body, "Details", { min: 5, max: 1000 })!;
  const area = str(b.area, "Area", { max: 120, optional: true });
  const kind = b.kind === "alert" ? "alert" : "planned";
  const date = (v: unknown) => {
    if (!v) return null;
    const d = new Date(String(v));
    if (isNaN(d.getTime())) throw new HttpError(400, "Invalid date.");
    return d;
  };
  const starts = date(b.starts_at);
  const ends = date(b.ends_at);
  if (starts && ends && ends < starts) throw new HttpError(400, "End time must be after start time.");
  await query(
    "INSERT INTO announcements (kind,title,body,area,starts_at,ends_at,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    [kind, title, text, area, starts, ends, admin.id],
  );
  return ok({ ok: true }, 201);
});
