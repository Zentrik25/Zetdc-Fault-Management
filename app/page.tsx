import Link from "next/link";
import { getUser, homeFor } from "@/lib/auth";
import { query } from "@/lib/db";
import { activeAnnouncements } from "@/lib/public";
import Announcements from "@/components/Announcements";

export default async function Home() {
  const [user, [s], notices] = await Promise.all([
    getUser(),
    query<{ open: number; resolved: number; avg: number | null }>(
      `SELECT count(*) FILTER (WHERE status IN ('reported','acknowledged','assigned','in_progress'))::int AS open,
              count(*) FILTER (WHERE status='resolved')::int AS resolved,
              round((avg(extract(epoch FROM (resolved_at-created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL))::numeric,1)::float AS avg
       FROM faults`,
    ),
    activeAnnouncements(),
  ]);
  return (
    <div className="space-y-8">
      <section className="bg-brand text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" aria-hidden className="absolute -right-16 -bottom-16 w-72 sm:w-96 opacity-10 select-none pointer-events-none" />
        <h1 className="text-3xl sm:text-5xl font-extrabold max-w-2xl leading-tight">No power? Report it. Track it. Get it fixed.</h1>
        <p className="mt-4 max-w-xl text-blue-100">
          Report electricity faults to ZETDC in under a minute — drop a pin on the map, add a photo, and follow the crew&apos;s progress in real time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {user ? (
            <Link href={homeFor(user.role)} className="btn bg-accent !text-brand-dark hover:!bg-yellow-400">Go to my dashboard →</Link>
          ) : (
            <>
              <Link href="/register" className="btn bg-accent !text-brand-dark hover:!bg-yellow-400">Report a fault</Link>
              <Link href="/login" className="btn btn-ghost">Log in</Link>
            </>
          )}
          <Link href="/outages" className="btn btn-ghost">View outage map</Link>
          <Link href="/load-shedding" className="btn btn-ghost">Load shedding</Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        <div className="card"><div className="text-3xl font-bold text-orange-600">{s.open}</div><div className="text-xs text-slate-500">faults being handled</div></div>
        <div className="card"><div className="text-3xl font-bold text-emerald-600">{s.resolved}</div><div className="text-xs text-slate-500">faults resolved</div></div>
        <div className="card"><div className="text-3xl font-bold text-brand">{s.avg ?? "—"}{s.avg != null && <span className="text-base"> h</span>}</div><div className="text-xs text-slate-500">average fix time</div></div>
      </section>

      <Announcements items={notices} />

      <section className="grid sm:grid-cols-4 gap-3">
        {[
          ["1", "Sign up", "Create a free account with your email."],
          ["2", "Report", "Pick the fault, pin the location, add photos."],
          ["3", "Track", "Get a ticket number and live status updates."],
          ["4", "Rate", "Confirm it is fixed, or reopen it."],
        ].map(([n, t, d]) => (
          <div key={n} className="card">
            <div className="w-8 h-8 rounded-full bg-accent text-brand-dark font-bold grid place-items-center mb-2">{n}</div>
            <div className="font-semibold">{t}</div>
            <div className="text-sm text-slate-600">{d}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
