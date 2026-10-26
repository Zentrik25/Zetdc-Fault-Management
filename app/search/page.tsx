import Link from "next/link";
import { requirePage } from "@/lib/auth";
import { globalSearch } from "@/lib/search";
import { fmtDateTime, timeAgo } from "@/lib/constants";
import { fmtDay } from "@/lib/public";
import FaultList from "@/components/FaultList";
import Announcements from "@/components/Announcements";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const u = await requirePage();
  const { q = "" } = await searchParams;
  const r = await globalSearch(u, q);
  const total = r.faults.length + r.users.length + r.notices.length + r.shedding.length + r.notifications.length + r.pages.length;
  const base = u.role === "customer" ? "/my-faults" : "/admin/faults";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-light">{r.q.length >= 2 ? <>Results for “{r.q}”</> : "Search"}</h1>
        <p className="text-sm text-muted mt-1">
          {r.q.length < 2 ? "Type at least 2 characters in the search box above." : `${total} result${total === 1 ? "" : "s"} across faults, pages, notices, load shedding and more.`}
        </p>
      </div>

      {r.q.length >= 2 && total === 0 && (
        <div className="card text-center py-10 space-y-2">
          <div className="text-4xl">🔎</div>
          <div className="text-ink">Nothing found for “{r.q}”.</div>
          <div className="text-sm text-muted">Try a ticket number (e.g. ZET-2026-000001), a suburb, a fault type like “transformer”{u.role === "admin" ? ", or a customer name" : ""}.</div>
        </div>
      )}

      {r.pages.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-normal">Pages</h2>
          <div className="flex flex-wrap gap-2">
            {r.pages.map((p) => (
              <Link key={p.href} href={p.href} className="card lift !py-2 !px-3 text-sm text-ink flex items-center gap-2"><span>{p.icon}</span>{p.label}</Link>
            ))}
          </div>
        </section>
      )}

      {r.faults.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-normal">Faults <span className="text-sm text-muted">({r.faults.length})</span></h2>
          <FaultList faults={r.faults} base={base} staff={u.role !== "customer"} />
        </section>
      )}

      {r.users.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-normal">Users <span className="text-sm text-muted">({r.users.length})</span></h2>
            <Link href={`/admin/users?q=${encodeURIComponent(r.q)}`} className="text-sm text-brand">Open in Users →</Link>
          </div>
          {r.users.map((x) => (
            <Link key={x.id} href={`/admin/users?q=${encodeURIComponent(x.email)}`} className="card lift !p-3 flex items-center gap-3 text-sm">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">{x.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-ink truncate">{x.name} {!x.active && <span className="text-xs text-red-600">(deactivated)</span>}</div>
                <div className="text-xs text-muted truncate">{x.email} · {x.phone ?? "no phone"}</div>
              </div>
              <span className="text-xs capitalize bg-slate-100 rounded px-2 py-0.5">{x.role}</span>
            </Link>
          ))}
        </section>
      )}

      {r.shedding.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-normal">⏱️ Load shedding</h2>
          {r.shedding.map((s) => (
            <Link key={s.id} href={`/load-shedding?city=${encodeURIComponent(s.city)}`} className="card lift !p-3 flex items-center gap-3 text-sm">
              <span className="font-mono text-brand tnum">{s.start}–{s.end}</span>
              <span className="flex-1"><b className="font-medium">{s.area}</b>, {s.city}<span className="block text-xs text-muted">{fmtDay(s.d)}</span></span>
              {s.stage && <span className="text-xs bg-amber-100 text-amber-800 rounded px-2 py-0.5">Stage {s.stage}</span>}
            </Link>
          ))}
        </section>
      )}

      {r.notices.length > 0 && <Announcements items={r.notices} />}

      {r.notifications.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-normal">🔔 Notifications</h2>
          {r.notifications.map((n) => (
            <Link key={n.id} href={n.fault_id ? `${base}/${n.fault_id}` : "/notifications"} className="card lift !p-3 text-sm block">
              {n.message}
              <span className="block text-xs text-muted">{timeAgo(n.created_at)} · {fmtDateTime(n.created_at)}</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
