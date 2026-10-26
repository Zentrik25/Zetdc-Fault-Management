import Link from "next/link";
import { getUser, homeFor } from "@/lib/auth";
import { query } from "@/lib/db";
import { FAULT_TYPES } from "@/lib/constants";
import { activeAnnouncements, fmtDay, upcomingShedding } from "@/lib/public";
import Announcements from "@/components/Announcements";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";

export default async function Home() {
  const [user, [s], notices, shedding] = await Promise.all([
    getUser(),
    query<{ open: number; resolved: number; total: number; avg: number | null; rating: number | null }>(
      `SELECT count(*) FILTER (WHERE status IN ('reported','acknowledged','assigned','in_progress'))::int AS open,
              count(*) FILTER (WHERE status='resolved')::int AS resolved,
              count(*)::int AS total,
              round((avg(extract(epoch FROM (resolved_at-created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL))::numeric,1)::float AS avg,
              round(avg(rating)::numeric,1)::float AS rating
       FROM faults`,
    ),
    activeAnnouncements(),
    upcomingShedding(),
  ]);
  const cta = user ? { href: homeFor(user.role), label: user.role === "customer" ? "Go to my dashboard →" : "Open control room →" } : { href: "/register", label: "Report a fault" };
  const reportHref = user?.role === "customer" ? "/report" : cta.href;

  return (
    <div className="-mt-6">
      {/* HERO */}
      <section className="full-bleed relative overflow-hidden bg-brand-dark text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero.jpg" alt="" className="kenburns absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/75 to-brand-dark/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 pt-14 pb-28 sm:pt-24 sm:pb-36">
          <div className="anim-up inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs sm:text-sm" style={{ animationDelay: "50ms" }}>
            <span className="live-dot" />
            Live · {s.open} {s.open === 1 ? "fault" : "faults"} being handled right now
          </div>
          <h1 className="anim-up mt-5 text-[2.35rem] sm:text-6xl font-light leading-[1.04] max-w-3xl !text-white" style={{ animationDelay: "180ms", letterSpacing: "-0.035em" }}>
            No power? <span className="bg-gradient-to-r from-[#ff6a5c] to-[#ffc83d] bg-clip-text text-transparent">Report it.</span> Track it. Get it fixed.
          </h1>
          <p className="anim-up mt-5 max-w-xl text-base sm:text-lg font-light text-blue-100" style={{ animationDelay: "320ms" }}>
            Zimbabwe&apos;s electricity fault reporting platform. Drop a pin, add a photo, and follow the crew&apos;s progress in real time — from your phone or computer.
          </p>
          <div className="anim-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "460ms" }}>
            <Link href={cta.href} className="btn !bg-white !text-brand hover:!bg-blue-50 !px-6 !py-3 text-base shadow-lg">
              <span className="bolt">⚡</span> {cta.label}
            </Link>
            <Link href="/outages" className="btn glass !bg-white/10 hover:!bg-white/20 !text-white !px-6 !py-3 text-base">View outage map</Link>
          </div>
          <div className="anim-up mt-10 hidden sm:flex gap-3" style={{ animationDelay: "620ms" }}>
            {[
              ["24/7", "online reporting"],
              ["GPS", "pin-point location"],
              ["Live", "status tracking"],
            ].map(([a, b], i) => (
              <div key={a} className="glass rounded-xl px-5 py-3 float" style={{ animationDelay: `${i * 0.7}s` }}>
                <div className="text-xl font-light tnum">{a}</div>
                <div className="text-xs text-blue-100">{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 text-white/70 text-xl bob hidden sm:block" aria-hidden>⌄</div>
        <svg className="absolute bottom-0 left-0 w-full text-white" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0 60V30C240 0 480 0 720 22s480 30 720 4v34z" />
        </svg>
      </section>

      {/* QUICK ACTIONS */}
      <section className="relative -mt-10 sm:-mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          [reportHref, "⚡", "Report a fault", "Takes under a minute"],
          [user?.role === "customer" ? "/my-faults" : cta.href, "📋", user ? "My faults" : "Track my faults", "Live status & timeline"],
          ["/outages", "🗺️", "Outage map", "See what's affected"],
          ["/load-shedding", "⏱️", "Load shedding", "Know before it happens"],
        ].map(([href, icon, t, d], i) => (
          <Reveal key={t} delay={i * 80}>
            <Link href={href} className="card lift block h-full !p-4 sm:!p-5 shadow-sm">
              <div className="text-3xl">{icon}</div>
              <div className="mt-2 text-lg font-normal text-ink tracking-tight">{t}</div>
              <div className="text-xs sm:text-sm text-slate-500">{d}</div>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-16 sm:mt-24">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <div className="text-xs font-normal tracking-widest text-brand uppercase">How it works</div>
            <h2 className="text-2xl sm:text-4xl font-light mt-1">From fault to fixed in four steps</h2>
          </div>
        </Reveal>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {[
            ["1", "Sign up", "Create a free account with just your email — no verification codes.", "👤"],
            ["2", "Report", "Choose the fault, pin the location on the map and attach photos.", "📍"],
            ["3", "Track", "Get a ticket number. Watch it move from reported to resolved.", "📡"],
            ["4", "Confirm", "Rate the repair, or reopen the fault if it isn't fixed.", "✅"],
          ].map(([n, t, d, icon], i) => (
            <Reveal key={n} delay={i * 120}>
              <div className="card lift h-full relative overflow-hidden">
                <div className="absolute -right-2 -top-4 text-8xl font-light text-slate-100 select-none">{n}</div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-accent/90 text-2xl grid place-items-center">{icon}</div>
                  <div className="mt-3 text-xl font-light text-ink tracking-tight">{t}</div>
                  <div className="text-sm text-slate-600 mt-1">{d}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* STATS BAND */}
      <section className="full-bleed mt-16 sm:mt-24 bg-brand-dark text-white relative overflow-hidden">
        <div className="absolute -left-24 -bottom-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-ruby/40 to-accent/30 blur-3xl" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" aria-hidden className="absolute -right-24 -top-24 w-96 opacity-[0.07] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            [<CountUp key="a" value={s.total} />, "faults reported"],
            [<CountUp key="b" value={s.resolved} />, "faults resolved"],
            [s.avg != null ? <CountUp key="c" value={s.avg} decimals={1} suffix=" h" /> : "—", "average fix time"],
            [s.rating != null ? <CountUp key="d" value={s.rating} decimals={1} suffix=" ★" /> : "—", "customer rating"],
          ].map(([v, l], i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="text-4xl sm:text-5xl font-light tnum text-white">{v}</div>
              <div className="text-sm text-blue-100 mt-1">{l}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="mt-16 sm:mt-24">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <div className="text-xs font-normal tracking-widest text-brand uppercase">Built for everyone</div>
            <h2 className="text-2xl sm:text-4xl font-light mt-1">One system, three roles</h2>
          </div>
        </Reveal>
        <div className="mt-8 grid lg:grid-cols-3 gap-4">
          {[
            ["🏠", "Customers", ["Report with photos and GPS", "Follow the same fault as neighbours", "Notifications on every update", "Rate and reopen if not fixed", "Load shedding & outage map"]],
            ["🔧", "Technicians", ["See only your assigned jobs", "Navigate straight to the fault", "Update progress from the field", "Record what was fixed"]],
            ["🛰️", "Control room", ["Live dashboard & hotspot map", "Assign crews, set priorities", "Merge duplicate reports", "Overdue alerts, CSV export", "Publish notices & schedules"]],
          ].map(([icon, t, items], i) => (
            <Reveal key={t as string} delay={i * 120}>
              <div className="card lift h-full">
                <div className="text-4xl">{icon as string}</div>
                <h3 className="font-light text-2xl mt-2 tracking-tight">{t as string}</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {(items as string[]).map((x) => (
                    <li key={x} className="flex gap-2"><span className="text-emerald-600 font-bold">✓</span>{x}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAULT TYPES MARQUEE */}
      <section className="mt-16 sm:mt-24">
        <Reveal><h2 className="text-center text-xl font-light text-ink">We handle every kind of electrical fault</h2></Reveal>
        <div className="marquee full-bleed overflow-hidden mt-4 py-2">
          <div className="marquee-track gap-3 pr-3">
            {[...FAULT_TYPES, ...FAULT_TYPES].map((t, i) => (
              <span key={i} className="card !py-2.5 !px-4 whitespace-nowrap text-sm font-medium shadow-sm">{t.icon} {t.label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* NOTICES + LOAD SHEDDING */}
      {(notices.length > 0 || shedding.length > 0) && (
        <section className="mt-16 sm:mt-24 grid lg:grid-cols-2 gap-6">
          {notices.length > 0 && <Reveal><Announcements items={notices.slice(0, 3)} /></Reveal>}
          {shedding.length > 0 && (
            <Reveal delay={100}>
              <div className="space-y-2">
                <h2 className="font-normal text-lg">⏱️ Upcoming load shedding</h2>
                {shedding.slice(0, 4).map((r) => (
                  <div key={r.id} className="card !p-3 flex items-center gap-3 text-sm">
                    <div className="font-mono font-bold text-brand">{r.start}–{r.end}</div>
                    <div className="flex-1"><b>{r.area}</b>, {r.city}<div className="text-xs text-slate-500">{fmtDay(r.d)}</div></div>
                    {r.stage && <span className="text-xs bg-amber-100 text-amber-800 rounded px-2 py-0.5 font-medium">Stage {r.stage}</span>}
                  </div>
                ))}
                <Link href="/load-shedding" className="text-sm font-semibold text-brand">Full schedule →</Link>
              </div>
            </Reveal>
          )}
        </section>
      )}

      {/* CTA */}
      <Reveal className="mt-16 sm:mt-24 mb-6">
        <div className="rounded-xl bg-brand-dark text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-lg">
          <div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-gradient-to-br from-ruby/50 to-accent/40 blur-3xl" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" aria-hidden className="absolute -left-16 -bottom-16 w-64 opacity-10 pointer-events-none" />
          <h2 className="relative text-2xl sm:text-4xl font-light !text-white">Power cut? Don&apos;t wait in the dark.</h2>
          <p className="relative mt-3 text-blue-100 max-w-lg mx-auto">Report it now and the nearest crew will be on its way. It takes less than a minute.</p>
          <Link href={reportHref} className="relative btn !bg-white !text-brand hover:!bg-blue-50 !px-8 !py-3 text-base mt-6 shadow-lg">
            <span className="bolt">⚡</span> {user ? "Report a fault" : "Get started — it's free"}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
