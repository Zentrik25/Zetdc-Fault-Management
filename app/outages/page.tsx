import { query } from "@/lib/db";
import { activeAnnouncements } from "@/lib/public";
import { timeAgo, typeIcon, typeLabel } from "@/lib/constants";
import { toPin } from "@/lib/pins";
import FaultsMap from "@/components/FaultsMap";
import Announcements from "@/components/Announcements";
import { StatusBadge } from "@/components/ui";

type Row = { id: number; ticket: string; type: string; status: string; priority: string; suburb: string | null; city: string; lat: number | null; lng: number | null; created_at: Date; affected: number };

export default async function Page() {
  const [faults, notices] = await Promise.all([
    query<Row>(
      `SELECT id, ticket, type, status, priority, suburb, city, lat, lng, created_at,
         (SELECT count(*)::int FROM fault_followers ff WHERE ff.fault_id=faults.id)+1 AS affected
       FROM faults WHERE status IN ('reported','acknowledged','assigned','in_progress') ORDER BY created_at DESC LIMIT 200`,
    ),
    activeAnnouncements(),
  ]);
  const pins = faults.map((f) => toPin(f)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Live outage &amp; fault map</h1>
        <p className="text-slate-600 text-sm">Active faults reported across Zimbabwe. {faults.length} open right now. Red = critical, orange = high, yellow = medium, grey = low.</p>
      </div>
      <Announcements items={notices} />
      <FaultsMap pins={pins} />
      <div className="grid md:grid-cols-2 gap-2">
        {faults.slice(0, 30).map((f) => (
          <div key={f.id} className="card flex items-center gap-3 text-sm">
            <span className="text-xl">{typeIcon(f.type)}</span>
            <div className="flex-1">
              <div className="font-semibold">{typeLabel(f.type)} — {f.suburb ? `${f.suburb}, ` : ""}{f.city}</div>
              <div className="text-xs text-slate-500">{f.ticket} · {timeAgo(f.created_at)} · {f.affected} affected</div>
            </div>
            <StatusBadge status={f.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
