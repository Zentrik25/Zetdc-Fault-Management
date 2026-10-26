import { query } from "@/lib/db";
import { body, handler, HttpError, ok, requireApiUser, str } from "@/lib/http";
import { CITIES, FAULT_TYPE_VALUES, defaultPriority } from "@/lib/constants";
import { addEvent, notify } from "@/lib/notify";

export const POST = handler(async (req: Request) => {
  const user = await requireApiUser("customer");
  const b = await body(req);
  const type = String(b.type ?? "");
  if (!FAULT_TYPE_VALUES.includes(type)) throw new HttpError(400, "Choose a fault type.");
  const description = str(b.description, "Description", { min: 10, max: 2000 })!;
  const address = str(b.address, "Address / landmark", { min: 3, max: 200 })!;
  const suburb = str(b.suburb, "Suburb", { max: 80, optional: true });
  const city = String(b.city ?? "");
  if (!CITIES.includes(city)) throw new HttpError(400, "Choose a city or town.");
  const meter = str(b.meter_number, "Meter number", { max: 30, optional: true });
  const danger = b.danger === true;
  const lat = typeof b.lat === "number" && isFinite(b.lat) ? b.lat : null;
  const lng = typeof b.lng === "number" && isFinite(b.lng) ? b.lng : null;
  if (lat !== null && (lat < -23 || lat > -15 || (lng ?? 0) < 24 || (lng ?? 0) > 34))
    throw new HttpError(400, "That location is outside Zimbabwe.");
  const photos: string[] = Array.isArray(b.photos) ? b.photos.slice(0, 3) : [];
  for (const p of photos) {
    if (typeof p !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(p) || p.length > 1_500_000)
      throw new HttpError(400, "Photos must be images under about 1 MB.");
  }

  const [f] = await query<{ id: number; ticket: string }>(
    `INSERT INTO faults (user_id,type,priority,description,address,suburb,city,meter_number,lat,lng,danger)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, ticket`,
    [user.id, type, defaultPriority(type, danger), description, address, suburb, city, meter, lat, lng, danger],
  );
  for (const p of photos) await query("INSERT INTO fault_photos (fault_id, data) VALUES ($1,$2)", [f.id, p]);
  await addEvent(f.id, user.id, "created", "Fault reported by customer.");

  const admins = await query<{ id: number }>("SELECT id FROM users WHERE role='admin' AND active");
  await notify(
    admins.map((a) => a.id),
    f.id,
    `${danger ? "⚠️ DANGER: " : ""}New fault ${f.ticket} in ${suburb ? suburb + ", " : ""}${city}.`,
  );
  return ok({ id: f.id, ticket: f.ticket }, 201);
});
