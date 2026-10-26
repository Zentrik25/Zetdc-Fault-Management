import { query } from "@/lib/db";
import { handler, ok } from "@/lib/http";

// Public: active faults with no personal data, for the outage map.
export const GET = handler(async () => {
  const faults = await query(
    `SELECT id, ticket, type, status, priority, suburb, city, lat, lng, created_at,
            (SELECT count(*)::int FROM fault_followers ff WHERE ff.fault_id=faults.id) + 1 AS affected
     FROM faults WHERE status IN ('reported','acknowledged','assigned','in_progress') AND lat IS NOT NULL
     ORDER BY created_at DESC LIMIT 500`,
  );
  return ok({ faults });
});
