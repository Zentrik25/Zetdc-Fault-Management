import "server-only";
import { query, queryOne } from "./db";
import { isOverdue } from "./constants";
import { getSettings } from "./settings";
import type { SessionUser } from "./auth";
import type { EventRow, FaultRow } from "./types";

const FAULT_SELECT = `
  SELECT f.*, ru.name AS reporter_name, ru.phone AS reporter_phone, ru.email AS reporter_email,
         tu.name AS tech_name,
         (SELECT count(*)::int FROM fault_followers ff WHERE ff.fault_id=f.id) AS followers
  FROM faults f
  JOIN users ru ON ru.id=f.user_id
  LEFT JOIN users tu ON tu.id=f.assigned_to`;

export async function getFault(id: number): Promise<FaultRow | null> {
  return queryOne<FaultRow>(`${FAULT_SELECT} WHERE f.id=$1`, [id]);
}

export async function isFollower(faultId: number, userId: number) {
  return !!(await queryOne("SELECT 1 FROM fault_followers WHERE fault_id=$1 AND user_id=$2", [faultId, userId]));
}

/** Can this user see the fault? */
export async function canView(user: SessionUser, f: FaultRow) {
  if (user.role === "admin") return true;
  if (user.role === "technician") return f.assigned_to === user.id;
  return f.user_id === user.id || (await isFollower(f.id, user.id));
}

export async function getEvents(faultId: number, includeInternal: boolean): Promise<EventRow[]> {
  return query<EventRow>(
    `SELECT e.*, u.name AS user_name, u.role AS user_role FROM fault_events e
     LEFT JOIN users u ON u.id=e.user_id
     WHERE e.fault_id=$1 ${includeInternal ? "" : "AND e.internal=FALSE"}
     ORDER BY e.created_at, e.id`,
    [faultId],
  );
}

export async function getPhotoIds(faultId: number): Promise<number[]> {
  return (await query<{ id: number }>("SELECT id FROM fault_photos WHERE fault_id=$1 ORDER BY id", [faultId])).map(
    (r) => r.id,
  );
}

export type ListFilters = {
  status?: string;
  priority?: string;
  type?: string;
  city?: string;
  q?: string;
  assigned?: string; // "me" | "none" | id
  overdue?: boolean;
};

export async function listFaults(user: SessionUser, filters: ListFilters = {}, limit = 200): Promise<FaultRow[]> {
  const where: string[] = [];
  const p: unknown[] = [];
  const add = (sql: string, v: unknown) => {
    p.push(v);
    where.push(sql.replace("?", `$${p.length}`));
  };
  if (user.role === "customer") {
    p.push(user.id);
    where.push(
      `(f.user_id=$${p.length} OR EXISTS (SELECT 1 FROM fault_followers ff WHERE ff.fault_id=f.id AND ff.user_id=$${p.length}))`,
    );
  }
  if (user.role === "technician") add("f.assigned_to=?", user.id);
  if (filters.status === "open") where.push("f.status IN ('reported','acknowledged','assigned','in_progress')");
  else if (filters.status) add("f.status=?", filters.status);
  if (filters.priority) add("f.priority=?", filters.priority);
  if (filters.type) add("f.type=?", filters.type);
  if (filters.city) add("f.city=?", filters.city);
  if (filters.assigned === "none") where.push("f.assigned_to IS NULL");
  else if (filters.assigned === "me") add("f.assigned_to=?", user.id);
  else if (filters.assigned && Number(filters.assigned)) add("f.assigned_to=?", Number(filters.assigned));
  if (filters.q) {
    p.push(`%${filters.q}%`);
    const n = `$${p.length}`;
    where.push(
      `(f.ticket ILIKE ${n} OR f.address ILIKE ${n} OR f.suburb ILIKE ${n} OR f.description ILIKE ${n} OR ru.name ILIKE ${n} OR f.meter_number ILIKE ${n})`,
    );
  }
  const sla = filters.overdue ? (await getSettings()).sla : undefined;
  p.push(limit);
  const rows = await query<FaultRow>(
    `${FAULT_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY CASE f.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END
       * (CASE WHEN f.status IN ('resolved','closed') THEN 10 ELSE 1 END), f.created_at DESC
     LIMIT $${p.length}`,
    p,
  );
  return filters.overdue ? rows.filter((r) => isOverdue(r, sla)) : rows;
}

export async function getStats() {
  const [totals] = await query<{
    total: number;
    open: number;
    critical: number;
    unassigned: number;
    resolved: number;
    today: number;
    avg_hours: number | null;
    avg_rating: number | null;
  }>(`SELECT count(*)::int AS total,
        count(*) FILTER (WHERE status IN ('reported','acknowledged','assigned','in_progress'))::int AS open,
        count(*) FILTER (WHERE priority='critical' AND status IN ('reported','acknowledged','assigned','in_progress'))::int AS critical,
        count(*) FILTER (WHERE assigned_to IS NULL AND status IN ('reported','acknowledged'))::int AS unassigned,
        count(*) FILTER (WHERE status='resolved')::int AS resolved,
        count(*) FILTER (WHERE created_at > now() - interval '24 hours')::int AS today,
        round((avg(extract(epoch FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL))::numeric, 1)::float AS avg_hours,
        round(avg(rating)::numeric, 1)::float AS avg_rating
      FROM faults`);
  const byType = await query<{ type: string; n: number }>("SELECT type, count(*)::int AS n FROM faults GROUP BY type ORDER BY n DESC");
  const byStatus = await query<{ status: string; n: number }>("SELECT status, count(*)::int AS n FROM faults GROUP BY status");
  const byCity = await query<{ city: string; n: number; open: number }>(
    `SELECT city, count(*)::int AS n,
       count(*) FILTER (WHERE status IN ('reported','acknowledged','assigned','in_progress'))::int AS open
     FROM faults GROUP BY city ORDER BY n DESC LIMIT 8`,
  );
  const perDay = await query<{ day: string; n: number }>(
    `SELECT to_char(d::date,'DD Mon') AS day, count(f.id)::int AS n
     FROM generate_series(now()::date - 6, now()::date, interval '1 day') d
     LEFT JOIN faults f ON f.created_at::date = d::date GROUP BY d ORDER BY d`,
  );
  const techs = await query<{ id: number; name: string; open: number; done: number }>(
    `SELECT u.id, u.name,
       count(f.id) FILTER (WHERE f.status IN ('assigned','in_progress'))::int AS open,
       count(f.id) FILTER (WHERE f.status='resolved')::int AS done
     FROM users u LEFT JOIN faults f ON f.assigned_to=u.id
     WHERE u.role='technician' AND u.active GROUP BY u.id ORDER BY open DESC`,
  );
  return { totals, byType, byStatus, byCity, perDay, techs };
}
