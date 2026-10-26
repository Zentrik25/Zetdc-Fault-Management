import { query } from "@/lib/db";
import { handler, ok, requireApiUser } from "@/lib/http";

// Open faults of the same type within ~500 m, so customers can "me too" instead of duplicating.
export const GET = handler(async (req: Request) => {
  await requireApiUser();
  const sp = new URL(req.url).searchParams;
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  const type = sp.get("type") ?? "";
  if (!isFinite(lat) || !isFinite(lng) || !sp.get("lat")) return ok({ faults: [] });
  const faults = await query(
    `SELECT id, ticket, type, status, address, suburb, created_at FROM faults
     WHERE status IN ('reported','acknowledged','assigned','in_progress') AND type=$1
       AND lat IS NOT NULL AND abs(lat-$2) < 0.0045 AND abs(lng-$3) < 0.0045
     ORDER BY created_at DESC LIMIT 5`,
    [type, lat, lng],
  );
  return ok({ faults });
});
