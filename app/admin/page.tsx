import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { getStats, listFaults } from "@/lib/faults";
import { STATUS_LABEL, typeLabel } from "@/lib/constants";
import { Bar, Stat } from "@/components/ui";
import FaultList from "@/components/FaultList";

export default async function Page() {
  const u = await requirePage("admin", "technician");
  if (u.role === "technician") {
    const jobs = await listFaults(u, { status: "open" });
    const done = await listFaults(u, { status: "resolved" }, 10);
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-light">My jobs</h1>
        <FaultList faults={jobs} base="/admin/faults" staff />
        <h2 className="font-normal pt-4">Recently resolved</h2>
        <FaultList faults={done} base="/admin/faults" staff />
      </div>
    );
  }
  const [stats, urgent] = await Promise.all([
    getStats(),
    listFaults(u, { status: "open" }, 8),
  ]);
  const t = stats.totals;
  const maxType = Math.max(1, ...stats.byType.map((x) => x.n));
  const maxCity = Math.max(1, ...stats.byCity.map((x) => x.n));
  const maxDay = Math.max(1, ...stats.perDay.map((x) => x.n));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-light">Control room dashboard</h1>
        <a href="/api/admin/export" className="btn btn-ghost">⬇ Export CSV</a>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Open faults" value={t.open} tone="text-orange-600" />
        <Stat label="Critical open" value={t.critical} tone="text-red-600" />
        <Stat label="Need a crew" value={t.unassigned} tone="text-amber-600" />
        <Stat label="Reported (24h)" value={t.today} />
        <Stat label="Resolved" value={t.resolved} tone="text-emerald-600" />
        <Stat label="Total faults" value={t.total} />
        <Stat label="Avg fix time" value={t.avg_hours != null ? `${t.avg_hours} h` : "—"} />
        <Stat label="Customer rating" value={t.avg_rating != null ? `${t.avg_rating} ★` : "—"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card space-y-2">
          <h2 className="font-normal">Faults — last 7 days</h2>
          {stats.perDay.map((d) => <Bar key={d.day} label={d.day} value={d.n} max={maxDay} color="bg-brand" />)}
        </div>
        <div className="card space-y-2">
          <h2 className="font-normal">By status</h2>
          {stats.byStatus.map((s) => <Bar key={s.status} label={STATUS_LABEL[s.status]} value={s.n} max={t.total} color="bg-indigo-500" />)}
          <h2 className="font-normal pt-3">By fault type</h2>
          {stats.byType.map((s) => <Bar key={s.type} label={typeLabel(s.type)} value={s.n} max={maxType} color="bg-sky-500" />)}
        </div>
        <div className="card space-y-2">
          <h2 className="font-normal">Hotspots (by city)</h2>
          {stats.byCity.length === 0 && <p className="text-sm text-slate-500">No data yet.</p>}
          {stats.byCity.map((s) => <Bar key={s.city} label={`${s.city} (${s.open} open)`} value={s.n} max={maxCity} color="bg-orange-500" />)}
        </div>
        <div className="card space-y-2">
          <h2 className="font-normal">Crew workload</h2>
          {stats.techs.map((x) => (
            <div key={x.id} className="flex justify-between text-sm border-b last:border-0 py-1">
              <span>🔧 {x.name}</span>
              <span><b>{x.open}</b> active · {x.done} done</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-normal text-lg">Needs attention</h2>
          <Link href="/admin/faults?status=open" className="text-brand text-sm font-semibold">View all open →</Link>
        </div>
        <FaultList faults={urgent} base="/admin/faults" staff />
      </div>
    </div>
  );
}
