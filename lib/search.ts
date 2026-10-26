import "server-only";
import type { SessionUser } from "./auth";
import { query } from "./db";
import { FAULT_TYPES } from "./constants";
import { groupsFor } from "./nav";
import { listFaults } from "./faults";
import { activeAnnouncements, upcomingShedding, type Announcement, type SheddingRow } from "./public";
import type { FaultRow } from "./types";

export type SearchResults = {
  q: string;
  faults: FaultRow[];
  users: { id: number; name: string; email: string; phone: string | null; role: string; active: boolean }[];
  notices: Announcement[];
  shedding: SheddingRow[];
  notifications: { id: number; fault_id: number | null; message: string; created_at: Date }[];
  pages: { href: string; label: string; icon: string }[];
};

/** Global search, scoped to what the signed-in user is allowed to see. */
export async function globalSearch(user: SessionUser, raw: string): Promise<SearchResults> {
  const q = raw.trim().slice(0, 80);
  const empty: SearchResults = { q, faults: [], users: [], notices: [], shedding: [], notifications: [], pages: [] };
  if (q.length < 2) return empty;
  const like = `%${q}%`;
  const lower = q.toLowerCase();
  const qTypes = FAULT_TYPES.filter((t) => t.label.toLowerCase().includes(lower)).map((t) => t.value);

  const pages = [
    ...groupsFor(user.role).flatMap((g) => g.links),
    ["/settings", "Settings", "⚙️"] as [string, string, string],
  ]
    .filter(([, label], i, a) => label.toLowerCase().includes(lower) && a.findIndex((x) => x[1] === label) === i)
    .map(([href, label, icon]) => ({ href, label, icon }));

  const [faults, users, announcements, shedding, notifications] = await Promise.all([
    listFaults(user, { q, qTypes }, 20),
    user.role === "admin"
      ? query<SearchResults["users"][number]>(
          "SELECT id, name, email, phone, role, active FROM users WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1 ORDER BY name LIMIT 8",
          [like],
        )
      : Promise.resolve([]),
    activeAnnouncements(),
    upcomingShedding(),
    query<SearchResults["notifications"][number]>(
      "SELECT id, fault_id, message, created_at FROM notifications WHERE user_id=$1 AND message ILIKE $2 ORDER BY created_at DESC LIMIT 5",
      [user.id, like],
    ),
  ]);

  const has = (...v: (string | null)[]) => v.some((x) => x?.toLowerCase().includes(lower));
  return {
    q,
    faults,
    users,
    notices: announcements.filter((a) => has(a.title, a.body, a.area)).slice(0, 5),
    shedding: shedding.filter((r) => has(r.area, r.city, r.note)).slice(0, 8),
    notifications,
    pages,
  };
}
