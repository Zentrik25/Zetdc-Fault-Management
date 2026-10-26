import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { query } from "@/lib/db";
import { fmtDateTime, timeAgo, typeIcon, typeLabel } from "@/lib/constants";
import { activeAnnouncements, fmtDay, upcomingShedding } from "@/lib/public";
import { listFaults } from "@/lib/faults";
import FaultList from "@/components/FaultList";
import Announcements from "@/components/Announcements";
import { Stat } from "@/components/ui";

export default async function Page() {
  const u = await requirePage("customer");
  const [[s], active, notifications, toRate, cities, shedding, notices] = await Promise.all([
    query<{ open: number; resolved: number; total: number }>(
      `SELECT count(*) FILTER (WHERE status IN ('reported','acknowledged','assigned','in_progress'))::int AS open,
              count(*) FILTER (WHERE status='resolved')::int AS resolved,
              count(*)::int AS total
       FROM faults WHERE user_id=$1`,
      [u.id],
    ),
    listFaults(u, { status: "open" }, 5),
    query<{ id: number; fault_id: number | null; message: string; read: boolean; created_at: Date }>(
      "SELECT id, fault_id, message, read, created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5",
      [u.id],
    ),
    query<{ id: number; ticket: string; type: string }>(
      "SELECT id, ticket, type FROM faults WHERE user_id=$1 AND status='resolved' AND rating IS NULL ORDER BY resolved_at DESC LIMIT 3",
      [u.id],
    ),
    query<{ city: string }>("SELECT DISTINCT city FROM faults WHERE user_id=$1", [u.id]),
    upcomingShedding(),
    activeAnnouncements(),
  ]);
  const mine = new Set(cities.map((c) => c.city));
  const slots = (mine.size ? shedding.filter((r) => mine.has(r.city)) : shedding).slice(0, 4);
  const firstName = u.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light">Hello, {firstName}</h1>
          <p className="text-muted text-sm mt-1">Here&apos;s what&apos;s happening with your electricity faults.</p>
        </div>
        <Link href="/report" className="btn">⚡ Report a fault</Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Open" value={s.open} tone="text-orange-600" />
        <Stat label="Resolved" value={s.resolved} tone="text-emerald-600" />
        <Stat label="Reported" value={s.total} />
      </div>

      {toRate.length > 0 && (
        <div className="card !border-emerald-300 bg-emerald-50/50 space-y-2">
          <div className="font-medium text-ink">✅ Repairs waiting for your feedback</div>
          {toRate.map((f) => (
            <Link key={f.id} href={`/my-faults/${f.id}`} className="flex items-center justify-between gap-2 text-sm bg-white border border-line rounded p-2 hover:border-brand">
              <span>{typeIcon(f.type)} {typeLabel(f.type)} · {f.ticket}</span>
              <span className="text-brand">Rate or reopen →</span>
            </Link>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-normal">Active faults</h2>
              <Link href="/my-faults" className="text-sm text-brand">View all →</Link>
            </div>
            {active.length ? (
              <FaultList faults={active} base="/my-faults" />
            ) : (
              <div className="card text-center py-10 space-y-3">
                <div className="text-4xl">💡</div>
                <div className="text-ink">No active faults. All good!</div>
                <Link href="/report" className="btn">Report a fault</Link>
              </div>
            )}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-normal">Recent updates</h2>
              <Link href="/notifications" className="text-sm text-brand">All notifications →</Link>
            </div>
            {notifications.length === 0 && <div className="card text-sm text-muted text-center py-6">Updates on your faults will appear here.</div>}
            {notifications.map((n) => (
              <Link key={n.id} href={n.fault_id ? `/my-faults/${n.fault_id}` : "/notifications"} className={`card block !p-3 ${n.read ? "" : "!border-brand bg-blue-50/60"}`}>
                <div className="text-sm">{n.message}</div>
                <div className="text-xs text-muted">{timeAgo(n.created_at)} · {fmtDateTime(n.created_at)}</div>
              </Link>
            ))}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-normal">Quick actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {[
                ["/report", "⚡", "Report a fault"],
                ["/my-faults", "📋", "My faults"],
                ["/outages", "🗺️", "Outage map"],
                ["/load-shedding", "⏱️", "Load shedding"],
              ].map(([href, icon, label]) => (
                <Link key={href} href={href} className="card lift !p-3 flex items-center gap-3 text-sm text-ink">
                  <span className="text-xl">{icon}</span> {label}
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-normal">⏱️ Upcoming load shedding</h2>
            {slots.length === 0 && <div className="card text-sm text-muted">Nothing scheduled{mine.size ? " in your area" : ""}.</div>}
            {slots.map((r) => (
              <div key={r.id} className="card !p-3 text-sm flex items-center gap-3">
                <div className="font-mono text-brand tnum">{r.start}–{r.end}</div>
                <div className="flex-1"><b className="font-medium">{r.area}</b>, {r.city}<div className="text-xs text-muted">{fmtDay(r.d)}</div></div>
                {r.stage && <span className="text-xs bg-amber-100 text-amber-800 rounded px-2 py-0.5">Stage {r.stage}</span>}
              </div>
            ))}
            <Link href="/load-shedding" className="text-sm text-brand">Full schedule →</Link>
          </section>

          {notices.length > 0 && <Announcements items={notices.slice(0, 2)} />}
        </aside>
      </div>
    </div>
  );
}
