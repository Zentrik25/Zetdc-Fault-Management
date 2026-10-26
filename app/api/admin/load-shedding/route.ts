import { query } from "@/lib/db";
import { body, handler, HttpError, ok, requireApiUser, str } from "@/lib/http";
import { CITIES } from "@/lib/constants";

export const POST = handler(async (req: Request) => {
  const admin = await requireApiUser("admin");
  const b = await body(req);
  const city = String(b.city ?? "");
  if (!CITIES.includes(city)) throw new HttpError(400, "Choose a city or town.");
  const area = str(b.area, "Area", { min: 2, max: 120 })!;
  const date = String(b.shed_date ?? "");
  const start = String(b.start_time ?? "");
  const end = String(b.end_time ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) throw new HttpError(400, "Choose a valid date.");
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) throw new HttpError(400, "Enter start and end times.");
  if (end <= start) throw new HttpError(400, "End time must be after start time.");
  const stage = b.stage === "" || b.stage == null ? null : Number(b.stage);
  if (stage !== null && (!Number.isInteger(stage) || stage < 1 || stage > 8)) throw new HttpError(400, "Stage must be 1 to 8.");
  const note = str(b.note, "Note", { max: 300, optional: true });
  await query(
    "INSERT INTO load_shedding (city,area,shed_date,start_time,end_time,stage,note,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
    [city, area, date, start, end, stage, note, admin.id],
  );
  return ok({ ok: true }, 201);
});
